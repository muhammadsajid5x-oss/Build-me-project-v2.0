import { useCallback, useEffect, useMemo, useState } from "react";

import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import {
  fetchFeedback,
  formatFeedbackDate,
  getFeedbackTypeLabel,
  type FeedbackRecord,
  type FeedbackType,
} from "../services/feedback";

type FeedbackFilter = "all" | FeedbackType;

const filters: {
  id: FeedbackFilter;
  label: string;
}[] = [
  { id: "all", label: "All" },
  { id: "score", label: "Score" },
  { id: "rate", label: "Rating" },
  { id: "suggestion", label: "Suggestions" },
  { id: "complaint", label: "Report Issues" },
];

function getFeedbackValue(feedback: FeedbackRecord): string {
  if (feedback.type === "score") {
    if (feedback.score !== null) {
      return `${feedback.score}/10`;
    }

    return "—";
  }

  if (feedback.type === "rate") {
    if (feedback.rating !== null) {
      return `${feedback.rating}/5`;
    }

    return "—";
  }

  return "—";
}

function getTypeBadgeClass(type: FeedbackType): string {
  if (type === "score") {
    return "bg-blue-100 text-blue-700";
  }

  if (type === "rate") {
    return "bg-indigo-100 text-indigo-700";
  }

  if (type === "suggestion") {
    return "bg-green-100 text-green-700";
  }

  return "bg-red-100 text-red-700";
}

function getFilterCount(
  filterId: FeedbackFilter,
  counts: {
    all: number;
    score: number;
    rate: number;
    suggestion: number;
    complaint: number;
  },
): number {
  return counts[filterId];
}

function getEmptyMessage(activeFilter: FeedbackFilter): string {
  if (activeFilter === "all") {
    return "No feedback has been submitted yet.";
  }

  const activeFilterItem = filters.find((filter) => filter.id === activeFilter);

  if (!activeFilterItem) {
    return "No feedback has been submitted yet.";
  }

  return `No ${activeFilterItem.label.toLowerCase()} feedback yet.`;
}

function FeedbackTable({ feedback }: { readonly feedback: FeedbackRecord[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-900/50">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            <th
              scope="col"
              className="px-3 py-3 text-left text-sm font-semibold"
            >
              Reference
            </th>

            <th
              scope="col"
              className="px-3 py-3 text-left text-sm font-semibold"
            >
              Type
            </th>

            <th
              scope="col"
              className="px-3 py-3 text-left text-sm font-semibold"
            >
              Name
            </th>

            <th
              scope="col"
              className="px-3 py-3 text-left text-sm font-semibold"
            >
              Email
            </th>

            <th
              scope="col"
              className="px-3 py-3 text-left text-sm font-semibold"
            >
              Score / Rating
            </th>

            <th
              scope="col"
              className="px-3 py-3 text-left text-sm font-semibold"
            >
              Title
            </th>

            <th
              scope="col"
              className="px-3 py-3 text-left text-sm font-semibold"
            >
              Feedback
            </th>

            <th
              scope="col"
              className="px-3 py-3 text-left text-sm font-semibold"
            >
              Created
            </th>
          </tr>
        </thead>

        <tbody>
          {feedback.map((item) => (
            <tr key={item.id} className="align-top hover:bg-gray-800/50">
              <td className="whitespace-nowrap border-b px-3 py-3 text-sm">
                {item.referenceId}
              </td>

              <td className="border-b px-3 py-3 text-sm">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getTypeBadgeClass(
                    item.type,
                  )}`}
                >
                  {getFeedbackTypeLabel(item.type)}
                </span>
              </td>

              <td className="border-b px-3 py-3 text-sm">{item.name}</td>

              <td className="border-b px-3 py-3 text-sm">{item.email}</td>

              <td className="border-b px-3 py-3 text-sm font-medium">
                {getFeedbackValue(item)}
              </td>

              <td className="max-w-xs border-b px-3 py-3 text-sm">
                {item.title ?? "—"}
              </td>

              <td className="max-w-md border-b px-3 py-3 text-sm">
                <p className="whitespace-pre-wrap wrap-break-word">
                  {item.content}
                </p>
              </td>

              <td className="whitespace-nowrap border-b px-3 py-3 text-sm">
                {formatFeedbackDate(item.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function FeedbackPage() {
  const [activeFilter, setActiveFilter] = useState<FeedbackFilter>("all");

  const [feedback, setFeedback] = useState<FeedbackRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFeedback = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await fetchFeedback();

    setFeedback(result.data);
    setError(result.error);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadFeedback();
  }, [loadFeedback]);

  const filteredFeedback = useMemo(() => {
    if (activeFilter === "all") {
      return feedback;
    }

    return feedback.filter((item) => item.type === activeFilter);
  }, [activeFilter, feedback]);

  const counts = useMemo(() => {
    return {
      all: feedback.length,
      score: feedback.filter((item) => item.type === "score").length,
      rate: feedback.filter((item) => item.type === "rate").length,
      suggestion: feedback.filter((item) => item.type === "suggestion").length,
      complaint: feedback.filter((item) => item.type === "complaint").length,
    };
  }, [feedback]);

  const renderFeedbackContent = () => {
    if (loading) {
      return <LoadingState />;
    }

    if (error) {
      return (
        <ErrorState
          message={error}
          onRetry={() => {
            void loadFeedback();
          }}
        />
      );
    }

    if (filteredFeedback.length === 0) {
      return <EmptyState message={getEmptyMessage(activeFilter)} />;
    }

    return <FeedbackTable feedback={filteredFeedback} />;
  };

  return (
    <section aria-labelledby="feedback-heading">
      <header className="mb-6">
        <h1 id="feedback-heading" className="text-2xl font-bold text-white">
          Feedback
        </h1>

        <p className="mt-1 text-sm text-gray-400">
          Review visitor scores, ratings, suggestions, and reported issues.
        </p>
      </header>

      <nav
        aria-label="Feedback filters"
        className="mb-6 border-b border-gray-800"
      >
        <ul className="flex flex-wrap gap-8">
          {filters.map((filter) => {
            const isActive = activeFilter === filter.id;
            const count = getFilterCount(filter.id, counts);

            return (
              <li key={filter.id}>
                <button
                  role="tab"
                  type="button"
                  aria-selected={isActive}
                  aria-controls={`feedback-panel-${filter.id}`}
                  id={`feedback-tab-${filter.id}`}
                  onClick={() => setActiveFilter(filter.id)}
                  className={[
                    "flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-medium transition-colors",
                    isActive
                      ? "border-blue-500 text-white"
                      : "border-transparent text-gray-400 hover:border-gray-600 hover:text-gray-200",
                  ].join(" ")}
                >
                  <span>{filter.label}</span>

                  <span
                    className={[
                      "rounded-full px-2 py-0.5 text-xs",
                      isActive
                        ? "bg-blue-600 text-white"
                        : "bg-gray-800 text-gray-400",
                    ].join(" ")}
                  >
                    {count}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div
        id={`feedback-panel-${activeFilter}`}
        role="tabpanel"
        aria-labelledby={`feedback-tab-${activeFilter}`}
      >
        {renderFeedbackContent()}
      </div>
    </section>
  );
}
