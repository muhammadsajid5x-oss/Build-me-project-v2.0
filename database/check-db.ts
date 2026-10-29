import postgres from "postgres";
import { config } from "dotenv";
config({ path: "../.env" });
const sql = postgres(process.env.DATABASE_URL!);
const migrations = await sql.unsafe(`
  SELECT *
  FROM drizzle.__drizzle_migrations
  ORDER BY created_at
`);
console.log("=== MIGRATIONS ===");
console.log(migrations);
const columns = await sql.unsafe(`
  SELECT column_name
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'leads'
  ORDER BY ordinal_position
`);
console.log("=== LEADS COLUMNS ===");
console.log(columns);
await sql.end();
