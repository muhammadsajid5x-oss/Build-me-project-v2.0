import { desc, eq } from "drizzle-orm";

/**
 * Source value used for every persisted Coffee With Me request.
 * This value is owned by the server and is never accepted from the client.
 */
export const COFFEE_WITH_ME_REQUEST_SOURCE = "coffee-with-me";

/**
 * Status assigned to every newly created Coffee With Me request.
 */
export const COFFEE_WITH_ME_REQUEST_STATUS = "new" as const;

export type CoffeeWithMeRequestStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "converted"
  | "lost";

/**
 * The Coffee With Me request fields a client is allowed to provide.
 */
export type CoffeeWithMeRequestInput = {
  name: string;
  email: string;
  topic: string;
  preferredFormat?: string;
  availability?: string;
};

/**
 * The persisted Coffee With Me request returned after successful creation.
 */
export type CoffeeWithMeRequest = {
  id: string;
  name: string;
  email: string;
  source: string;
  status: CoffeeWithMeRequestStatus;
  createdAt: string;
  topic: string;
  preferredFormat?: string;
  availability?: string;
};

/**
 * The Coffee With Me request fields exposed to administrators.
 */
export type CoffeeWithMeRequestSummary = {
  id: string;
  name: string;
  email: string;
  topic: string;
  preferredFormat?: string;
  availability?: string;
  status: CoffeeWithMeRequestStatus;
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
 * Creates a new persisted Coffee With Me request.
 *
 * Source, status and timestamps are owned by the server/database.
 * Only validated visitor fields are inserted.
 */
export async function createCoffeeWithMeRequest(
  input: CoffeeWithMeRequestInput,
): Promise<CoffeeWithMeRequest> {
  const { db, leads } = await getDatabase();

  const [created] = await db
    .insert(leads)
    .values({
      name: input.name,
      email: input.email,
      source: COFFEE_WITH_ME_REQUEST_SOURCE,
      status: COFFEE_WITH_ME_REQUEST_STATUS,
      topic: input.topic,
      preferredFormat: input.preferredFormat ?? null,
      availability: input.availability ?? null,
    })
    .returning({
      id: leads.id,
      name: leads.name,
      email: leads.email,
      source: leads.source,
      status: leads.status,
      createdAt: leads.createdAt,
      topic: leads.topic,
      preferredFormat: leads.preferredFormat,
      availability: leads.availability,
    });

  if (!created) {
    throw new Error("Failed to persist the Coffee With Me request.");
  }

  return {
    id: created.id,
    name: created.name,
    email: created.email,
    source: created.source ?? COFFEE_WITH_ME_REQUEST_SOURCE,
    status: created.status,
    createdAt: created.createdAt.toISOString(),
    topic: created.topic ?? input.topic,
    ...(created.preferredFormat
      ? { preferredFormat: created.preferredFormat }
      : {}),
    ...(created.availability ? { availability: created.availability } : {}),
  };
}

/**
 * Lists persisted Coffee With Me requests, newest first.
 */
export async function listCoffeeWithMeRequests(): Promise<
  CoffeeWithMeRequestSummary[]
> {
  const { db, leads } = await getDatabase();

  try {
    const rows = await db
      .select({
        id: leads.id,
        name: leads.name,
        email: leads.email,
        topic: leads.topic,
        preferredFormat: leads.preferredFormat,
        availability: leads.availability,
        status: leads.status,
        createdAt: leads.createdAt,
      })
      .from(leads)
      .where(eq(leads.source, COFFEE_WITH_ME_REQUEST_SOURCE))
      .orderBy(desc(leads.createdAt));

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      topic: row.topic ?? "",
      ...(row.preferredFormat ? { preferredFormat: row.preferredFormat } : {}),
      ...(row.availability ? { availability: row.availability } : {}),
      status: row.status,
      createdAt: row.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("COFFEE WITH ME DATABASE ERROR:", error);
    throw error;
  }
}
