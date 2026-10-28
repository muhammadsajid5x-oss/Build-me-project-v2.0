import { useCallback, useEffect, useState, useMemo } from "react";

import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import {
  type DeliveryProjectRequest,
  type MentorMeRequest,
  fetchAllRequests,
  formatCreatedAt,
} from "../services/requests";

export function DashboardContent() {
  const [requests, setRequests] = useState<DeliveryProjectRequest[]>([]);
  const [mentorRequests, setMentorRequests] = useState<MentorMeRequest[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchAllRequests();

      setRequests(result.deliveryRequests);
      setMentorRequests(result.mentorRequests);

      if (result.error) {
        setError(result.error);
      }
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

      {loading ? <LoadingState /> : null}

      {!loading && error ? (
        <ErrorState message={error} onRetry={() => void loadRequests()} />
      ) : null}

      {!loading && !error ? (
        <>
          <h2 className="mt-8 text-xl font-semibold">
            Delivery project requests
          </h2>

          {requests.length === 0 ? (
            <EmptyState message="No delivery project requests yet." />
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <caption className="sr-only">
                  Delivery project requests, newest first
                </caption>

                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="border-b px-3 py-2 font-semibold"
                    >
                      Name
                    </th>

                    <th
                      scope="col"
                      className="border-b px-3 py-2 font-semibold"
                    >
                      Email
                    </th>

                    <th
                      scope="col"
                      className="border-b px-3 py-2 font-semibold"
                    >
                      Project description
                    </th>

                    <th
                      scope="col"
                      className="border-b px-3 py-2 font-semibold"
                    >
                      Expected outcome
                    </th>

                    <th
                      scope="col"
                      className="border-b px-3 py-2 font-semibold"
                    >
                      Timeline
                    </th>

                    <th
                      scope="col"
                      className="border-b px-3 py-2 font-semibold"
                    >
                      Budget
                    </th>

                    <th
                      scope="col"
                      className="border-b px-3 py-2 font-semibold"
                    >
                      Status
                    </th>

                    <th
                      scope="col"
                      className="border-b px-3 py-2 font-semibold"
                    >
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

                      <td className="border-b px-3 py-2">
                        {request.timeline ?? "—"}
                      </td>

                      <td className="border-b px-3 py-2">
                        {request.budget ?? "—"}
                      </td>

                      <td className="border-b px-3 py-2">{request.status}</td>

                      <td className="border-b px-3 py-2">
                        {formatCreatedAt(request.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <h2 className="mt-10 text-xl font-semibold">Mentor Me requests</h2>

          {mentorRequests.length === 0 ? (
            <EmptyState message="No Mentor Me requests yet." />
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <caption className="sr-only">
                  Mentor Me requests, newest first
                </caption>

                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="border-b px-3 py-2 font-semibold"
                    >
                      Name
                    </th>

                    <th
                      scope="col"
                      className="border-b px-3 py-2 font-semibold"
                    >
                      Email
                    </th>

                    <th
                      scope="col"
                      className="border-b px-3 py-2 font-semibold"
                    >
                      Mentoring area
                    </th>

                    <th
                      scope="col"
                      className="border-b px-3 py-2 font-semibold"
                    >
                      What they need help with
                    </th>

                    <th
                      scope="col"
                      className="border-b px-3 py-2 font-semibold"
                    >
                      Experience / context
                    </th>

                    <th
                      scope="col"
                      className="border-b px-3 py-2 font-semibold"
                    >
                      Preferred format
                    </th>

                    <th
                      scope="col"
                      className="border-b px-3 py-2 font-semibold"
                    >
                      Availability
                    </th>

                    <th
                      scope="col"
                      className="border-b px-3 py-2 font-semibold"
                    >
                      Status
                    </th>

                    <th
                      scope="col"
                      className="border-b px-3 py-2 font-semibold"
                    >
                      Created
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {mentorRequests.map((request) => (
                    <tr key={request.id} className="align-top">
                      <td className="border-b px-3 py-2">{request.name}</td>

                      <td className="border-b px-3 py-2">{request.email}</td>

                      <td className="border-b px-3 py-2">
                        {request.mentoringArea}
                      </td>

                      <td className="border-b px-3 py-2">{request.helpWith}</td>

                      <td className="border-b px-3 py-2">
                        {request.experienceContext}
                      </td>

                      <td className="border-b px-3 py-2">
                        {request.preferredFormat ?? "—"}
                      </td>

                      <td className="border-b px-3 py-2">
                        {request.availability ?? "—"}
                      </td>

                      <td className="border-b px-3 py-2">{request.status}</td>

                      <td className="border-b px-3 py-2">
                        {formatCreatedAt(request.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : null}
    </section>
  );
}

export default function DashboardPage() {
  return <DashboardContent />;
}
