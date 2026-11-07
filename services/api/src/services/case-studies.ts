import { desc, eq, sql } from "drizzle-orm";

export type CaseStudy = {
  id: string;
  company: string;
  location: string | null;
  category: string | null;
  title: string;
  summary: string;
  outcome: string;
  content: string;
  image: string | null;
  storyUrl: string | null;
  published: boolean;
  createdAt: string;
};

export type PaginatedCaseStudies = {
  data: CaseStudy[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

async function getDatabase() {
  const [{ db }, { caseStudies }] = await Promise.all([
    import("../../../../database/dist/drizzle/client.js"),
    import("../../../../database/dist/schema/case-studies.js"),
  ]);
  return { db, caseStudies };
}

export async function listPublishedCaseStudies(page = 1, limit = 4): Promise<PaginatedCaseStudies> {
  const { db, caseStudies } = await getDatabase();
  const safePage = Math.max(1, Math.floor(page));
  const safeLimit = Math.min(20, Math.max(1, Math.floor(limit)));
  const offset = (safePage - 1) * safeLimit;

  const rows = await db.select({
    id: caseStudies.id, company: caseStudies.company, location: caseStudies.location,
    category: caseStudies.category, title: caseStudies.title, summary: caseStudies.summary,
    outcome: caseStudies.outcome, content: caseStudies.content, image: caseStudies.image,
    storyUrl: caseStudies.storyUrl, published: caseStudies.published, createdAt: caseStudies.createdAt,
  }).from(caseStudies).where(eq(caseStudies.published, true))
    .orderBy(desc(caseStudies.createdAt)).limit(safeLimit).offset(offset);

  const countRows = await db.select({ id: caseStudies.id }).from(caseStudies)
    .where(eq(caseStudies.published, true));
  const total = countRows.length;

  return {
    data: rows.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() })),
    pagination: { page: safePage, limit: safeLimit, total, totalPages: total === 0 ? 0 : Math.ceil(total / safeLimit) },
  };
}
