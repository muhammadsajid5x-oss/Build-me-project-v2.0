import { desc, eq } from "drizzle-orm";

/**
 * Source value used for every persisted Ownership Learning Circle request.
 * This value is owned by the server and is never accepted from the client.
 */
export const OWNERSHIP_LEARNING_CIRCLE_SOURCE = "ownership-learning-circle";

/**
 * Status assigned to every newly created Learning Circle request.
 */
export const OWNERSHIP_LEARNING_CIRCLE_STATUS = "new" as const;

export type OwnershipLearningCircleRequestStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "converted"
  | "lost";

/**
 * The Learning Circle request fields a client is allowed to provide.
 */
export type OwnershipLearningCircleRequestInput = {
  name: string;
  email: string;
};

/**
 * The persisted Learning Circle request returned after successful creation.
 */
export type OwnershipLearningCircleRequest = {
  id: string;
  name: string;
  email: string;
  source: string;
  status: OwnershipLearningCircleRequestStatus;
  createdAt: string;
};

/**
 * The Learning Circle request fields exposed to administrators.
 */
export type OwnershipLearningCircleRequestSummary = {
  id: string;
  name: string;
  email: string;
  status: OwnershipLearningCircleRequestStatus;
  createdAt: string;
};

async function getDatabase() {
  const [{ db }, { leads }] = await Promise.all([
    import("../../../../database/dist/drizzle/client.js"),
    import("../../../../database/dist/schema/leads.js"),
  ]);

  return { db, leads };
}

/**
 * Creates a new persisted Ownership Learning Circle request.
 *
 * Source, status and timestamps are owned by the server/database.
 * Only validated visitor fields are inserted.
 */
export async function createOwnershipLearningCircleRequest(
  input: OwnershipLearningCircleRequestInput,
): Promise<OwnershipLearningCircleRequest> {
  const { db, leads } = await getDatabase();

  const [created] = await db
    .insert(leads)
    .values({
      name: input.name,
      email: input.email,
      source: OWNERSHIP_LEARNING_CIRCLE_SOURCE,
      status: OWNERSHIP_LEARNING_CIRCLE_STATUS,
    })
    .returning({
      id: leads.id,
      name: leads.name,
      email: leads.email,
      source: leads.source,
      status: leads.status,
      createdAt: leads.createdAt,
    });

  if (!created) {
    throw new Error("Failed to persist the Ownership Learning Circle request.");
  }

  return {
    id: created.id,
    name: created.name,
    email: created.email,
    source: created.source ?? OWNERSHIP_LEARNING_CIRCLE_SOURCE,
    status: created.status,
    createdAt: created.createdAt.toISOString(),
  };
}

/**
 * Retrieves Learning Circle requests for administrators.
 */
export async function listOwnershipLearningCircleRequests(): Promise<
  OwnershipLearningCircleRequestSummary[]
> {
  const { db, leads } = await getDatabase();

  const requests = await db
    .select({
      id: leads.id,
      name: leads.name,
      email: leads.email,
      status: leads.status,
      createdAt: leads.createdAt,
    })
    .from(leads)
    .where(eq(leads.source, OWNERSHIP_LEARNING_CIRCLE_SOURCE))
    .orderBy(desc(leads.createdAt));

  return requests.map((request) => ({
    id: request.id,
    name: request.name,
    email: request.email,
    status: request.status,
    createdAt: request.createdAt.toISOString(),
  }));
}
