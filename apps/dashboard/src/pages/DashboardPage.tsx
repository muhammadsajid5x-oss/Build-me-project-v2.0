import { useCallback, useEffect, useState } from "react";
import { isUnauthorizedError } from "@build-me/utils";

import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import { apiClient } from "../services/apiClient";

export type DeliveryProjectRequest = {
  id: string;
  name: string;
  email: string;
  projectDescription: string;
  expectedOutcome: string;
  timeline?: string;
  budget?: string;
  status: string;
  createdAt: string;
};

type DeliveryProjectRequestsResponse = {
  data: DeliveryProjectRequest[];
};

const loadErrorMessage =
  "Delivery project requests could not be loaded. Please try again.";
const unauthorizedMessage =
  "You are not authorised to view delivery project requests.";

function formatCreatedAt(value: string): string {
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

export default function DashboardPage() {
  const [requests, setRequests] = useState<DeliveryProjectRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<DeliveryProjectRequestsResponse>(
        "api/v1/delivery-project-requests",
      );

      setRequests(Array.isArray(response?.data) ? response.data : []);
    } catch (caught) {
      setError(isUnauthorizedError(caught) ? unauthorizedMessage : loadErrorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  return (
    <section aria-labelledby="dashboard-heading">
      <h1 id="dashboard-heading" className="text-3xl font-bold">
        Dashboard
      </h1>
      <p className="mt-2">Authenticated Build Me application foundation.</p>

      <h2 className="mt-8 text-xl font-semibold">Delivery project requests</h2>

      {loading ? <LoadingState /> : null}

      {!loading && error ? (
        <ErrorState message={error} onRetry={() => void loadRequests()} />
      ) : null}

      {!loading && !error && requests.length === 0 ? (
        <EmptyState message="No delivery project requests yet." />
      ) : null}

      {!loading && !error && requests.length > 0 ? (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">
              Delivery project requests, newest first
            </caption>
            <thead>
              <tr>
                <th scope="col" className="border-b px-3 py-2 font-semibold">
                  Name
                </th>
                <th scope="col" className="border-b px-3 py-2 font-semibold">
                  Email
                </th>
                <th scope="col" className="border-b px-3 py-2 font-semibold">
                  Project description
                </th>
                <th scope="col" className="border-b px-3 py-2 font-semibold">
                  Expected outcome
                </th>
                <th scope="col" className="border-b px-3 py-2 font-semibold">
                  Timeline
                </th>
                <th scope="col" className="border-b px-3 py-2 font-semibold">
                  Budget
                </th>
                <th scope="col" className="border-b px-3 py-2 font-semibold">
                  Status
                </th>
                <th scope="col" className="border-b px-3 py-2 font-semibold">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id} className="align-top">
                  <td className="border-b px-3 py-2">{request.name}</td>
                  <td className="border-b px-3 py-2">{request.email}</td>
                  <td className="border-b px-3 py-2">
                    {request.projectDescription}
                  </td>
                  <td className="border-b px-3 py-2">
                    {request.expectedOutcome}
                  </td>
                  <td className="border-b px-3 py-2">{request.timeline ?? "—"}</td>
                  <td className="border-b px-3 py-2">{request.budget ?? "—"}</td>
                  <td className="border-b px-3 py-2">{request.status}</td>
                  <td className="border-b px-3 py-2">
                    {formatCreatedAt(request.createdAt)}
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
