import { db } from "./dist/drizzle/client.js";
const result = await db.execute(`
  select
    column_name,
    data_type,
    is_nullable
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'analytics_events'
  order by ordinal_position
`);
console.table(result);
process.exit(0);
