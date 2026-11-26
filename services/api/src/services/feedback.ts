import { and, desc, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";

import type {
  CreateFeedbackInput,
  FeedbackModerationStatus,
  UpdateFeedbackInput,
} from "../validators/feedback.js";

type UpdateFeedbackStatusResult =
  | {
      kind: "updated";
      data: {
        id: string;
        type: string;
        status: FeedbackModerationStatus;
        updatedAt: Date;
      };
    }
  | { kind: "not_found" }
  | { kind: "not_pending" };

type UpdateFeedbackResult =
  | {
      kind: "updated";
      data: Record<string, unknown>;
    }
  | { kind: "not_found" }
  | { kind: "not_pending" };

type DeleteFeedbackResult =
  | { kind: "deleted"; id: string }
  | { kind: "not_found" }
  | { kind: "not_pending" };

async function getDatabase() {
  const [{ db }, { feedback }] = await Promise.all([
    import("../../../../database/dist/drizzle/client.js"),
    import("../../../../database/dist/schema/feedback.js"),
  ]);

  return { db, feedback };
}

function generateReferenceId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const suffix = randomUUID().replaceAll("-", "").slice(0, 6).toUpperCase();

  return `FB-${timestamp}-${suffix}`;
}

export async function createFeedback(input: CreateFeedbackInput) {
  const { db, feedback } = await getDatabase();

  const referenceId = generateReferenceId();

  const [created] = await db
    .insert(feedback)
    .values({
      referenceId,
      type: input.type,
      name: input.name,
      email: input.email,
      role: input.role,
      company: input.company,
      location: input.location,
      source: input.source ?? "other",
      tags: input.tags ?? [],
      score: input.score,
      rating: input.rating,
      communications: input.communications,
      timelines: input.timelines,
      knowledge: input.knowledge,
      value: input.value,
      title: input.title,
      content: input.content,
      outcome: input.outcome,
    })
    .returning({
      id: feedback.id,
      referenceId: feedback.referenceId,
      type: feedback.type,
      createdAt: feedback.createdAt,
    });

  return created;
}

export async function listFeedback() {
  const { db, feedback } = await getDatabase();

  return db
    .select({
      id: feedback.id,
      referenceId: feedback.referenceId,
      type: feedback.type,
      status: feedback.status,
      name: feedback.name,
      email: feedback.email,
      role: feedback.role,
      company: feedback.company,
      location: feedback.location,
      source: feedback.source,
      tags: feedback.tags,
      score: feedback.score,
      rating: feedback.rating,
      communications: feedback.communications,
      timelines: feedback.timelines,
      knowledge: feedback.knowledge,
      value: feedback.value,
      title: feedback.title,
      content: feedback.content,
      outcome: feedback.outcome,
      createdAt: feedback.createdAt,
      updatedAt: feedback.updatedAt,
    })
    .from(feedback)
    .orderBy(desc(feedback.createdAt));
}

export async function updateFeedback(
  id: string,
  input: UpdateFeedbackInput,
): Promise<UpdateFeedbackResult> {
  const { db, feedback } = await getDatabase();

  const [existing] = await db
    .select({
      id: feedback.id,
      status: feedback.status,
    })
    .from(feedback)
    .where(eq(feedback.id, id))
    .limit(1);

  if (!existing) {
    return { kind: "not_found" };
  }

  if (existing.status !== "pending") {
    return { kind: "not_pending" };
  }

  const [updated] = await db
    .update(feedback)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(and(eq(feedback.id, id), eq(feedback.status, "pending")))
    .returning({
      id: feedback.id,
      referenceId: feedback.referenceId,
      type: feedback.type,
      status: feedback.status,
      name: feedback.name,
      email: feedback.email,
      role: feedback.role,
      company: feedback.company,
      location: feedback.location,
      source: feedback.source,
      tags: feedback.tags,
      score: feedback.score,
      rating: feedback.rating,
      communications: feedback.communications,
      timelines: feedback.timelines,
      knowledge: feedback.knowledge,
      value: feedback.value,
      title: feedback.title,
      content: feedback.content,
      outcome: feedback.outcome,
      createdAt: feedback.createdAt,
      updatedAt: feedback.updatedAt,
    });

  if (!updated) {
    return { kind: "not_pending" };
  }

  return {
    kind: "updated",
    data: updated,
  };
}

export async function updateFeedbackStatus(
  id: string,
  status: FeedbackModerationStatus,
): Promise<UpdateFeedbackStatusResult> {
  const { db, feedback } = await getDatabase();

  const [updated] = await db
    .update(feedback)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(and(eq(feedback.id, id), eq(feedback.status, "pending")))
    .returning({
      id: feedback.id,
      type: feedback.type,
      updatedAt: feedback.updatedAt,
    });

  if (updated) {
    return {
      kind: "updated",
      data: {
        ...updated,
        status,
      },
    };
  }

  const [existing] = await db
    .select({ id: feedback.id })
    .from(feedback)
    .where(eq(feedback.id, id))
    .limit(1);

  return existing ? { kind: "not_pending" } : { kind: "not_found" };
}

export async function deleteFeedback(
  id: string,
): Promise<DeleteFeedbackResult> {
  const { db, feedback } = await getDatabase();

  const [existing] = await db
    .select({
      id: feedback.id,
      status: feedback.status,
    })
    .from(feedback)
    .where(eq(feedback.id, id))
    .limit(1);

  if (!existing) {
    return { kind: "not_found" };
  }

  if (existing.status !== "pending") {
    return { kind: "not_pending" };
  }

  const [deleted] = await db
    .delete(feedback)
    .where(and(eq(feedback.id, id), eq(feedback.status, "pending")))
    .returning({
      id: feedback.id,
    });

  if (!deleted) {
    return { kind: "not_pending" };
  }

  return {
    kind: "deleted",
    id: deleted.id,
  };
}
