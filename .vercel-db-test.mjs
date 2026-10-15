import { db } from "./database/dist/drizzle/client.js";

try {
  const result = await db.execute("select current_database() as database, current_schema() as schema");
  console.log("VERCEL_DATABASE_CONNECTION_OK");
  console.log(result);
  process.exit(0);
} catch (error) {
  console.error("VERCEL_DATABASE_CONNECTION_FAILED");
  console.error(error);
  process.exit(1);
}
