import { eq, inArray } from "drizzle-orm";
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

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const [{ db, connection }, { testimonials }] = await Promise.all([
    import("../drizzle/client"),
    import("../schema"),
  ]);

  try {
    const testimonialValues = [
      {
        name: "Ayesha Khan",
        role: "Product Manager",
        company: "Technology Company",
        avatar: "https://i.pravatar.cc/80?img=47",
        category: "Product Delivery",
        content:
          "The technology ownership approach gave our team a much clearer path from planning through delivery.",
        rating: 5,
        helpfulCount: 18,
        storyUrl: "https://example.com/testimonials/ayesha-khan",
        verified: true,
        published: true,
      },
      {
        name: "Bilal Ahmed",
        role: "Software Engineer",
        company: "Software Company",
        avatar: "https://i.pravatar.cc/80?img=12",
        category: "Engineering",
        content:
          "The practical focus on engineering quality, testing, security, and operations helped improve how we delivered work.",
        rating: 5,
        helpfulCount: 14,
        storyUrl: "https://example.com/testimonials/bilal-ahmed",
        verified: true,
        published: true,
      },
      {
        name: "Sarah Malik",
        role: "Founder",
        company: "Startup",
        avatar: "https://i.pravatar.cc/80?img=32",
        category: "Business Growth",
        content:
          "The guidance helped turn a technical idea into a structured delivery process with clear ownership.",
        rating: 5,
        helpfulCount: 21,
        storyUrl: "https://example.com/testimonials/sarah-malik",
        verified: true,
        published: true,
      },
      {
        name: "Usman Raza",
        role: "Engineering Lead",
        company: "Digital Agency",
        avatar: "https://i.pravatar.cc/80?img=68",
        category: "Technology Leadership",
        content:
          "The strongest value was connecting implementation with reliability, observability, and continuous improvement.",
        rating: 5,
        helpfulCount: 16,
        storyUrl: "https://example.com/testimonials/usman-raza",
        verified: true,
        published: true,
      },
      {
        name: "Hassan Ali",
        role: "Developer",
        company: "Technology Company",
        avatar: "https://i.pravatar.cc/80?img=11",
        category: "Development",
        content:
          "The engineering workflow made it easier to understand what needs to happen before a feature is ready to go live.",
        rating: 5,
        helpfulCount: 12,
        storyUrl: "https://example.com/testimonials/hassan-ali",
        verified: true,
        published: true,
      },
      {
        name: "Maria Iqbal",
        role: "Project Lead",
        company: "Digital Business",
        avatar: "https://i.pravatar.cc/80?img=44",
        category: "Project Delivery",
        content:
          "A clear and practical approach to technology ownership that helped our delivery process become more consistent.",
        rating: 5,
        helpfulCount: 19,
        storyUrl: "https://example.com/testimonials/maria-iqbal",
        verified: true,
        published: true,
      },
    ];

    const names = testimonialValues.map((testimonial) => testimonial.name);

    const existingTestimonials = await db
      .select({
        id: testimonials.id,
        name: testimonials.name,
      })
      .from(testimonials)
      .where(inArray(testimonials.name, names));

    const existingByName = new Map(
      existingTestimonials.map((testimonial) => [
        testimonial.name,
        testimonial.id,
      ]),
    );

    const recordsToInsert = testimonialValues.filter(
      (testimonial) => !existingByName.has(testimonial.name),
    );

    const recordsToUpdate = testimonialValues.filter((testimonial) =>
      existingByName.has(testimonial.name),
    );

    if (recordsToInsert.length > 0) {
      const inserted = await db
        .insert(testimonials)
        .values(recordsToInsert)
        .returning({ id: testimonials.id });

      console.info(`Inserted ${inserted.length} testimonials.`);
    }

    if (recordsToUpdate.length > 0) {
      const updatePromises = recordsToUpdate.map((testimonial) => {
        const id = existingByName.get(testimonial.name);

        if (!id) {
          return Promise.resolve();
        }

        return db
          .update(testimonials)
          .set({
            role: testimonial.role,
            company: testimonial.company,
            avatar: testimonial.avatar,
            category: testimonial.category,
            content: testimonial.content,
            rating: testimonial.rating,
            helpfulCount: testimonial.helpfulCount,
            storyUrl: testimonial.storyUrl,
            verified: testimonial.verified,
            published: testimonial.published,
            updatedAt: new Date(),
          })
          .where(eq(testimonials.id, id));
      });

      await Promise.all(updatePromises);

      console.info(`Updated ${recordsToUpdate.length} testimonials.`);
    }

    console.info(
      `Testimonial seed completed. Processed ${testimonialValues.length} testimonials.`,
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
