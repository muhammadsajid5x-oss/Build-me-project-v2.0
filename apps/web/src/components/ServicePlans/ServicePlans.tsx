import { useEffect, useState } from "react";

type ServicePlan = {
  id: string;
  service: string;
  planName: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  billingPeriod: string;
  active: boolean;
};

type ServicePlansProps = {
  service: "deliver-my-project" | "mentor-me" | "coffee-with-me";
  selectedPlanId?: string;
  onSelectPlan: (plan: ServicePlan) => void;
};

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:3000";

function formatPrice(plan: ServicePlan) {
  const amount = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(plan.price);

  return plan.billingPeriod === "monthly" ? `$${amount} / mo` : `$${amount}`;
}

export default function ServicePlans({
  service,
  selectedPlanId,
  onSelectPlan,
}: Readonly<ServicePlansProps>) {
  const [plans, setPlans] = useState<ServicePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadPlans() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_BASE_URL}/api/v1/service-plans`);

        if (!response.ok) {
          throw new Error("Unable to load pricing plans.");
        }

        const body = (await response.json()) as {
          data?: ServicePlan[];
        };

        if (!cancelled) {
          setPlans(
            (body.data ?? []).filter(
              (plan) => plan.active && plan.service === service,
            ),
          );
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load pricing plans. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadPlans();

    return () => {
      cancelled = true;
    };
  }, [service]);

  if (loading) {
    return (
      <section aria-label="Price Plans" className="mt-10">
        <div className="rounded-xl bg-[#EBF3FE] px-6 py-8 text-center">
          <p className="text-sm font-medium text-slate-700">
            Loading price plans...
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section aria-label="Price Plans" className="mt-10">
        <div className="rounded-xl bg-[#EBF3FE] px-6 py-8 text-center">
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      </section>
    );
  }

  if (plans.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby={`${service}-price-plans-heading`}
      className="mt-10"
    >
      <div className="mb-6">
        <h2
          id={`${service}-price-plans-heading`}
          className="text-2xl font-bold text-blue-700 sm:text-3xl"
        >
          Price Plans
        </h2>

        <p className="mt-2 text-base text-slate-700">
          Choose the plan that best fits your needs.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const isSelected = selectedPlanId === plan.id;

          return (
            <article
              key={plan.id}
              className={`flex h-full flex-col rounded-xl border-2 bg-[#EBF3FE] p-6 transition ${
                isSelected ? "border-blue-600 shadow-md" : "border-transparent"
              }`}
            >
              <h3 className="text-xl font-bold text-slate-900">
                {plan.planName}
              </h3>

              <p className="mt-3 min-h-12 text-sm leading-6 text-slate-700">
                {plan.description}
              </p>

              <div className="mt-6">
                <span className="text-3xl font-bold text-blue-700">
                  {formatPrice(plan)}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onSelectPlan(plan)}
                className={`mt-auto inline-flex items-center justify-center rounded-lg px-5 py-3 text-base font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                  isSelected
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "border-2 border-blue-600 bg-white text-slate-900 hover:bg-blue-50"
                }`}
              >
                {isSelected ? "Selected" : "Choose Plan"}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
