import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
config({ path: new URL("../../.env", import.meta.url) });
export default defineConfig({
  schema: "./schema/index.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
});
