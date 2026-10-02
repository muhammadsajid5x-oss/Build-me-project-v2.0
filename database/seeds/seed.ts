import { logger } from "@build-me/utils";

import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { inArray } from "drizzle-orm";
import { seedProjects, seedUsers } from "./data";

config({ path: fileURLToPath(new URL("../../.env", import.meta.url)) });

function assertSafeSeedTarget() {
  if (
    process.env.NODE_ENV !== "development" &&
    process.env.NODE_ENV !== "test"
  ) {
    throw new Error(
      "Database seeding is allowed only in development or test mode.",
    );
  }

  if (process.env.DATABASE_SEED_CONFIRM !== "1") {
    throw new Error("Set DATABASE_SEED_CONFIRM=1 to confirm this seed run.");
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const hostname = new URL(databaseUrl).hostname.toLowerCase();
  const localHosts = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

  if (
    !localHosts.has(hostname) &&
    process.env.DATABASE_SEED_ALLOW_REMOTE !== "1"
  ) {
    throw new Error(
      "Remote seed targets require DATABASE_SEED_ALLOW_REMOTE=1 after verifying the target is non-production.",
    );
  }
}

async function seed() {
  assertSafeSeedTarget();

  const [{ db, connection }, { users, projects }] = await Promise.all([
    import("../drizzle/client"),
    import("../schema"),
  ]);

  try {
    const counts = await db.transaction(async (tx) => {
      const insertedUsers = await tx
        .insert(users)
        .values(seedUsers)
        .onConflictDoNothing()
        .returning({ id: users.id });

      const existingUsers = await tx
        .select({ id: users.id, email: users.email })
        .from(users)
        .where(
          inArray(
            users.email,
            seedUsers.map((user) => user.email),
          ),
        );
      const userIds = new Map(
        existingUsers.map((user) => [user.email, user.id]),
      );

      const projectValues = seedProjects.map(({ ownerEmail, ...project }) => {
        const ownerId = userIds.get(ownerEmail);
        if (!ownerId) {
          throw new Error(`Seed owner was not found: ${ownerEmail}`);
        }

        return { ...project, ownerId };
      });

      const insertedProjects = await tx
        .insert(projects)
        .values(projectValues)
        .onConflictDoNothing()
        .returning({ id: projects.id });

      return {
        users: insertedUsers.length,
        projects: insertedProjects.length,
      };
    });

    console.info("Development/test seed complete", counts);
  } finally {
    await connection.end();
  }
}

try {
  await seed();
} catch (error) {
  logger.error("Database seed failed.", {
    service: "database",
    error,
  });
  process.exitCode = 1;
}
