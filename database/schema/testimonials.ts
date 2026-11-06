import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  boolean,
} from "drizzle-orm/pg-core";

export const testimonials = pgTable("testimonials", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: text("name").notNull(),

  role: text("role"),

  company: text("company"),

  avatar: text("avatar"),

  category: text("category"),

  content: text("content").notNull(),

  rating: integer("rating").notNull(),

  helpfulCount: integer("helpful_count").default(0).notNull(),

  storyUrl: text("story_url"),

  verified: boolean("verified").default(false).notNull(),

  published: boolean("published").default(false).notNull(),

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
