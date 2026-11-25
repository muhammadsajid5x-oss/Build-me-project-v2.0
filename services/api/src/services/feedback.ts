import { and, desc, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";

import type {
  CreateFeedbackInput,
  FeedbackModerationStatus,
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
      score: input.score,
      rating: input.rating,
      title: input.title,
      content: input.content,
    })
    .returning({
      id: feedback.id,
      referenceId: feedback.referenceId,
      type: feedback.type,
      name: feedback.name,
      email: feedback.email,
      score: feedback.score,
      rating: feedback.rating,
      title: feedback.title,
      content: feedback.content,
      createdAt: feedback.createdAt,
      updatedAt: feedback.updatedAt,
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
      score: feedback.score,
      rating: feedback.rating,
      title: feedback.title,
      content: feedback.content,
      createdAt: feedback.createdAt,
      updatedAt: feedback.updatedAt,
    })
    .from(feedback)
    .orderBy(desc(feedback.createdAt));
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
