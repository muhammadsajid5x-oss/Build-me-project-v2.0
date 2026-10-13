import { db } from "./drizzle/client.js";
const result = await db.execute(
  "select current_database() as database, current_schema() as schema"
);
console.log(result);
process.exit(0);
