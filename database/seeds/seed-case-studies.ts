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
        "An end-to-end technology delivery journey that helps clients turn a project requirement into a structured, actionable delivery request.",
      outcome:
        "The visitor can submit a structured delivery request with project context, expected outcome, timeline, and budget, creating a clear starting point for technology delivery.",
      content:
        "Deliver My Project addresses the need for a clear and structured way to start an end-to-end technology project. Its purpose is to move a visitor from an initial project need to an actionable delivery request. The functionality lets the visitor provide the project description, expected outcome, timeline, and budget, validates the submitted information, sends the request through the backend, persists the lead, and provides confirmation. This creates a practical bridge between a project requirement and the technology delivery process. The real-world value is that clients can communicate their technology needs in a structured way while the delivery workflow receives the information required to understand, assess, and progress the work.",
      storyUrl: "/deliver-my-project",
      published: true,
    },
    {
      company: "Cup&Commit",
      location: "Remote",
      category: "Mentor Me",
      title: "Mentor Me",
      summary:
        "A focused mentoring journey that helps software engineers and technology professionals turn technical challenges into structured learning and execution goals.",
      outcome:
        "The visitor can submit a structured mentoring request that establishes the technical challenge, learning need, or execution goal for focused mentoring support.",
      content:
        "Mentor Me addresses the need for practical technical guidance when engineers or technology professionals are facing a specific challenge or want to strengthen their execution skills. Its purpose is to create a focused path from a learning or engineering need to a structured mentoring conversation. The functionality lets the visitor provide the context needed to describe the technical challenge, learning need, or execution goal and establish a clear starting point for mentoring. This creates a focused mentoring journey rather than an open-ended interaction. The real-world value is a practical route for engineers and technology professionals to receive guidance connected to real engineering work, technical decisions, learning, and execution.",
      storyUrl: "/mentor-me",
      published: true,
    },
    {
      company: "Cup&Commit",
      location: "Remote",
      category: "Coffee With Me",
      title: "Coffee With Me",
      summary:
        "A focused conversation journey for discussing technology, engineering, product delivery, career development, and professional ideas.",
      outcome:
        "The visitor can initiate a focused conversation around a specific technology or professional topic and establish a clear purpose for the discussion.",
      content:
        "Coffee With Me addresses situations where a focused conversation can help clarify a technology, engineering, product delivery, career, or professional question. Its purpose is to provide a simple and intentional way to start that conversation. The functionality lets the visitor start a focused conversation journey around a specific topic or professional question and continue to the relevant Coffee With Me path. This provides a clear alternative to an unstructured contact request. The real-world value is a low-friction way for people to discuss ideas, challenges, opportunities, and technology decisions with a clear purpose and expected direction.",
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
