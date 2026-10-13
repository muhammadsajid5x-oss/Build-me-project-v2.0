import { db } from "./drizzle/client.js";
const result = await db.execute(
  "select to_regclass('public.analytics_events') as table_name"
);
console.log(result);
process.exit(0);
