import { pgTable, text, timestamp, uuid, pgEnum } from "drizzle-orm/pg-core";

export const leadStatusEnum = pgEnum("lead_status", [
  "new",
  "contacted",
  "qualified",
  "converted",
  "lost",
]);

export const leads = pgTable("leads", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: text("name").notNull(),

  email: text("email").notNull(),

  phone: text("phone"),

  source: text("source"),

  status: leadStatusEnum("status").default("new").notNull(),

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

  projectDescription: text("project_description"),

  expectedOutcome: text("expected_outcome"),

  timeline: text("timeline"),

  budget: text("budget"),
});
