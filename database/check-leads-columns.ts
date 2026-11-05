import postgres from "postgres";
import { config } from "dotenv";
config({ path: "../.env" });
const sql = postgres(process.env.DATABASE_URL!);
const rows = await sql.unsafe(`
  SELECT column_name
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'leads'
  ORDER BY ordinal_position
`);
console.log(rows);
await sql.end();
