import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const servicePlans = pgTable("service_plans", {
  id: uuid("id").defaultRandom().primaryKey(),

  service: text("service").notNull(),

  planName: text("plan_name").notNull(),

  slug: text("slug").notNull().unique(),

  description: text("description").notNull(),

  price: integer("price").notNull(),

  currency: text("currency").default("USD").notNull(),

  billingPeriod: text("billing_period").default("one_time").notNull(),

  active: boolean("active").default(true).notNull(),

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
