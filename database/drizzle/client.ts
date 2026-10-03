import "dotenv/config";
import { logger } from "@build-me/utils";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  logger.error("Database configuration is missing.", {
    service: "database",
    setting: "DATABASE_URL",
  });
  throw new Error("DATABASE_URL is not configured.");
}

const connection = postgres(databaseUrl);

export const db = drizzle(connection);

export { connection };
