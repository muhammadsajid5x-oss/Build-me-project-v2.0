import { eq, inArray } from "drizzle-orm";
import { config } from "dotenv";
import { fileURLToPath } from "node:url";

config({ path: fileURLToPath(new URL("../../.env", import.meta.url)) });

async function seedCaseStudies() {
  if (process.env.NODE_ENV !== "development" && process.env.NODE_ENV !== "test") {
    throw new Error("Case study seeding is allowed only in development or test mode.");
  }
  if (process.env.DATABASE_SEED_CONFIRM !== "1") {
    throw new Error("Set DATABASE_SEED_CONFIRM=1 to confirm this seed run.");
  }
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured.");

  const [{ db, connection }, { caseStudies }] = await Promise.all([
    import("../drizzle/client"),
    import("../schema"),
  ]);

  const values = [
    {
      company: "Build Me",
      location: "Remote",
      category: "Platform Engineering",
      title: "Production-grade Technology Ownership Platform",
      summary: "A personal technology platform built around delivery, operations, security, analytics, and continuous improvement.",
      outcome: "A working platform with public journeys, backend APIs, database persistence, analytics, automated tests, and operational controls.",
      content: "The platform connects product journeys with production engineering practices across planning, design, build, test, deploy, observe, secure, recover, analyse, and improve.",
      published: true,
    },
    {
      company: "Build Me",
      location: "Remote",
      category: "Delivery",
      title: "End-to-end project delivery request",
      summary: "A visitor journey for requesting delivery support with validated project information and backend persistence.",
      outcome: "Visitors can submit a delivery request through the website and the request is available to the delivery workflow.",
      content: "The journey covers request capture, validation, API submission, confirmation, analytics, and backend visibility.",
      published: true,
    },
    {
      company: "Build Me",
      location: "Remote",
      category: "Engineering Quality",
      title: "Evidence-driven engineering quality",
      summary: "Automated quality gates covering unit, integration, end-to-end, analytics, performance, and security checks.",
      outcome: "Feature delivery is supported by repeatable automated validation instead of manual-only verification.",
      content: "The engineering workflow uses automated tests and security/performance checks to validate production readiness across the platform.",
      published: true,
    },
    {
      company: "Build Me",
      location: "Remote",
      category: "Analytics",
      title: "Observable visitor journeys",
      summary: "Typed analytics events connect important visitor interactions to measurable platform behaviour.",
      outcome: "Key journeys can be observed through analytics events without interrupting the visitor experience.",
      content: "Visitor-facing features emit typed view and click events through the analytics API using best-effort tracking.",
      published: true,
    },
  ];

  const titles = values.map((value) => value.title);
  const existing = await db.select({ id: caseStudies.id, title: caseStudies.title })
    .from(caseStudies)
    .where(inArray(caseStudies.title, titles));
  const existingByTitle = new Map(existing.map((row) => [row.title, row.id]));
  const inserts = values.filter((value) => !existingByTitle.has(value.title));
  const updates = values.filter((value) => existingByTitle.has(value.title));

  if (inserts.length) {
    const inserted = await db.insert(caseStudies).values(inserts).returning({ id: caseStudies.id });
    console.info(`Inserted ${inserted.length} case studies.`);
  }

  await Promise.all(updates.map((value) => {
    const id = existingByTitle.get(value.title);
    return id ? db.update(caseStudies).set({
      company: value.company, location: value.location, category: value.category,
      summary: value.summary, outcome: value.outcome, content: value.content,
      published: value.published, updatedAt: new Date(),
    }).where(eq(caseStudies.id, id)) : Promise.resolve();
  }));

  console.info(`Case study seed completed. Processed ${values.length} case studies.`);
  await connection.end();
}

try {
  await seedCaseStudies();
} catch (error) {
  console.error("Case study seed failed.", error);
  process.exitCode = 1;
}
