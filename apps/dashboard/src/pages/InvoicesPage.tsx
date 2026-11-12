import { useCallback, useEffect, useState } from "react";

import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import { type Invoice, fetchInvoices } from "../services/invoices";

function formatDate(value: string | null): string {
  if (!value) {
    return "—";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatStatus(status: Invoice["status"]): string {
  switch (status) {
    case "pending":
      return "Pending";
    case "paid":
      return "Paid";
    case "void":
      return "Void";
    default:
      return status;
  }
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await fetchInvoices();

    setInvoices(result.data);
    setError(result.error);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadInvoices();
  }, [loadInvoices]);

  return (
    <section aria-labelledby="invoices-heading">
      <header className="mb-6">
        <h1 id="invoices-heading" className="text-2xl font-bold text-white">
          Invoices
        </h1>

        <p className="mt-1 text-sm text-gray-400">
          Review generated invoices and payment status.
        </p>
      </header>

      {loading ? <LoadingState /> : null}

      {!loading && error ? (
        <ErrorState message={error} onRetry={() => void loadInvoices()} />
      ) : null}

      {!loading && !error && invoices.length === 0 ? (
        <EmptyState message="No invoices yet." />
      ) : null}

      {!loading && !error && invoices.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-900/50">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Invoices, newest first</caption>

            <thead>
              <tr className="border-b border-gray-700">
                <th
                  scope="col"
                  className="px-3 py-3 font-semibold text-gray-200"
                >
                  Invoice
                </th>

                <th
                  scope="col"
                  className="px-3 py-3 font-semibold text-gray-200"
                >
                  Amount
                </th>

                <th
                  scope="col"
                  className="px-3 py-3 font-semibold text-gray-200"
                >
                  Status
                </th>

                <th
                  scope="col"
                  className="px-3 py-3 font-semibold text-gray-200"
                >
                  Issued
                </th>

                <th
                  scope="col"
                  className="px-3 py-3 font-semibold text-gray-200"
                >
                  Due
                </th>

                <th
                  scope="col"
                  className="px-3 py-3 font-semibold text-gray-200"
                >
                  Paid
                </th>

                <th
                  scope="col"
                  className="px-3 py-3 font-semibold text-gray-200"
                >
                  Booking ID
                </th>
              </tr>
            </thead>

            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="align-top hover:bg-gray-800/50">
                  <td className="border-b border-gray-800 px-3 py-3 font-semibold text-white">
                    {invoice.invoiceNumber}
                  </td>

                  <td className="border-b border-gray-800 px-3 py-3 font-semibold text-white">
                    {formatPrice(invoice.amount, invoice.currency)}
                  </td>

                  <td className="border-b border-gray-800 px-3 py-3">
                    <span
                      className={
                        invoice.status === "paid"
                          ? "text-green-400"
                          : invoice.status === "void"
                            ? "text-red-400"
                            : "text-yellow-400"
                      }
                    >
                      {formatStatus(invoice.status)}
                    </span>
                  </td>

                  <td className="whitespace-nowrap border-b border-gray-800 px-3 py-3 text-gray-300">
                    {formatDate(invoice.issuedAt)}
                  </td>

                  <td className="whitespace-nowrap border-b border-gray-800 px-3 py-3 text-gray-300">
                    {formatDate(invoice.dueAt)}
                  </td>

                  <td className="whitespace-nowrap border-b border-gray-800 px-3 py-3 text-gray-300">
                    {formatDate(invoice.paidAt)}
                  </td>

                  <td className="border-b border-gray-800 px-3 py-3 font-mono text-xs text-gray-500">
                    {invoice.bookingId}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
