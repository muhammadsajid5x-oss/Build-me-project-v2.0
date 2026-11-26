import { desc, eq, sql } from "drizzle-orm";

export type Testimonial = {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  location: string | null;
  source: string | null;
  tags: string[];
  avatar: string | null;
  category: string | null;
  content: string;
  rating: number;
  communications: number | null;
  timelines: number | null;
  knowledge: number | null;
  value: number | null;
  outcome: string | null;
  helpfulCount: number;
  storyUrl: string | null;
  verified: boolean;
  published: boolean;
  createdAt: string;
};

export type PaginatedTestimonials = {
  data: Testimonial[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: {
    averageRating: number;
    reviewCount: number;
  };
};

export type PromoteFeedbackToTestimonialResult =
  | { kind: "created"; data: Testimonial }
  | { kind: "not_found" }
  | { kind: "not_publishable" }
  | { kind: "already_promoted" };

async function getDatabase() {
  const [{ db }, { testimonials }] = await Promise.all([
    import("../../../../database/dist/drizzle/client.js"),
    import("../../../../database/dist/schema/testimonials.js"),
  ]);

  return { db, testimonials };
}

export async function promoteApprovedFeedbackToTestimonial(
  feedbackId: string,
): Promise<PromoteFeedbackToTestimonialResult> {
  const [{ db, testimonials }, { feedback }] = await Promise.all([
    getDatabase(),
    import("../../../../database/dist/schema/feedback.js"),
  ]);

  const [sourceFeedback] = await db
    .select({
      id: feedback.id,
      status: feedback.status,
      name: feedback.name,
      role: feedback.role,
      company: feedback.company,
      location: feedback.location,
      source: feedback.source,
      tags: feedback.tags,
      rating: feedback.rating,
      communications: feedback.communications,
      timelines: feedback.timelines,
      knowledge: feedback.knowledge,
      value: feedback.value,
      content: feedback.content,
      outcome: feedback.outcome,
    })
    .from(feedback)
    .where(eq(feedback.id, feedbackId))
    .limit(1);

  if (!sourceFeedback) {
    return { kind: "not_found" };
  }

  if (sourceFeedback.status !== "approved") {
    return { kind: "not_publishable" };
  }

  if (
    sourceFeedback.rating === null ||
    sourceFeedback.rating < 1 ||
    sourceFeedback.rating > 5
  ) {
    return { kind: "not_publishable" };
  }

  const [created] = await db
    .insert(testimonials)
    .values({
      sourceFeedbackId: sourceFeedback.id,
      name: sourceFeedback.name,
      role: sourceFeedback.role,
      company: sourceFeedback.company,
      location: sourceFeedback.location,
      source: sourceFeedback.source,
      tags: sourceFeedback.tags ?? [],
      avatar: null,
      category: sourceFeedback.source ?? "Customer Review",
      content: sourceFeedback.content,
      rating: sourceFeedback.rating,
      communications: sourceFeedback.communications,
      timelines: sourceFeedback.timelines,
      knowledge: sourceFeedback.knowledge,
      value: sourceFeedback.value,
      outcome: sourceFeedback.outcome,
      published: true,
      verified: true,
    })
    .onConflictDoNothing({
      target: testimonials.sourceFeedbackId,
    })
    .returning({
      id: testimonials.id,
      name: testimonials.name,
      role: testimonials.role,
      company: testimonials.company,
      location: testimonials.location,
      source: testimonials.source,
      tags: testimonials.tags,
      avatar: testimonials.avatar,
      category: testimonials.category,
      content: testimonials.content,
      rating: testimonials.rating,
      communications: testimonials.communications,
      timelines: testimonials.timelines,
      knowledge: testimonials.knowledge,
      value: testimonials.value,
      outcome: testimonials.outcome,
      helpfulCount: testimonials.helpfulCount,
      storyUrl: testimonials.storyUrl,
      verified: testimonials.verified,
      published: testimonials.published,
      createdAt: testimonials.createdAt,
    });

  if (!created) {
    return { kind: "already_promoted" };
  }

  return {
    kind: "created",
    data: {
      ...created,
      createdAt: created.createdAt.toISOString(),
    },
  };
}

export async function listPublishedTestimonials(
  page = 1,
  limit = 20,
): Promise<PaginatedTestimonials> {
  const { db, testimonials } = await getDatabase();

  const safePage = Math.max(1, Math.floor(page));
  const safeLimit = Math.min(100, Math.max(1, Math.floor(limit)));
  const offset = (safePage - 1) * safeLimit;

  const rows = await db
    .select({
      id: testimonials.id,
      name: testimonials.name,
      role: testimonials.role,
      company: testimonials.company,
      location: testimonials.location,
      source: testimonials.source,
      tags: testimonials.tags,
      avatar: testimonials.avatar,
      category: testimonials.category,
      content: testimonials.content,
      rating: testimonials.rating,
      communications: testimonials.communications,
      timelines: testimonials.timelines,
      knowledge: testimonials.knowledge,
      value: testimonials.value,
      outcome: testimonials.outcome,
      helpfulCount: testimonials.helpfulCount,
      storyUrl: testimonials.storyUrl,
      verified: testimonials.verified,
      published: testimonials.published,
      createdAt: testimonials.createdAt,
    })
    .from(testimonials)
    .where(eq(testimonials.published, true))
    .orderBy(desc(testimonials.createdAt))
    .limit(safeLimit)
    .offset(offset);

  const countRows = await db
    .select({
      id: testimonials.id,
    })
    .from(testimonials)
    .where(eq(testimonials.published, true));

  const total = countRows.length;
  const totalPages = total === 0 ? 0 : Math.ceil(total / safeLimit);

  const ratingRows = await db
    .select({
      averageRating: sql<number>`avg(${testimonials.rating})`,
    })
    .from(testimonials)
    .where(eq(testimonials.published, true));

  const averageRating = Number(ratingRows[0]?.averageRating ?? 0);

  return {
    data: rows.map((testimonial) => ({
      ...testimonial,
      tags: testimonial.tags ?? [],
      createdAt: testimonial.createdAt.toISOString(),
    })),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages,
    },
    summary: {
      averageRating,
      reviewCount: total,
    },
  };
}

export async function incrementTestimonialHelpfulCount(
  testimonialId: string,
): Promise<number | null> {
  const { db, testimonials } = await getDatabase();

  const updated = await db
    .update(testimonials)
    .set({
      helpfulCount: sql`${testimonials.helpfulCount} + 1`,
      updatedAt: new Date(),
    })
    .where(
      sql`${testimonials.id} = ${testimonialId} AND ${testimonials.published} = true`,
    )
    .returning({
      helpfulCount: testimonials.helpfulCount,
    });

  return updated[0]?.helpfulCount ?? null;
}
