import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";

export const analyticsEvents = pgTable("analytics_events", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: text("name").notNull(),

  userId: uuid("user_id").references(() => users.id, {
    onDelete: "set null",
  }),

  properties: jsonb("properties"),

  timestamp: timestamp("timestamp", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});
