import { desc, eq } from "drizzle-orm";

/**
 * Source value used for every persisted Mentor Me request.
 * This value is owned by the server and is never accepted from the client.
 */
export const MENTOR_ME_REQUEST_SOURCE = "mentor-me";

/**
 * Status assigned to every newly created Mentor Me request.
 */
export const MENTOR_ME_REQUEST_STATUS = "new" as const;

export type MentorMeRequestStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "converted"
  | "lost";

/**
 * The Mentor Me request fields a client is allowed to provide.
 */
export type MentorMeRequestInput = {
  name: string;
  email: string;
  mentoringArea: string;
  helpWith: string;
  experienceContext: string;
  preferredFormat?: string;
  availability?: string;
};

/**
 * The persisted Mentor Me request returned after successful creation.
 */
export type MentorMeRequest = {
  id: string;
  name: string;
  email: string;
  source: string;
  status: MentorMeRequestStatus;
  createdAt: string;
  mentoringArea: string;
  helpWith: string;
  experienceContext: string;
  preferredFormat?: string;
  availability?: string;
};

/**
 * The Mentor Me request fields exposed to administrators.
 */
export type MentorMeRequestSummary = {
  id: string;
  name: string;
  email: string;
  mentoringArea: string;
  helpWith: string;
  experienceContext: string;
  preferredFormat?: string;
  availability?: string;
  status: MentorMeRequestStatus;
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
 * Creates a new persisted Mentor Me request.
 *
 * Source, status and timestamps are owned by the server/database.
 * Only validated visitor fields are inserted.
 */
export async function createMentorMeRequest(
  input: MentorMeRequestInput,
): Promise<MentorMeRequest> {
  const { db, leads } = await getDatabase();

  const [created] = await db
    .insert(leads)
    .values({
      name: input.name,
      email: input.email,
      source: MENTOR_ME_REQUEST_SOURCE,
      status: MENTOR_ME_REQUEST_STATUS,
      mentoringArea: input.mentoringArea,
      helpWith: input.helpWith,
      experienceContext: input.experienceContext,
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
      mentoringArea: leads.mentoringArea,
      helpWith: leads.helpWith,
      experienceContext: leads.experienceContext,
      preferredFormat: leads.preferredFormat,
      availability: leads.availability,
    });

  if (!created) {
    throw new Error("Failed to persist the Mentor Me request.");
  }

  return {
    id: created.id,
    name: created.name,
    email: created.email,
    source: created.source ?? MENTOR_ME_REQUEST_SOURCE,
    status: created.status,
    createdAt: created.createdAt.toISOString(),
    mentoringArea: created.mentoringArea ?? input.mentoringArea,
    helpWith: created.helpWith ?? input.helpWith,
    experienceContext: created.experienceContext ?? input.experienceContext,
    ...(created.preferredFormat
      ? { preferredFormat: created.preferredFormat }
      : {}),
    ...(created.availability ? { availability: created.availability } : {}),
  };
}

/**
 * Lists persisted Mentor Me requests, newest first.
 */
export async function listMentorMeRequests(): Promise<
  MentorMeRequestSummary[]
> {
  const { db, leads } = await getDatabase();

  const rows = await db
    .select({
      id: leads.id,
      name: leads.name,
      email: leads.email,
      mentoringArea: leads.mentoringArea,
      helpWith: leads.helpWith,
      experienceContext: leads.experienceContext,
      preferredFormat: leads.preferredFormat,
      availability: leads.availability,
      status: leads.status,
      createdAt: leads.createdAt,
    })
    .from(leads)
    .where(eq(leads.source, MENTOR_ME_REQUEST_SOURCE))
    .orderBy(desc(leads.createdAt));

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    mentoringArea: row.mentoringArea ?? "",
    helpWith: row.helpWith ?? "",
    experienceContext: row.experienceContext ?? "",
    ...(row.preferredFormat ? { preferredFormat: row.preferredFormat } : {}),
    ...(row.availability ? { availability: row.availability } : {}),
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  }));
}
