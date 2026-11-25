import { desc, eq, sql } from "drizzle-orm";

export type Testimonial = {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  avatar: string | null;
  category: string | null;
  content: string;
  rating: number;
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
  | { kind: "not_rate" }
  | { kind: "not_approved" }
  | { kind: "invalid_rating" }
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
      type: feedback.type,
      status: feedback.status,
      name: feedback.name,
      rating: feedback.rating,
      content: feedback.content,
    })
    .from(feedback)
    .where(eq(feedback.id, feedbackId))
    .limit(1);

  if (!sourceFeedback) {
    return { kind: "not_found" };
  }

  if (sourceFeedback.type !== "rate") {
    return { kind: "not_rate" };
  }

  if (sourceFeedback.status !== "approved") {
    return { kind: "not_approved" };
  }

  if (sourceFeedback.rating === null) {
    return { kind: "invalid_rating" };
  }

  const [created] = await db
    .insert(testimonials)
    .values({
      sourceFeedbackId: sourceFeedback.id,
      name: sourceFeedback.name,
      role: null,
      company: null,
      avatar: null,
      category: null,
      content: sourceFeedback.content,
      rating: sourceFeedback.rating,
      published: false,
    })
    .onConflictDoNothing({ target: testimonials.sourceFeedbackId })
    .returning({
      id: testimonials.id,
      name: testimonials.name,
      role: testimonials.role,
      company: testimonials.company,
      avatar: testimonials.avatar,
      category: testimonials.category,
      content: testimonials.content,
      rating: testimonials.rating,
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

/**
 * Returns published testimonials for the public website.
 *
 * Pagination is server-side so the API remains the source of truth
 * regardless of how many testimonials exist.
 *
 * The rating summary is calculated from all published testimonials,
 * not only the testimonials on the current page.
 */
export async function listPublishedTestimonials(
  page = 1,
  limit = 4,
): Promise<PaginatedTestimonials> {
  const { db, testimonials } = await getDatabase();

  const safePage = Math.max(1, Math.floor(page));
  const safeLimit = Math.min(20, Math.max(1, Math.floor(limit)));
  const offset = (safePage - 1) * safeLimit;

  const rows = await db
    .select({
      id: testimonials.id,
      name: testimonials.name,
      role: testimonials.role,
      company: testimonials.company,
      avatar: testimonials.avatar,
      category: testimonials.category,
      content: testimonials.content,
      rating: testimonials.rating,
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
      id: testimonial.id,
      name: testimonial.name,
      role: testimonial.role,
      company: testimonial.company,
      avatar: testimonial.avatar,
      category: testimonial.category,
      content: testimonial.content,
      rating: testimonial.rating,
      helpfulCount: testimonial.helpfulCount,
      storyUrl: testimonial.storyUrl,
      verified: testimonial.verified,
      published: testimonial.published,
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

/**
 * Atomically increments the helpful count for a published testimonial.
 *
 * The increment happens in the database so the count remains persistent
 * across page refreshes and different visitors.
 */
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
