import {
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { users } from "./users.js";

export const ownershipAudits = pgTable("ownership_audits", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id").references(() => users.id, {
    onDelete: "set null",
  }),

  visitorEmail: text("visitor_email"),

  step1: text("step1").notNull(),

  step2: text("step2").notNull(),

  step3: text("step3").notNull(),

  score: integer("score").notNull(),

  category: text("category").notNull(),

  answers: jsonb("answers").notNull(),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});
