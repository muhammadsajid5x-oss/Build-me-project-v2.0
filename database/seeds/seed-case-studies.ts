import { eq, inArray } from "drizzle-orm";
import { config } from "dotenv";
import { fileURLToPath } from "node:url";
config({ path: fileURLToPath(new URL("../../.env", import.meta.url)) });
async function seedCaseStudies() {
  if (
    process.env.NODE_ENV !== "development" &&
    process.env.NODE_ENV !== "test"
  ) {
    throw new Error(
      "Case study seeding is allowed only in development or test mode.",
    );
  }
  if (process.env.DATABASE_SEED_CONFIRM !== "1") {
    throw new Error("Set DATABASE_SEED_CONFIRM=1 to confirm this seed run.");
  }
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured.");
  }
  const [{ db, connection }, { caseStudies }] = await Promise.all([
    import("../drizzle/client"),
    import("../schema"),
  ]);
  const values = [
    {
      company: "Cup&Commit",
      location: "Remote",
      category: "Deliver My Project",
      title: "Deliver My Project",
      summary:
        "A complete delivery journey for turning a project need into a validated, production-ready outcome.",
      outcome:
        "A structured delivery request captures the project context, expected outcome, timeline, and budget so the work can move into an actionable delivery workflow.",
      content:
        "Deliver My Project is the Cup&Commit journey for teams and individuals who need technology work delivered end-to-end. The journey captures the right project information, validates the request, persists it through the backend, confirms the submission, and makes the request visible to the delivery workflow.",
      storyUrl: "/deliver-my-project",
      published: true,
    },
    {
      company: "Cup&Commit",
      location: "Remote",
      category: "Mentor Me",
      title: "Mentor Me",
      summary:
        "A focused mentoring journey for software engineers and technology professionals who want practical guidance.",
      outcome:
        "A structured mentoring request creates a clear starting point for focused technical guidance, learning, and execution support.",
      content:
        "Mentor Me is the Cup&Commit journey for people who want practical technology guidance. It provides a focused path to discuss engineering challenges, strengthen technical execution, and turn learning into practical progress.",
      storyUrl: "/mentor-me",
      published: true,
    },
    {
      company: "Cup&Commit",
      location: "Remote",
      category: "Coffee With Me",
      title: "Coffee With Me",
      summary:
        "A simple conversation journey for discussing technology, engineering, career, and ideas.",
      outcome:
        "A conversation request creates a clear path for connecting around a specific technology or professional topic.",
      content:
        "Coffee With Me is the Cup&Commit conversation journey. It is designed for meaningful discussions around technology, engineering, product delivery, career growth, and ideas where a focused conversation can create useful next steps.",
      storyUrl: "/coffee-with-me",
      published: true,
    },
  ];
  const existingTitles = [
    "Deliver My Project",
    "Mentor Me",
    "Coffee With Me",
    "Production-grade Technology Ownership Platform",
    "End-to-end project delivery request",
    "Evidence-driven engineering quality",
    "Observable visitor journeys",
  ];
  const existing = await db
    .select({
      id: caseStudies.id,
      title: caseStudies.title,
    })
    .from(caseStudies)
    .where(inArray(caseStudies.title, existingTitles));
  const existingByTitle = new Map(existing.map((row) => [row.title, row.id]));
  const oldTitles = existing
    .filter((row) => !values.some((value) => value.title === row.title))
    .map((row) => row.title);
  if (oldTitles.length > 0) {
    await db.delete(caseStudies).where(inArray(caseStudies.title, oldTitles));
    console.info(`Removed ${oldTitles.length} old case studies.`);
  }
  for (const value of values) {
    const existingId = existingByTitle.get(value.title);
    if (existingId) {
      await db
        .update(caseStudies)
        .set({
          company: value.company,
          location: value.location,
          category: value.category,
          summary: value.summary,
          outcome: value.outcome,
          content: value.content,
          storyUrl: value.storyUrl,
          published: value.published,
          updatedAt: new Date(),
        })
        .where(eq(caseStudies.id, existingId));
    } else {
      await db.insert(caseStudies).values(value);
    }
  }
  console.info(
    "Case study seed completed. Exactly 3 Cup&Commit journeys are configured.",
  );
  await connection.end();
}
try {
  await seedCaseStudies();
} catch (error) {
  console.error("Case study seed failed.", error);
  process.exitCode = 1;
}
