import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { bookings } from "./bookings.js";

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "pending",
  "paid",
  "void",
]);

export const invoices = pgTable("invoices", {
  id: uuid("id").defaultRandom().primaryKey(),

  bookingId: uuid("booking_id")
    .notNull()
    .references(() => bookings.id),

  invoiceNumber: text("invoice_number").notNull().unique(),

  amount: integer("amount").notNull(),

  currency: text("currency").default("USD").notNull(),

  status: invoiceStatusEnum("status").default("pending").notNull(),

  issuedAt: timestamp("issued_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),

  dueAt: timestamp("due_at", {
    withTimezone: true,
  }),

  paidAt: timestamp("paid_at", {
    withTimezone: true,
  }),
});
