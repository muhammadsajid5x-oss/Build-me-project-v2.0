import { useEffect, useState } from "react";
import { isUnauthorizedError } from "@build-me/utils";

import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import { apiClient } from "../services/apiClient";

export type AnalyticsSummary = {
  totalEvents: number;
  eventTypeCounts: Record<string, number>;
  eventCounts: Record<string, number>;
  dailyTotals: { date: string; count: number }[];
  recentEvents: {
    name: string;
    eventType: string;
    createdAt: string;
  }[];
};

const loadErrorMessage =
  "Analytics could not be loaded. Please try again.";
const unauthorizedMessage = "You are not authorised to view analytics.";

function formatLabel(name: string): string {
  return name
    .split(".")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function StatCard({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string | number;
}) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function BarChart({
  data,
}: {
  readonly data: { date: string; count: number }[];
}) {
  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-gray-800 bg-gray-900 p-4 text-sm text-gray-400">
        No events recorded in the trailing 30 days.
      </div>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
      <h3 className="text-sm font-semibold text-white">Daily events (30d)</h3>
      <div className="mt-3 flex h-40 items-end gap-1">
        {data.map((day) => {
          const height = (day.count / maxCount) * 100;
          return (
            <div
              key={day.date}
              className="group relative flex flex-1 items-end"
              title={`${day.date}: ${day.count}`}
            >
              <div
                className="w-full rounded-t bg-blue-600 transition-opacity group-hover:bg-blue-500"
                style={{ height: `${Math.max(height, 2)}%` }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<{ data: AnalyticsSummary }>("api/v1/analytics/summary");
      setSummary(response.data);
    } catch (error_) {
      setError(
        isUnauthorizedError(error_)
          ? unauthorizedMessage
          : loadErrorMessage,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const eventTypeCounts = summary?.eventTypeCounts ?? {};
  const totalViews = eventTypeCounts["view"] ?? 0;
  const totalClicks = eventTypeCounts["click"] ?? 0;

  return (
    <section aria-labelledby="analytics-heading">
      <h1 id="analytics-heading" className="text-2xl font-bold text-white">
        Analytics
      </h1>
      <p className="mt-1 text-sm text-gray-400">
        Real-time event summary for the Build Me platform.
      </p>

      {loading ? <LoadingState /> : null}

      {!loading && error ? (
        <ErrorState message={error} onRetry={loadSummary} />
      ) : null}

      {!loading && !error && summary ? (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total events" value={summary.totalEvents} />
            <StatCard label="Views" value={totalViews} />
            <StatCard label="Clicks" value={totalClicks} />
            <StatCard
              label="Unique events"
              value={Object.keys(summary.eventCounts).length}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <BarChart data={summary.dailyTotals} />

            <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
              <h3 className="text-sm font-semibold text-white">
                Event breakdown
              </h3>
              {Object.keys(summary.eventCounts).length === 0 ? (
                <p className="mt-3 text-sm text-gray-400">
                  No events recorded yet.
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {Object.entries(summary.eventCounts)
                    .sort((a, b) => b[1] - a[1])
                    .map(([name, count]) => (
                      <li
                        key={name}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-gray-300">
                          {formatLabel(name)}
                        </span>
                        <span className="font-semibold text-white">
                          {count}
                        </span>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
            <h3 className="text-sm font-semibold text-white">
              Recent events
            </h3>
            {summary.recentEvents.length === 0 ? (
              <p className="mt-3 text-sm text-gray-400">
                No recent events recorded.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-gray-800">
                {summary.recentEvents.map((event, index) => (
                  <li
                    key={`${event.name}-${event.createdAt}-${index}`}
                    className="flex items-center justify-between py-2 text-sm"
                  >
                    <span className="text-gray-300">
                      {formatLabel(event.name)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {event.eventType} ·{" "}
                      {new Date(event.createdAt).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}