import { desc, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";

export type CreateInvoiceInput = {
  bookingId: string;
};

export type Invoice = {
  id: string;
  bookingId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: "pending" | "paid" | "void";
  issuedAt: string;
  dueAt: string | null;
  paidAt: string | null;
};

async function getDatabase() {
  const [{ db }, { bookings }, { invoices }] = await Promise.all([
    import("../../../../database/dist/drizzle/client.js"),
    import("../../../../database/dist/schema/bookings.js"),
    import("../../../../database/dist/schema/invoices.js"),
  ]);

  return {
    db,
    bookings,
    invoices,
  };
}

/**
 * Creates an invoice from the authoritative booking amount.
 *
 * The client never supplies the invoice amount.
 */
export async function createInvoice(
  input: CreateInvoiceInput,
): Promise<Invoice> {
  const { db, bookings, invoices } = await getDatabase();

  const [booking] = await db
    .select({
      id: bookings.id,
      price: bookings.price,
      currency: bookings.currency,
      status: bookings.status,
    })
    .from(bookings)
    .where(eq(bookings.id, input.bookingId))
    .limit(1);

  if (!booking) {
    throw new Error("INVOICE_BOOKING_NOT_FOUND");
  }

  const [existingInvoice] = await db
    .select({
      id: invoices.id,
      bookingId: invoices.bookingId,
      invoiceNumber: invoices.invoiceNumber,
      amount: invoices.amount,
      currency: invoices.currency,
      status: invoices.status,
      issuedAt: invoices.issuedAt,
      dueAt: invoices.dueAt,
      paidAt: invoices.paidAt,
    })
    .from(invoices)
    .where(eq(invoices.bookingId, booking.id))
    .limit(1);

  if (existingInvoice) {
    return {
      id: existingInvoice.id,
      bookingId: existingInvoice.bookingId,
      invoiceNumber: existingInvoice.invoiceNumber,
      amount: existingInvoice.amount,
      currency: existingInvoice.currency,
      status: existingInvoice.status,
      issuedAt: existingInvoice.issuedAt.toISOString(),
      dueAt: existingInvoice.dueAt?.toISOString() ?? null,
      paidAt: existingInvoice.paidAt?.toISOString() ?? null,
    };
  }

  const invoiceNumber = `INV-${randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase()}`;

  const [created] = await db
    .insert(invoices)
    .values({
      bookingId: booking.id,
      invoiceNumber,
      amount: booking.price,
      currency: booking.currency,
      status: "pending",
    })
    .returning({
      id: invoices.id,
      bookingId: invoices.bookingId,
      invoiceNumber: invoices.invoiceNumber,
      amount: invoices.amount,
      currency: invoices.currency,
      status: invoices.status,
      issuedAt: invoices.issuedAt,
      dueAt: invoices.dueAt,
      paidAt: invoices.paidAt,
    });

  if (!created) {
    throw new Error("Failed to create invoice.");
  }

  return {
    id: created.id,
    bookingId: created.bookingId,
    invoiceNumber: created.invoiceNumber,
    amount: created.amount,
    currency: created.currency,
    status: created.status,
    issuedAt: created.issuedAt.toISOString(),
    dueAt: created.dueAt?.toISOString() ?? null,
    paidAt: created.paidAt?.toISOString() ?? null,
  };
}
/**
 * Lists invoices for the admin dashboard.
 */
export async function listInvoices(): Promise<Invoice[]> {
  const { db, invoices } = await getDatabase();

  const rows = await db
    .select({
      id: invoices.id,
      bookingId: invoices.bookingId,
      invoiceNumber: invoices.invoiceNumber,
      amount: invoices.amount,
      currency: invoices.currency,
      status: invoices.status,
      issuedAt: invoices.issuedAt,
      dueAt: invoices.dueAt,
      paidAt: invoices.paidAt,
    })
    .from(invoices)
    .orderBy(desc(invoices.issuedAt));

  return rows.map((invoice) => ({
    id: invoice.id,
    bookingId: invoice.bookingId,
    invoiceNumber: invoice.invoiceNumber,
    amount: invoice.amount,
    currency: invoice.currency,
    status: invoice.status,
    issuedAt: invoice.issuedAt.toISOString(),
    dueAt: invoice.dueAt?.toISOString() ?? null,
    paidAt: invoice.paidAt?.toISOString() ?? null,
  }));
}
