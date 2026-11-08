import { pgTable, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core";

export const caseStudies = pgTable("case_studies", {
  id: uuid("id").defaultRandom().primaryKey(),
  company: text("company").notNull(),
  location: text("location"),
  category: text("category"),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  outcome: text("outcome").notNull(),
  content: text("content").notNull(),
  image: text("image"),
  storyUrl: text("story_url"),
  published: boolean("published").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
