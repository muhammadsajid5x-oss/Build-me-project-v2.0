import { useCallback, useEffect, useState } from "react";

import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import {
  type DeliveryProjectRequest,
  type MentorMeRequest,
  type CoffeeWithMeRequest,
  fetchDeliveryProjectRequests,
  fetchMentorMeRequests,
  fetchCoffeeWithMeRequests,
  formatCreatedAt,
} from "../services/requests";

type Tab = "deliver" | "mentor" | "coffee";

const tabs: { id: Tab; label: string }[] = [
  { id: "deliver", label: "Deliver My Project" },
  { id: "mentor", label: "Mentor Me" },
  { id: "coffee", label: "Coffee With Me" },
];

export default function RequestsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("deliver");

  // Deliver My Project state
  const [deliveryRequests, setDeliveryRequests] = useState<
    DeliveryProjectRequest[]
  >([]);
  const [deliveryLoading, setDeliveryLoading] = useState(true);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);

  // Mentor Me state
  const [mentorRequests, setMentorRequests] = useState<MentorMeRequest[]>([]);
  const [mentorLoading, setMentorLoading] = useState(true);
  const [mentorError, setMentorError] = useState<string | null>(null);

  // Coffee With Me state
  const [coffeeRequests, setCoffeeRequests] = useState<CoffeeWithMeRequest[]>(
    [],
  );
  const [coffeeLoading, setCoffeeLoading] = useState(true);
  const [coffeeError, setCoffeeError] = useState<string | null>(null);

  const loadDeliveryRequests = useCallback(async () => {
    setDeliveryLoading(true);
    setDeliveryError(null);

    const result = await fetchDeliveryProjectRequests();
    setDeliveryRequests(result.data);
    if (result.error) {
      setDeliveryError(result.error);
    }
    setDeliveryLoading(false);
  }, []);

  const loadMentorRequests = useCallback(async () => {
    setMentorLoading(true);
    setMentorError(null);

    const result = await fetchMentorMeRequests();
    setMentorRequests(result.data);
    if (result.error) {
      setMentorError(result.error);
    }
    setMentorLoading(false);
  }, []);

  const loadCoffeeRequests = useCallback(async () => {
    setCoffeeLoading(true);
    setCoffeeError(null);

    const result = await fetchCoffeeWithMeRequests();
    setCoffeeRequests(result.data);
    if (result.error) {
      setCoffeeError(result.error);
    }
    setCoffeeLoading(false);
  }, []);

  // Load delivery requests on mount
  useEffect(() => {
    void loadDeliveryRequests();
  }, [loadDeliveryRequests]);

  // Load mentor requests when tab is activated
  useEffect(() => {
    if (activeTab === "mentor") {
      void loadMentorRequests();
    }
  }, [activeTab, loadMentorRequests]);

  // Load coffee requests when tab is activated
  useEffect(() => {
    if (activeTab === "coffee") {
      void loadCoffeeRequests();
    }
  }, [activeTab, loadCoffeeRequests]);

  return (
    <section aria-labelledby="requests-heading">
      <header className="mb-6">
        <h1 id="requests-heading" className="text-2xl font-bold text-white">
          Requests
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Manage your project delivery and mentorship requests.
        </p>
      </header>

      <nav aria-label="Request tabs" className="mb-6 border-b border-gray-800">
        <ul className="flex gap-8" role="tablist">
          {tabs.map((tab) => (
            <li key={tab.id} role="presentation">
              <button
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-${tab.id}`}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-white"
                    : "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600"
                }`}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div
        id="panel-deliver"
        role="tabpanel"
        aria-labelledby="tab-deliver"
        hidden={activeTab !== "deliver"}
      >
        <DeliverMyProjectContent
          requests={deliveryRequests}
          loading={deliveryLoading}
          error={deliveryError}
          onRetry={loadDeliveryRequests}
        />
      </div>

      <div
        id="panel-mentor"
        role="tabpanel"
        aria-labelledby="tab-mentor"
        hidden={activeTab !== "mentor"}
      >
        <MentorMeContent
          requests={mentorRequests}
          loading={mentorLoading}
          error={mentorError}
          onRetry={loadMentorRequests}
        />
      </div>

      <div
        id="panel-coffee"
        role="tabpanel"
        aria-labelledby="tab-coffee"
        hidden={activeTab !== "coffee"}
      >
        <CoffeeWithMeContent
          requests={coffeeRequests}
          loading={coffeeLoading}
          error={coffeeError}
          onRetry={loadCoffeeRequests}
        />
      </div>
    </section>
  );
}

function DeliverMyProjectContent({
  requests,
  loading,
  error,
  onRetry,
}: {
  requests: DeliveryProjectRequest[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (requests.length === 0) {
    return <EmptyState message="No Deliver My Project requests yet." />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-900/50">
      <table className="w-full" role="table">
        <thead>
          <tr className="border-b border-gray-700">
            <th
              scope="col"
              className="border-b px-3 py-2 font-semibold text-left"
            >
              Name
            </th>
            <th
              scope="col"
              className="border-b px-3 py-2 font-semibold text-left"
            >
              Email
            </th>
            <th
              scope="col"
              className="border-b px-3 py-2 font-semibold text-left"
            >
              Project Description
            </th>
            <th
              scope="col"
              className="border-b px-3 py-2 font-semibold text-left"
            >
              Expected Outcome
            </th>
            <th
              scope="col"
              className="border-b px-3 py-2 font-semibold text-left"
            >
              Timeline
            </th>
            <th
              scope="col"
              className="border-b px-3 py-2 font-semibold text-left"
            >
              Budget
            </th>
            <th
              scope="col"
              className="border-b px-3 py-2 font-semibold text-left"
            >
              Status
            </th>
            <th
              scope="col"
              className="border-b px-3 py-2 font-semibold text-left"
            >
              Created
            </th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request.id} className="align-top hover:bg-gray-800/50">
              <td className="border-b px-3 py-2">{request.name}</td>
              <td className="border-b px-3 py-2">{request.email}</td>
              <td className="border-b px-3 py-2">
                {request.projectDescription}
              </td>
              <td className="border-b px-3 py-2">{request.expectedOutcome}</td>
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
  );
}

function MentorMeContent({
  requests,
  loading,
  error,
  onRetry,
}: {
  requests: MentorMeRequest[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (requests.length === 0) {
    return <EmptyState message="No Mentor Me requests yet." />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-900/50">
      <table className="w-full" role="table">
        <thead>
          <tr className="border-b border-gray-700">
            <th
              scope="col"
              className="border-b px-3 py-2 font-semibold text-left"
            >
              Name
            </th>
            <th
              scope="col"
              className="border-b px-3 py-2 font-semibold text-left"
            >
              Email
            </th>
            <th
              scope="col"
              className="border-b px-3 py-2 font-semibold text-left"
            >
              Mentoring Area
            </th>
            <th
              scope="col"
              className="border-b px-3 py-2 font-semibold text-left"
            >
              Help With
            </th>
            <th
              scope="col"
              className="border-b px-3 py-2 font-semibold text-left"
            >
              Experience / Context
            </th>
            <th
              scope="col"
              className="border-b px-3 py-2 font-semibold text-left"
            >
              Preferred Format
            </th>
            <th
              scope="col"
              className="border-b px-3 py-2 font-semibold text-left"
            >
              Availability
            </th>
            <th
              scope="col"
              className="border-b px-3 py-2 font-semibold text-left"
            >
              Status
            </th>
            <th
              scope="col"
              className="border-b px-3 py-2 font-semibold text-left"
            >
              Created
            </th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request.id} className="align-top hover:bg-gray-800/50">
              <td className="border-b px-3 py-2">{request.name}</td>
              <td className="border-b px-3 py-2">{request.email}</td>
              <td className="border-b px-3 py-2">{request.mentoringArea}</td>
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
  );
}
function CoffeeWithMeContent({
  requests,
  loading,
  error,
  onRetry,
}: {
  requests: CoffeeWithMeRequest[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (requests.length === 0) {
    return <EmptyState message="No Coffee With Me requests yet." />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-900/50">
      <table className="w-full" role="table">
        <thead>
          <tr className="border-b border-gray-700">
            <th
              scope="col"
              className="border-b px-3 py-2 font-semibold text-left"
            >
              Name
            </th>
            <th
              scope="col"
              className="border-b px-3 py-2 font-semibold text-left"
            >
              Email
            </th>
            <th
              scope="col"
              className="border-b px-3 py-2 font-semibold text-left"
            >
              Topic
            </th>
            <th
              scope="col"
              className="border-b px-3 py-2 font-semibold text-left"
            >
              Preferred Format
            </th>
            <th
              scope="col"
              className="border-b px-3 py-2 font-semibold text-left"
            >
              Availability
            </th>
            <th
              scope="col"
              className="border-b px-3 py-2 font-semibold text-left"
            >
              Status
            </th>
            <th
              scope="col"
              className="border-b px-3 py-2 font-semibold text-left"
            >
              Created
            </th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request.id} className="align-top hover:bg-gray-800/50">
              <td className="border-b px-3 py-2">{request.name}</td>
              <td className="border-b px-3 py-2">{request.email}</td>
              <td className="border-b px-3 py-2">{request.topic}</td>
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
  );
}
