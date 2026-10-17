import { db } from "./dist/drizzle/client.js";
const result = await db.execute(`
  insert into public.analytics_events
    (name, properties)
  values
    ('navbar.test', '{"source":"database-verification"}'::jsonb)
  returning id, name, properties, timestamp
`);
console.log(result);
process.exit(0);
