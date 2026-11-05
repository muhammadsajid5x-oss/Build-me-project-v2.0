import { desc, eq } from "drizzle-orm";

/**
 * Source value used for every persisted delivery project request. The value is
 * owned by the server and is never accepted from the client.
 */
export const DELIVERY_PROJECT_REQUEST_SOURCE = "deliver-my-project";

/**
 * Status assigned to every newly created delivery project request. The value
 * is owned by the server and is never accepted from the client.
 */
export const DELIVERY_PROJECT_REQUEST_STATUS = "new" as const;

export type DeliveryProjectRequestStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "converted"
  | "lost";

/**
 * The delivery project request fields a client is allowed to provide.
 */
export type DeliveryProjectRequestInput = {
  name: string;
  email: string;
  projectDescription: string;
  expectedOutcome: string;
  timeline?: string;
  budget?: string;
};

/**
 * The persisted delivery project request returned after a successful create.
 */
export type DeliveryProjectRequest = {
  id: string;
  name: string;
  email: string;
  source: string;
  status: DeliveryProjectRequestStatus;
  createdAt: string;
  projectDescription: string;
  expectedOutcome: string;
  timeline?: string;
  budget?: string;
};

/**
 * The delivery project request fields exposed to administrators. Internal
 * fields such as `updatedAt` are intentionally omitted.
 */
export type DeliveryProjectRequestSummary = {
  id: string;
  name: string;
  email: string;
  projectDescription: string;
  expectedOutcome: string;
  timeline?: string;
  budget?: string;
  status: DeliveryProjectRequestStatus;
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
 * Creates a new persisted delivery project request.
 *
 * The identifier, source, status and timestamps are all owned by the database
 * and the server respectively; only the validated visitor fields are inserted.
 */
export async function createDeliveryProjectRequest(
  input: DeliveryProjectRequestInput,
): Promise<DeliveryProjectRequest> {
  const { db, leads } = await getDatabase();

  const [created] = await db
    .insert(leads)
    .values({
      name: input.name,
      email: input.email,
      source: DELIVERY_PROJECT_REQUEST_SOURCE,
      status: DELIVERY_PROJECT_REQUEST_STATUS,
      projectDescription: input.projectDescription,
      expectedOutcome: input.expectedOutcome,
      timeline: input.timeline ?? null,
      budget: input.budget ?? null,
    })
    .returning({
      id: leads.id,
      name: leads.name,
      email: leads.email,
      source: leads.source,
      status: leads.status,
      createdAt: leads.createdAt,
      projectDescription: leads.projectDescription,
      expectedOutcome: leads.expectedOutcome,
      timeline: leads.timeline,
      budget: leads.budget,
    });

  if (!created) {
    throw new Error("Failed to persist the delivery project request.");
  }

  return {
    id: created.id,
    name: created.name,
    email: created.email,
    source: created.source ?? DELIVERY_PROJECT_REQUEST_SOURCE,
    status: created.status,
    createdAt: created.createdAt.toISOString(),
    projectDescription: created.projectDescription ?? input.projectDescription,
    expectedOutcome: created.expectedOutcome ?? input.expectedOutcome,
    ...(created.timeline ? { timeline: created.timeline } : {}),
    ...(created.budget ? { budget: created.budget } : {}),
  };
}

/**
 * Lists persisted delivery project requests, newest first.
 */
export async function listDeliveryProjectRequests(): Promise<
  DeliveryProjectRequestSummary[]
> {
  const { db, leads } = await getDatabase();

  const rows = await db
    .select({
      id: leads.id,
      name: leads.name,
      email: leads.email,
      projectDescription: leads.projectDescription,
      expectedOutcome: leads.expectedOutcome,
      timeline: leads.timeline,
      budget: leads.budget,
      status: leads.status,
      createdAt: leads.createdAt,
    })
    .from(leads)
    .where(eq(leads.source, DELIVERY_PROJECT_REQUEST_SOURCE))
    .orderBy(desc(leads.createdAt));

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    projectDescription: row.projectDescription ?? "",
    expectedOutcome: row.expectedOutcome ?? "",
    ...(row.timeline ? { timeline: row.timeline } : {}),
    ...(row.budget ? { budget: row.budget } : {}),
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  }));
}
