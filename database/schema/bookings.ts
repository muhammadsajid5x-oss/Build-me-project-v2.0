import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { leads } from "./leads.js";
import { servicePlans } from "./service-plans.js";

export const bookingStatusEnum = pgEnum("booking_status", [
  "pending_payment",
  "paid",
  "cancelled",
]);

export const bookings = pgTable("bookings", {
  id: uuid("id").defaultRandom().primaryKey(),

  leadId: uuid("lead_id")
    .notNull()
    .references(() => leads.id),

  planId: uuid("plan_id")
    .notNull()
    .references(() => servicePlans.id),

  service: text("service").notNull(),

  planName: text("plan_name").notNull(),

  price: integer("price").notNull(),

  currency: text("currency").default("USD").notNull(),

  billingPeriod: text("billing_period").default("one_time").notNull(),

  status: bookingStatusEnum("status").default("pending_payment").notNull(),

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
