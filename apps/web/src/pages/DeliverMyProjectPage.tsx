import { SyntheticEvent, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { ANALYTICS_EVENTS, trackAnalyticsEvent } from "../analytics";
import { getApiBaseUrl } from "../api-url";

const apiBaseUrl = getApiBaseUrl(import.meta.env.VITE_API_URL);

const DELIVER_MY_PROJECT_PATH = "/deliver-my-project";

type FormData = {
  name: string;
  email: string;
  projectDescription: string;
  expectedOutcome: string;
  timeline: string;
  budget: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

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

type Booking = {
  id: string;
  leadId: string;
  planId: string;
  service: string;
  planName: string;
  price: number;
  currency: string;
  billingPeriod: string;
  status: "pending_payment" | "paid" | "cancelled";
  createdAt: string;
};

type Invoice = {
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

const timelineOptions = [
  "As soon as possible",
  "2–4 weeks",
  "1–2 months",
  "2–3 months",
  "3+ months",
  "Not sure yet",
];

const budgetOptions = [
  "Under $500",
  "$500–$1,000",
  "$1,000–$2,500",
  "$2,500–$5,000",
  "$5,000+",
  "Not sure yet",
];

const initialFormData: FormData = {
  name: "",
  email: "",
  projectDescription: "",
  expectedOutcome: "",
  timeline: "",
  budget: "",
};

const maxLengths: Record<keyof FormData, number> = {
  name: 100,
  email: 254,
  projectDescription: 2000,
  expectedOutcome: 2000,
  timeline: 100,
  budget: 100,
};

const genericSubmitError =
  "We could not submit your request right now. Please try again in a moment.";

function formatPrice(plan: ServicePlan) {
  const amount = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(plan.price);

  return plan.billingPeriod === "monthly" ? `$${amount} / mo` : `$${amount}`;
}

function readFieldErrors(body: unknown): FormErrors {
  if (typeof body !== "object" || body === null) {
    return {};
  }

  const error = (body as { error?: unknown }).error;

  if (typeof error !== "object" || error === null) {
    return {};
  }

  const details = (error as { details?: unknown }).details;

  if (!Array.isArray(details)) {
    return {};
  }

  const fieldErrors: FormErrors = {};

  for (const detail of details) {
    if (typeof detail !== "object" || detail === null) {
      continue;
    }

    const { field, message } = detail as {
      field?: unknown;
      message?: unknown;
    };

    if (typeof field !== "string" || typeof message !== "string") {
      continue;
    }

    if (!Object.hasOwn(initialFormData, field)) {
      continue;
    }

    fieldErrors[field as keyof FormData] = message;
  }

  return fieldErrors;
}

function validateForm(formData: FormData): FormErrors {
  const errors: FormErrors = {};

  if (!formData.name.trim()) {
    errors.name = "Name is required.";
  } else if (formData.name.trim().length > maxLengths.name) {
    errors.name = `Name must be ${maxLengths.name} characters or fewer.`;
  }

  if (!formData.email.trim()) {
    errors.email = "Email is required.";
  } else if (formData.email.trim().length > maxLengths.email) {
    errors.email = `Email must be ${maxLengths.email} characters or fewer.`;
  } else {
    const emailValue = formData.email.trim();
    const atIndex = emailValue.indexOf("@");
    const dotIndex = emailValue.lastIndexOf(".");

    const isValidEmail =
      atIndex > 0 && dotIndex > atIndex + 1 && dotIndex < emailValue.length - 1;

    if (!isValidEmail) {
      errors.email = "Please enter a valid email address.";
    }
  }

  if (!formData.projectDescription.trim()) {
    errors.projectDescription = "Tell us what you want to build.";
  } else if (
    formData.projectDescription.trim().length > maxLengths.projectDescription
  ) {
    errors.projectDescription = `Use ${maxLengths.projectDescription} characters or fewer.`;
  }

  if (!formData.expectedOutcome.trim()) {
    errors.expectedOutcome = "Tell us the outcome you want.";
  } else if (
    formData.expectedOutcome.trim().length > maxLengths.expectedOutcome
  ) {
    errors.expectedOutcome = `Use ${maxLengths.expectedOutcome} characters or fewer.`;
  }

  if (formData.timeline.trim().length > maxLengths.timeline) {
    errors.timeline = `Use ${maxLengths.timeline} characters or fewer.`;
  }

  if (formData.budget.trim().length > maxLengths.budget) {
    errors.budget = `Use ${maxLengths.budget} characters or fewer.`;
  }

  return errors;
}

export default function DeliverMyProjectPage() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [plans, setPlans] = useState<ServicePlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [plansError, setPlansError] = useState<string | null>(null);

  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [booking, setBooking] = useState<Booking | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  const hasTrackedView = useRef(false);

  useEffect(() => {
    if (hasTrackedView.current) {
      return;
    }

    hasTrackedView.current = true;

    trackAnalyticsEvent({
      name: ANALYTICS_EVENTS.DELIVER_MY_PROJECT_VIEWED,
      eventType: "view",
      path: DELIVER_MY_PROJECT_PATH,
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadPlans() {
      try {
        setIsLoadingPlans(true);
        setPlansError(null);

        const response = await fetch(`${apiBaseUrl}/api/v1/service-plans`);

        if (!response.ok) {
          throw new Error("Unable to load pricing plans.");
        }

        const body = (await response.json()) as {
          data?: ServicePlan[];
        };

        if (!cancelled) {
          const deliveryPlans = (body.data ?? []).filter(
            (plan) => plan.active && plan.service === "deliver-my-project",
          );

          setPlans(deliveryPlans);
        }
      } catch {
        if (!cancelled) {
          setPlansError("Unable to load plans. Please refresh and try again.");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingPlans(false);
        }
      }
    }

    void loadPlans();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId) ?? null;

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));

    setSubmitError(null);
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlanId(planId);
    setSubmitError(null);
  };

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedPlan) {
      setSubmitError("Choose a delivery plan first.");
      return;
    }

    const nextErrors = validateForm(formData);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setSubmitError(null);
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setSubmitError(null);

    try {
      const leadResponse = await fetch(
        `${apiBaseUrl}/api/v1/delivery-project-requests`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.trim(),
            projectDescription: formData.projectDescription.trim(),
            expectedOutcome: formData.expectedOutcome.trim(),
            ...(formData.timeline.trim()
              ? { timeline: formData.timeline.trim() }
              : {}),
            ...(formData.budget.trim()
              ? { budget: formData.budget.trim() }
              : {}),
          }),
        },
      );

      const leadBody = (await leadResponse.json().catch(() => null)) as {
        data?: {
          id?: string;
        };
      } | null;

      if (leadResponse.status !== 201 || !leadBody?.data?.id) {
        const fieldErrors = readFieldErrors(leadBody);

        if (leadResponse.status === 400 && Object.keys(fieldErrors).length) {
          setErrors(fieldErrors);
          setSubmitError("Please review the highlighted fields.");
          return;
        }

        throw new Error("DELIVERY_REQUEST_FAILED");
      }

      const leadId = leadBody.data.id;

      const bookingResponse = await fetch(`${apiBaseUrl}/api/v1/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leadId,
          planId: selectedPlan.id,
        }),
      });

      const bookingBody = (await bookingResponse.json().catch(() => null)) as {
        data?: Booking;
      } | null;

      if (bookingResponse.status !== 201 || !bookingBody?.data) {
        throw new Error("BOOKING_FAILED");
      }

      const createdBooking = bookingBody.data;

      setBooking(createdBooking);

      const invoiceResponse = await fetch(`${apiBaseUrl}/api/v1/invoices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: createdBooking.id,
        }),
      });

      const invoiceBody = (await invoiceResponse.json().catch(() => null)) as {
        data?: Invoice;
      } | null;

      if (invoiceResponse.status !== 201 || !invoiceBody?.data) {
        throw new Error("INVOICE_FAILED");
      }

      setInvoice(invoiceBody.data);

      trackAnalyticsEvent({
        name: ANALYTICS_EVENTS.DELIVER_MY_PROJECT_COMPLETED,
        eventType: "click",
        path: DELIVER_MY_PROJECT_PATH,
      });
    } catch {
      setSubmitError(genericSubmitError);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (booking && invoice && selectedPlan) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <section
          aria-labelledby="delivery-project-success-heading"
          className="rounded-2xl border-2 border-blue-700 bg-white p-5 sm:p-8"
        >
          <div className="rounded-2xl bg-blue-100 p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              Work With Me
            </p>

            <h1
              id="delivery-project-success-heading"
              className="mt-2 text-3xl font-bold tracking-tight text-black sm:text-4xl"
            >
              Booking received
            </h1>

            <p className="mt-2 text-sm font-medium text-black/70">
              Your project request is ready.
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border-2 border-blue-100 bg-white p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                Plan
              </p>

              <p className="mt-2 text-xl font-bold text-black">
                {selectedPlan.planName}
              </p>

              <p className="mt-2 text-2xl font-bold text-blue-700">
                {formatPrice(selectedPlan)}
              </p>
            </div>

            <div className="rounded-xl border-2 border-blue-100 bg-white p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                Invoice
              </p>

              <p className="mt-2 text-xl font-bold text-black">
                {invoice.invoiceNumber}
              </p>

              <p className="mt-2 text-lg font-bold text-blue-700">
                {invoice.currency} {invoice.amount}
              </p>

              <p className="mt-1 text-sm font-medium text-black/60">
                Payment pending
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-blue-100 px-5 py-4">
            <p className="text-sm font-medium leading-6 text-black">
              Booking created successfully.
            </p>
          </div>

          <div className="mt-6">
            <Link
              to="/#work-with-me"
              className="inline-flex items-center rounded-xl border-2 border-blue-700 bg-white px-5 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
            >
              Back to Work With Me
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mb-6 rounded-xl bg-blue-100 px-4 py-3 sm:px-5"
      >
        <ol className="flex flex-wrap items-center gap-2 text-sm">
          <li>
            <Link
              to="/"
              className="font-semibold text-blue-700 transition hover:underline focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
            >
              Home
            </Link>
          </li>

          <li aria-hidden="true" className="font-bold text-black/40">
            /
          </li>

          <li>
            <Link
              to="/#work-with-me"
              className="font-semibold text-blue-700 transition hover:underline focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
            >
              Work With Me
            </Link>
          </li>

          <li aria-hidden="true" className="font-bold text-black/40">
            /
          </li>

          <li aria-current="page" className="font-bold text-black">
            Deliver My Project
          </li>
        </ol>
      </nav>

      {/* Header */}
      <section
        aria-labelledby="delivery-project-heading"
        className="rounded-2xl bg-blue-100 p-6 sm:p-8"
      >
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
          Work With Me
        </p>

        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1
              id="delivery-project-heading"
              className="text-3xl font-bold tracking-tight text-black sm:text-4xl"
            >
              Deliver My Project
            </h1>

            <p className="mt-2 text-sm font-medium text-black/70">
              Choose a plan and share the essentials.
            </p>
          </div>

          <div className="shrink-0 self-start rounded-full border-2 border-blue-700 bg-white px-4 py-2 text-xs font-bold text-blue-700 sm:self-auto">
            01 / 02
          </div>
        </div>
      </section>

      {/* Plans */}
      <section aria-labelledby="delivery-price-plans-heading" className="mt-8">
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
            Step 01
          </p>

          <h2
            id="delivery-price-plans-heading"
            className="mt-1 text-2xl font-bold tracking-tight text-black"
          >
            Choose a plan
          </h2>
        </div>

        {isLoadingPlans && (
          <div className="rounded-2xl border-2 border-blue-100 bg-blue-100 px-6 py-8 text-center">
            <p className="text-sm font-semibold text-black">Loading plans...</p>
          </div>
        )}

        {plansError && (
          <div
            role="alert"
            className="rounded-2xl border-2 border-blue-700 bg-blue-100 px-6 py-4 text-sm font-semibold text-black"
          >
            {plansError}
          </div>
        )}

        {!isLoadingPlans && !plansError && (
          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => {
              const isSelected = selectedPlanId === plan.id;

              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => handlePlanSelect(plan.id)}
                  aria-pressed={isSelected}
                  className={`group flex min-h-52 flex-col rounded-2xl border-2 p-5 text-left transition focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 ${
                    isSelected
                      ? "border-blue-700 bg-blue-700 text-white"
                      : "border-blue-100 bg-white text-black hover:border-blue-700 hover:bg-blue-100"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
                        isSelected
                          ? "bg-white text-blue-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {plan.billingPeriod === "monthly" ? "Monthly" : "Project"}
                    </span>

                    {isSelected && (
                      <span className="text-sm font-bold" aria-hidden="true">
                        ✓
                      </span>
                    )}
                  </div>

                  <h3 className="mt-5 text-xl font-bold">{plan.planName}</h3>

                  <p
                    className={`mt-2 line-clamp-2 text-sm leading-5 ${
                      isSelected ? "text-white/80" : "text-black/60"
                    }`}
                  >
                    {plan.description}
                  </p>

                  <div className="mt-auto pt-5">
                    <p
                      className={`text-2xl font-bold ${
                        isSelected ? "text-white" : "text-blue-700"
                      }`}
                    >
                      {formatPrice(plan)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        noValidate
        aria-busy={isSubmitting}
        className="mt-8 rounded-2xl border-2 border-blue-100 bg-white p-5 sm:p-7"
      >
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              Step 02
            </p>

            <h2 className="mt-1 text-2xl font-bold tracking-tight text-black">
              Project details
            </h2>
          </div>

          {selectedPlan && (
            <div className="rounded-xl bg-blue-100 px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-blue-700">
                Selected plan
              </p>

              <div className="mt-1 flex items-center justify-between gap-4">
                <span className="text-sm font-bold text-black">
                  {selectedPlan.planName}
                </span>

                <span className="text-sm font-bold text-blue-700">
                  {formatPrice(selectedPlan)}
                </span>
              </div>
            </div>
          )}
        </div>

        {!selectedPlan && (
          <div className="mb-6 rounded-xl bg-blue-100 px-4 py-3">
            <p className="text-sm font-semibold text-black">
              Choose a plan above to continue.
            </p>
          </div>
        )}

        {submitError && (
          <div
            role="alert"
            className="mb-6 rounded-xl border-2 border-blue-700 bg-blue-100 px-4 py-3 text-sm font-semibold text-black"
          >
            {submitError}
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-bold text-black"
            >
              Name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={(event) => updateField("name", event.target.value)}
              maxLength={maxLengths.name}
              autoComplete="name"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "name-error" : undefined}
              className="mt-2 w-full rounded-xl border-2 border-blue-100 bg-white px-4 py-3 text-black outline-none transition placeholder:text-black/40 focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              placeholder="Your name"
            />

            {errors.name && (
              <p
                id="name-error"
                className="mt-1.5 text-xs font-semibold text-blue-700"
              >
                {errors.name}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-bold text-black"
            >
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={(event) => updateField("email", event.target.value)}
              maxLength={maxLengths.email}
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
              className="mt-2 w-full rounded-xl border-2 border-blue-100 bg-white px-4 py-3 text-black outline-none transition placeholder:text-black/40 focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              placeholder="you@example.com"
            />

            {errors.email && (
              <p
                id="email-error"
                className="mt-1.5 text-xs font-semibold text-blue-700"
              >
                {errors.email}
              </p>
            )}
          </div>

          {/* Project */}
          <div className="sm:col-span-2">
            <label
              htmlFor="projectDescription"
              className="block text-sm font-bold text-black"
            >
              What are you building?
            </label>

            <textarea
              id="projectDescription"
              name="projectDescription"
              rows={4}
              value={formData.projectDescription}
              onChange={(event) =>
                updateField("projectDescription", event.target.value)
              }
              maxLength={maxLengths.projectDescription}
              aria-invalid={Boolean(errors.projectDescription)}
              aria-describedby={
                errors.projectDescription
                  ? "project-description-error"
                  : undefined
              }
              className="mt-2 w-full resize-y rounded-xl border-2 border-blue-100 bg-white px-4 py-3 text-black outline-none transition placeholder:text-black/40 focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              placeholder="A short description of the project..."
            />

            {errors.projectDescription && (
              <p
                id="project-description-error"
                className="mt-1.5 text-xs font-semibold text-blue-700"
              >
                {errors.projectDescription}
              </p>
            )}
          </div>

          {/* Outcome */}
          <div className="sm:col-span-2">
            <label
              htmlFor="expectedOutcome"
              className="block text-sm font-bold text-black"
            >
              What does success look like?
            </label>

            <textarea
              id="expectedOutcome"
              name="expectedOutcome"
              rows={3}
              value={formData.expectedOutcome}
              onChange={(event) =>
                updateField("expectedOutcome", event.target.value)
              }
              maxLength={maxLengths.expectedOutcome}
              aria-invalid={Boolean(errors.expectedOutcome)}
              aria-describedby={
                errors.expectedOutcome ? "expected-outcome-error" : undefined
              }
              className="mt-2 w-full resize-y rounded-xl border-2 border-blue-100 bg-white px-4 py-3 text-black outline-none transition placeholder:text-black/40 focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              placeholder="The outcome you want to achieve..."
            />

            {errors.expectedOutcome && (
              <p
                id="expected-outcome-error"
                className="mt-1.5 text-xs font-semibold text-blue-700"
              >
                {errors.expectedOutcome}
              </p>
            )}
          </div>

          {/* Timeline */}
          <div>
            <label
              htmlFor="timeline"
              className="block text-sm font-bold text-black"
            >
              Timeline
            </label>

            <select
              id="timeline"
              name="timeline"
              value={formData.timeline}
              onChange={(event) => updateField("timeline", event.target.value)}
              aria-invalid={Boolean(errors.timeline)}
              aria-describedby={errors.timeline ? "timeline-error" : undefined}
              className="mt-2 w-full appearance-none rounded-xl border-2 border-blue-100 bg-white px-4 py-3 text-black outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Select timeline</option>

              {timelineOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            {errors.timeline && (
              <p
                id="timeline-error"
                className="mt-1.5 text-xs font-semibold text-blue-700"
              >
                {errors.timeline}
              </p>
            )}
          </div>

          {/* Budget */}
          <div>
            <label
              htmlFor="budget"
              className="block text-sm font-bold text-black"
            >
              Estimated budget
            </label>

            <select
              id="budget"
              name="budget"
              value={formData.budget}
              onChange={(event) => updateField("budget", event.target.value)}
              aria-invalid={Boolean(errors.budget)}
              aria-describedby={errors.budget ? "budget-error" : undefined}
              className="mt-2 w-full appearance-none rounded-xl border-2 border-blue-100 bg-white px-4 py-3 text-black outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Select budget</option>

              {budgetOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            {errors.budget && (
              <p
                id="budget-error"
                className="mt-1.5 text-xs font-semibold text-blue-700"
              >
                {errors.budget}
              </p>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="mt-7 flex flex-col gap-4 border-t-2 border-blue-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-black">Ready to start?</p>

            <p className="mt-1 text-xs font-medium text-black/50">
              Your request will be saved for review.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !selectedPlan}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3.5 font-bold text-white transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            <span>
              {isSubmitting ? "Creating Booking..." : "Submit Project Request"}
            </span>

            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>
        </div>
      </form>
    </main>
  );
}
