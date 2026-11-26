import { sql } from "drizzle-orm";

import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const feedbackStatusEnum = pgEnum("feedback_status", [
  "pending",
  "approved",
  "rejected",
]);

export const feedback = pgTable("feedback", {
  id: uuid("id").defaultRandom().primaryKey(),

  referenceId: text("reference_id").notNull().unique(),

  type: text("type").notNull(),

  status: feedbackStatusEnum("status").default("pending").notNull(),

  name: text("name").notNull(),

  email: text("email").notNull(),

  role: text("role"),

  company: text("company"),

  location: text("location"),

  source: text("source").default("other").notNull(),

  tags: text("tags")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),

  score: integer("score"),

  rating: integer("rating"),

  communications: integer("communications"),

  timelines: integer("timelines"),

  knowledge: integer("knowledge"),

  value: integer("value"),

  title: text("title"),

  content: text("content").notNull(),

  outcome: text("outcome"),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});
