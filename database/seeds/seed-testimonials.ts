import { config } from "dotenv";
import { fileURLToPath } from "node:url";

config({ path: fileURLToPath(new URL("../../.env", import.meta.url)) });

async function seedTestimonials() {
  if (
    process.env.NODE_ENV !== "development" &&
    process.env.NODE_ENV !== "test"
  ) {
    throw new Error(
      "Testimonial seeding is allowed only in development or test mode.",
    );
  }

  if (process.env.DATABASE_SEED_CONFIRM !== "1") {
    throw new Error("Set DATABASE_SEED_CONFIRM=1 to confirm this seed run.");
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const [{ db, connection }, { testimonials }] = await Promise.all([
    import("../drizzle/client"),
    import("../schema"),
  ]);

  try {
    const existing = await db
      .select({
        id: testimonials.id,
      })
      .from(testimonials);

    if (existing.length > 0) {
      throw new Error(
        `Testimonial table is not empty. Found ${existing.length} records. Run clear-testimonials.ts first.`,
      );
    }

    const [inserted] = await db
      .insert(testimonials)
      .values({
        name: "Demo Customer",
        role: "Product Manager",
        company: "Demo Company",
        location: "Remote",
        source: "client-work",
        tags: ["Deliver My Project", "Project Delivery", "Technical Execution"],
        avatar: null,
        category: "Deliver My Project",
        content:
          "This sample review demonstrates the approved customer-review layout for Cup&Commit. It is placeholder content and is not presented as a real customer review.",
        rating: 5,
        communications: null,
        timelines: null,
        knowledge: null,
        value: null,
        outcome: "Demo result: 20% faster delivery planning",
        helpfulCount: 0,
        storyUrl: null,
        verified: false,
        published: true,
      })
      .returning({
        id: testimonials.id,
      });

    console.info(
      `Inserted ${inserted ? 1 : 0} demo testimonial. This is sample content only.`,
    );
  } finally {
    await connection.end();
  }
}

try {
  await seedTestimonials();
} catch (error) {
  console.error("Testimonial seed failed.", error);
  process.exitCode = 1;
}
