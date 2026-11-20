import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const feedback = pgTable("feedback", {
  id: uuid("id").defaultRandom().primaryKey(),

  referenceId: text("reference_id").notNull().unique(),

  type: text("type").notNull(),

  name: text("name").notNull(),

  email: text("email").notNull(),

  score: integer("score"),

  rating: integer("rating"),

  title: text("title"),

  content: text("content").notNull(),

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
