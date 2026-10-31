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

  fullName: text("full_name").notNull(),
  visitorEmail: text("visitor_email").notNull(),

  q1: text("q1").notNull(),
  q2: text("q2").notNull(),
  q3: text("q3").notNull(),
  q4: text("q4").notNull(),
  q5: text("q5").notNull(),
  q6: text("q6").notNull(),
  q7: text("q7").notNull(),
  q8: text("q8").notNull(),
  q9: text("q9").notNull(),
  q10: text("q10").notNull(),

  score: integer("score").notNull(),
  category: text("category").notNull(),
  diagnosticResult: text("diagnostic_result").notNull(),
  redirectTarget: text("redirect_target").notNull(),
  answers: jsonb("answers").notNull(),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});
