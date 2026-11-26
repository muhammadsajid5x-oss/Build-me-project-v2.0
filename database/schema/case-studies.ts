import { sql } from "drizzle-orm";

import {
  boolean,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export type CaseStudyKeyResult = {
  stat: string;
  label: string;
};

export const caseStudies = pgTable("case_studies", {
  id: uuid("id").defaultRandom().primaryKey(),

  company: text("company").notNull(),

  location: text("location"),

  category: text("category"),

  tags: text("tags")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),

  title: text("title").notNull(),

  summary: text("summary").notNull(),

  outcome: text("outcome").notNull(),

  content: text("content").notNull(),

  image: text("image"),

  keyResults: jsonb("key_results")
    .$type<CaseStudyKeyResult[]>()
    .notNull()
    .default(sql`'[]'::jsonb`),

  storyUrl: text("story_url"),

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
