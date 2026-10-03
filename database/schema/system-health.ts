import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const systemHealth = pgTable("system_health", {
  id: serial("id").primaryKey(),
  status: text("status").notNull().default("ok"),
  checkedAt: timestamp("checked_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
