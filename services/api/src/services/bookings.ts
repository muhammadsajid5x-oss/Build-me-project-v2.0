import { desc, eq } from "drizzle-orm";

export type CreateBookingInput = {
  leadId: string;
  planId: string;
};

export type Booking = {
  id: string;
  leadId: string;
  planId: string;
  service: string;
  planName: string;
  price: number;
  currency: string;
  billingPeriod: string;
  status: "pending_payment" | "paid" | "cancelled";
  createdAt: string;
};

async function getDatabase() {
  const [{ db }, { leads }, { servicePlans }, { bookings }] = await Promise.all(
    [
      import("../../../../database/dist/drizzle/client.js"),
      import("../../../../database/dist/schema/leads.js"),
      import("../../../../database/dist/schema/service-plans.js"),
      import("../../../../database/dist/schema/bookings.js"),
    ],
  );

  return {
    db,
    leads,
    servicePlans,
    bookings,
  };
}

/**
 * Creates a booking using the authoritative pricing stored in service_plans.
 *
 * The client supplies only leadId and planId.
 * Price, service, plan name, currency and billing period come from the database.
 */
export async function createBooking(
  input: CreateBookingInput,
): Promise<Booking> {
  const { db, leads, servicePlans, bookings } = await getDatabase();

  const [lead] = await db
    .select({
      id: leads.id,
    })
    .from(leads)
    .where(eq(leads.id, input.leadId))
    .limit(1);

  if (!lead) {
    throw new Error("BOOKING_LEAD_NOT_FOUND");
  }

  const [plan] = await db
    .select({
      id: servicePlans.id,
      service: servicePlans.service,
      planName: servicePlans.planName,
      price: servicePlans.price,
      currency: servicePlans.currency,
      billingPeriod: servicePlans.billingPeriod,
      active: servicePlans.active,
    })
    .from(servicePlans)
    .where(eq(servicePlans.id, input.planId))
    .limit(1);

  if (!plan) {
    throw new Error("BOOKING_PLAN_NOT_FOUND");
  }

  if (!plan.active) {
    throw new Error("BOOKING_PLAN_INACTIVE");
  }

  const [created] = await db
    .insert(bookings)
    .values({
      leadId: lead.id,
      planId: plan.id,
      service: plan.service,
      planName: plan.planName,
      price: plan.price,
      currency: plan.currency,
      billingPeriod: plan.billingPeriod,
      status: "pending_payment",
    })
    .returning({
      id: bookings.id,
      leadId: bookings.leadId,
      planId: bookings.planId,
      service: bookings.service,
      planName: bookings.planName,
      price: bookings.price,
      currency: bookings.currency,
      billingPeriod: bookings.billingPeriod,
      status: bookings.status,
      createdAt: bookings.createdAt,
    });

  if (!created) {
    throw new Error("Failed to create booking.");
  }

  return {
    id: created.id,
    leadId: created.leadId,
    planId: created.planId,
    service: created.service,
    planName: created.planName,
    price: created.price,
    currency: created.currency,
    billingPeriod: created.billingPeriod,
    status: created.status,
    createdAt: created.createdAt.toISOString(),
  };
}
export async function listBookings(): Promise<Booking[]> {
  const { db, bookings } = await getDatabase();

  const rows = await db
    .select({
      id: bookings.id,
      leadId: bookings.leadId,
      planId: bookings.planId,
      service: bookings.service,
      planName: bookings.planName,
      price: bookings.price,
      currency: bookings.currency,
      billingPeriod: bookings.billingPeriod,
      status: bookings.status,
      createdAt: bookings.createdAt,
    })
    .from(bookings)
    .orderBy(desc(bookings.createdAt));

  return rows.map((booking) => ({
    id: booking.id,
    leadId: booking.leadId,
    planId: booking.planId,
    service: booking.service,
    planName: booking.planName,
    price: booking.price,
    currency: booking.currency,
    billingPeriod: booking.billingPeriod,
    status: booking.status,
    createdAt: booking.createdAt.toISOString(),
  }));
}
