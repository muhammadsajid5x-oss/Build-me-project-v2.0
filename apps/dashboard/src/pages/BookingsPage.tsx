import { useCallback, useEffect, useState } from "react";

import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import { type Booking, fetchBookings } from "../services/bookings";

function formatDate(value: string): string {
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

function formatService(service: string): string {
  switch (service) {
    case "deliver-my-project":
      return "Deliver My Project";
    case "mentor-me":
      return "Mentor Me";
    case "coffee-with-me":
      return "Coffee With Me";
    default:
      return service;
  }
}

function formatBillingPeriod(period: string): string {
  switch (period) {
    case "one_time":
      return "One time";
    case "monthly":
      return "Monthly";
    default:
      return period;
  }
}

function formatStatus(status: Booking["status"]): string {
  switch (status) {
    case "pending_payment":
      return "Pending Payment";
    case "paid":
      return "Paid";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await fetchBookings();

    setBookings(result.data);
    setError(result.error);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadBookings();
  }, [loadBookings]);

  return (
    <section aria-labelledby="bookings-heading">
      <header className="mb-6">
        <h1 id="bookings-heading" className="text-2xl font-bold text-white">
          Bookings
        </h1>

        <p className="mt-1 text-sm text-gray-400">
          Review service bookings and their payment status.
        </p>
      </header>

      {loading ? <LoadingState /> : null}

      {!loading && error ? (
        <ErrorState message={error} onRetry={() => void loadBookings()} />
      ) : null}

      {!loading && !error && bookings.length === 0 ? (
        <EmptyState message="No bookings yet." />
      ) : null}

      {!loading && !error && bookings.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-900/50">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Bookings, newest first</caption>

            <thead>
              <tr className="border-b border-gray-700">
                <th
                  scope="col"
                  className="px-3 py-3 font-semibold text-gray-200"
                >
                  Service
                </th>

                <th
                  scope="col"
                  className="px-3 py-3 font-semibold text-gray-200"
                >
                  Plan
                </th>

                <th
                  scope="col"
                  className="px-3 py-3 font-semibold text-gray-200"
                >
                  Price
                </th>

                <th
                  scope="col"
                  className="px-3 py-3 font-semibold text-gray-200"
                >
                  Billing
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
                  Created
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
              {bookings.map((booking) => (
                <tr key={booking.id} className="align-top hover:bg-gray-800/50">
                  <td className="border-b border-gray-800 px-3 py-3 text-white">
                    {formatService(booking.service)}
                  </td>

                  <td className="border-b border-gray-800 px-3 py-3 text-gray-300">
                    {booking.planName}
                  </td>

                  <td className="border-b border-gray-800 px-3 py-3 font-semibold text-white">
                    {formatPrice(booking.price, booking.currency)}
                  </td>

                  <td className="border-b border-gray-800 px-3 py-3 text-gray-300">
                    {formatBillingPeriod(booking.billingPeriod)}
                  </td>

                  <td className="border-b border-gray-800 px-3 py-3">
                    <span
                      className={
                        booking.status === "paid"
                          ? "text-green-400"
                          : booking.status === "cancelled"
                            ? "text-red-400"
                            : "text-yellow-400"
                      }
                    >
                      {formatStatus(booking.status)}
                    </span>
                  </td>

                  <td className="whitespace-nowrap border-b border-gray-800 px-3 py-3 text-gray-300">
                    {formatDate(booking.createdAt)}
                  </td>

                  <td className="border-b border-gray-800 px-3 py-3 font-mono text-xs text-gray-500">
                    {booking.id}
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
