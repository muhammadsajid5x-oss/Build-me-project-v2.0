import postgres from "postgres";
import { config } from "dotenv";
config({ path: "../.env" });
const sql = postgres(process.env.DATABASE_URL!);
await sql.unsafe(`
  ALTER TABLE "leads"
  ADD COLUMN IF NOT EXISTS "topic" text
`);
console.log("topic column verified/created successfully.");
await sql.end();
