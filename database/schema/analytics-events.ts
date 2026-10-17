import {
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const analyticsEventType = pgEnum("analytics_event_type", [
  "view",
  "click",
]);

export const analyticsEvents = pgTable("analytics_events", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: text("name").notNull(),

  eventType: analyticsEventType("event_type").notNull().default("click"),

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
