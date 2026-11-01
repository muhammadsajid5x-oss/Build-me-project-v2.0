import { useCallback, useEffect, useState } from "react";

import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import {
  type CoffeeWithMeRequest,
  type DeliveryProjectRequest,
  type MentorMeRequest,
  type OwnershipAuditRequest,
  fetchCoffeeWithMeRequests,
  fetchDeliveryProjectRequests,
  fetchMentorMeRequests,
  fetchOwnershipAuditRequests,
  formatCreatedAt,
} from "../services/requests";

type Tab = "deliver" | "mentor" | "coffee" | "ownership-audit";

const tabs: { id: Tab; label: string }[] = [
  { id: "deliver", label: "Deliver My Project" },
  { id: "mentor", label: "Mentor Me" },
  { id: "coffee", label: "Coffee With Me" },
  { id: "ownership-audit", label: "Ownership Audit" },
];

export default function RequestsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("deliver");

  const [deliveryRequests, setDeliveryRequests] = useState<
    DeliveryProjectRequest[]
  >([]);
  const [deliveryLoading, setDeliveryLoading] = useState(true);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);

  const [mentorRequests, setMentorRequests] = useState<MentorMeRequest[]>([]);
  const [mentorLoading, setMentorLoading] = useState(true);
  const [mentorError, setMentorError] = useState<string | null>(null);

  const [coffeeRequests, setCoffeeRequests] = useState<CoffeeWithMeRequest[]>(
    [],
  );
  const [coffeeLoading, setCoffeeLoading] = useState(true);
  const [coffeeError, setCoffeeError] = useState<string | null>(null);

  const [ownershipAuditRequests, setOwnershipAuditRequests] = useState<
    OwnershipAuditRequest[]
  >([]);
  const [ownershipAuditLoading, setOwnershipAuditLoading] = useState(true);
  const [ownershipAuditError, setOwnershipAuditError] = useState<string | null>(
    null,
  );

  const loadDeliveryRequests = useCallback(async () => {
    setDeliveryLoading(true);
    setDeliveryError(null);

    const result = await fetchDeliveryProjectRequests();

    setDeliveryRequests(result.data);
    setDeliveryError(result.error);
    setDeliveryLoading(false);
  }, []);

  const loadMentorRequests = useCallback(async () => {
    setMentorLoading(true);
    setMentorError(null);

    const result = await fetchMentorMeRequests();

    setMentorRequests(result.data);
    setMentorError(result.error);
    setMentorLoading(false);
  }, []);

  const loadCoffeeRequests = useCallback(async () => {
    setCoffeeLoading(true);
    setCoffeeError(null);

    const result = await fetchCoffeeWithMeRequests();

    setCoffeeRequests(result.data);
    setCoffeeError(result.error);
    setCoffeeLoading(false);
  }, []);

  const loadOwnershipAuditRequests = useCallback(async () => {
    setOwnershipAuditLoading(true);
    setOwnershipAuditError(null);

    const result = await fetchOwnershipAuditRequests();

    setOwnershipAuditRequests(result.data);
    setOwnershipAuditError(result.error);
    setOwnershipAuditLoading(false);
  }, []);

  useEffect(() => {
    void loadDeliveryRequests();
  }, [loadDeliveryRequests]);

  useEffect(() => {
    if (activeTab === "mentor") {
      void loadMentorRequests();
    }
  }, [activeTab, loadMentorRequests]);

  useEffect(() => {
    if (activeTab === "coffee") {
      void loadCoffeeRequests();
    }
  }, [activeTab, loadCoffeeRequests]);

  useEffect(() => {
    if (activeTab === "ownership-audit") {
      void loadOwnershipAuditRequests();
    }
  }, [activeTab, loadOwnershipAuditRequests]);

  return (
    <section aria-labelledby="requests-heading">
      <header className="mb-6">
        <h1 id="requests-heading" className="text-2xl font-bold text-white">
          Requests
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Manage your project delivery, mentorship, coffee, and ownership audit
          requests.
        </p>
      </header>

      <nav aria-label="Request tabs" className="mb-6 border-b border-gray-800">
        <ul className="flex flex-wrap gap-8" role="tablist">
          {tabs.map((tab) => (
            <li key={tab.id} role="presentation">
              <button
                role="tab"
                type="button"
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-${tab.id}`}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-white"
                    : "border-transparent text-gray-400 hover:border-gray-600 hover:text-gray-200"
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

      <div
        id="panel-ownership-audit"
        role="tabpanel"
        aria-labelledby="tab-ownership-audit"
        hidden={activeTab !== "ownership-audit"}
      >
        <OwnershipAuditContent
          requests={ownershipAuditRequests}
          loading={ownershipAuditLoading}
          error={ownershipAuditError}
          onRetry={loadOwnershipAuditRequests}
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
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            <th
              scope="col"
              className="border-b px-3 py-2 text-left font-semibold"
            >
              Name
            </th>
            <th
              scope="col"
              className="border-b px-3 py-2 text-left font-semibold"
            >
              Email
            </th>
            <th
              scope="col"
              className="border-b px-3 py-2 text-left font-semibold"
            >
              Project Description
            </th>
            <th
              scope="col"
              className="border-b px-3 py-2 text-left font-semibold"
            >
              Expected Outcome
            </th>
            <th
              scope="col"
              className="border-b px-3 py-2 text-left font-semibold"
            >
              Timeline
            </th>
            <th
              scope="col"
              className="border-b px-3 py-2 text-left font-semibold"
            >
              Budget
            </th>
            <th
              scope="col"
              className="border-b px-3 py-2 text-left font-semibold"
            >
              Status
            </th>
            <th
              scope="col"
              className="border-b px-3 py-2 text-left font-semibold"
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
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            <th
              scope="col"
              className="border-b px-3 py-2 text-left font-semibold"
            >
              Name
            </th>
            <th
              scope="col"
              className="border-b px-3 py-2 text-left font-semibold"
            >
              Email
            </th>
            <th
              scope="col"
              className="border-b px-3 py-2 text-left font-semibold"
            >
              Mentoring Area
            </th>
            <th
              scope="col"
              className="border-b px-3 py-2 text-left font-semibold"
            >
              Help With
            </th>
            <th
              scope="col"
              className="border-b px-3 py-2 text-left font-semibold"
            >
              Experience / Context
            </th>
            <th
              scope="col"
              className="border-b px-3 py-2 text-left font-semibold"
            >
              Preferred Format
            </th>
            <th
              scope="col"
              className="border-b px-3 py-2 text-left font-semibold"
            >
              Availability
            </th>
            <th
              scope="col"
              className="border-b px-3 py-2 text-left font-semibold"
            >
              Status
            </th>
            <th
              scope="col"
              className="border-b px-3 py-2 text-left font-semibold"
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
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            <th
              scope="col"
              className="border-b px-3 py-2 text-left font-semibold"
            >
              Name
            </th>
            <th
              scope="col"
              className="border-b px-3 py-2 text-left font-semibold"
            >
              Email
            </th>
            <th
              scope="col"
              className="border-b px-3 py-2 text-left font-semibold"
            >
              Topic
            </th>
            <th
              scope="col"
              className="border-b px-3 py-2 text-left font-semibold"
            >
              Preferred Format
            </th>
            <th
              scope="col"
              className="border-b px-3 py-2 text-left font-semibold"
            >
              Availability
            </th>
            <th
              scope="col"
              className="border-b px-3 py-2 text-left font-semibold"
            >
              Status
            </th>
            <th
              scope="col"
              className="border-b px-3 py-2 text-left font-semibold"
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

function OwnershipAuditContent({
  requests,
  loading,
  error,
  onRetry,
}: {
  requests: OwnershipAuditRequest[];
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
    return <EmptyState message="No Ownership Audit requests yet." />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-900/50">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            <th
              scope="col"
              className="border-b px-3 py-2 text-left font-semibold"
            >
              Visitor
            </th>
            <th
              scope="col"
              className="border-b px-3 py-2 text-left font-semibold"
            >
              Q1
            </th>
            <th
              scope="col"
              className="border-b px-3 py-2 text-left font-semibold"
            >
              Q2
            </th>
            <th
              scope="col"
              className="border-b px-3 py-2 text-left font-semibold"
            >
              Q3
            </th>
            <th
              scope="col"
              className="border-b px-3 py-2 text-left font-semibold"
            >
              Q4
            </th>
            <th
              scope="col"
              className="border-b px-3 py-2 text-left font-semibold"
            >
              Q5
            </th>
            <th
              scope="col"
              className="border-b px-3 py-2 text-left font-semibold"
            >
              Q6
            </th>
            <th
              scope="col"
              className="border-b px-3 py-2 text-left font-semibold"
            >
              Q7
            </th>
            <th
              scope="col"
              className="border-b px-3 py-2 text-left font-semibold"
            >
              Q8
            </th>
            <th
              scope="col"
              className="border-b px-3 py-2 text-left font-semibold"
            >
              Q9
            </th>
            <th
              scope="col"
              className="border-b px-3 py-2 text-left font-semibold"
            >
              Q10
            </th>
            <th
              scope="col"
              className="border-b px-3 py-2 text-left font-semibold"
            >
              Score
            </th>
            <th
              scope="col"
              className="border-b px-3 py-2 text-left font-semibold"
            >
              Category
            </th>
            <th
              scope="col"
              className="border-b px-3 py-2 text-left font-semibold"
            >
              Created
            </th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request.id} className="align-top hover:bg-gray-800/50">
              <td className="border-b px-3 py-2">
                <div className="min-w-40">
                  <div className="font-medium text-white">
                    {request.fullName || "Anonymous"}
                  </div>
                  <div className="text-sm text-gray-400">
                    {request.visitorEmail ?? "No email"}
                  </div>
                </div>
              </td>

              <td className="border-b px-3 py-2">
                {request.answers?.q1 ?? "—"}
              </td>
              <td className="border-b px-3 py-2">
                {request.answers?.q2 ?? "—"}
              </td>
              <td className="border-b px-3 py-2">
                {request.answers?.q3 ?? "—"}
              </td>
              <td className="border-b px-3 py-2">
                {request.answers?.q4 ?? "—"}
              </td>
              <td className="border-b px-3 py-2">
                {request.answers?.q5 ?? "—"}
              </td>
              <td className="border-b px-3 py-2">
                {request.answers?.q6 ?? "—"}
              </td>
              <td className="border-b px-3 py-2">
                {request.answers?.q7 ?? "—"}
              </td>
              <td className="border-b px-3 py-2">
                {request.answers?.q8 ?? "—"}
              </td>
              <td className="border-b px-3 py-2">
                {request.answers?.q9 ?? "—"}
              </td>
              <td className="border-b px-3 py-2">
                {request.answers?.q10 ?? "—"}
              </td>

              <td className="border-b px-3 py-2 font-semibold">
                {request.score}
              </td>

              <td className="border-b px-3 py-2">{request.category}</td>

              <td className="border-b px-3 py-2 whitespace-nowrap">
                {formatCreatedAt(request.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
