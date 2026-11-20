import { config } from "dotenv";
import { fileURLToPath } from "node:url";

config({ path: fileURLToPath(new URL("../../.env", import.meta.url)) });

async function clearTestimonials() {
  if (
    process.env.NODE_ENV !== "development" &&
    process.env.NODE_ENV !== "test"
  ) {
    throw new Error(
      "Testimonial cleanup is allowed only in development or test mode.",
    );
  }

  if (process.env.DATABASE_SEED_CONFIRM !== "1") {
    throw new Error("Set DATABASE_SEED_CONFIRM=1 to confirm this cleanup.");
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const [{ db, connection }, { testimonials }] = await Promise.all([
    import("../drizzle/client"),
    import("../schema"),
  ]);

  try {
    const deleted = await db
      .delete(testimonials)
      .returning({ id: testimonials.id });

    console.info(`Deleted ${deleted.length} testimonials.`);
  } finally {
    await connection.end();
  }
}

try {
  await clearTestimonials();
} catch (error) {
  console.error("Testimonial cleanup failed.", error);
  process.exitCode = 1;
}
