import { SyntheticEvent, useEffect, useRef, useState } from "react";

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
    errors.projectDescription = "Project description is required.";
  } else if (
    formData.projectDescription.trim().length > maxLengths.projectDescription
  ) {
    errors.projectDescription = `Project description must be ${maxLengths.projectDescription} characters or fewer.`;
  }

  if (!formData.expectedOutcome.trim()) {
    errors.expectedOutcome = "Expected outcome is required.";
  } else if (
    formData.expectedOutcome.trim().length > maxLengths.expectedOutcome
  ) {
    errors.expectedOutcome = `Expected outcome must be ${maxLengths.expectedOutcome} characters or fewer.`;
  }

  if (formData.timeline.trim().length > maxLengths.timeline) {
    errors.timeline = `Timeline must be ${maxLengths.timeline} characters or fewer.`;
  }

  if (formData.budget.trim().length > maxLengths.budget) {
    errors.budget = `Budget must be ${maxLengths.budget} characters or fewer.`;
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
          setPlansError(
            "Unable to load pricing plans. Please refresh the page and try again.",
          );
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

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedPlan) {
      setSubmitError("Please choose a price plan before submitting.");
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
      /*
       * Step 1:
       * Create the visitor's project request.
       *
       * The API returns the lead ID. We use that server-created ID for
       * the booking instead of trusting the browser with a fabricated ID.
       */
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
          setSubmitError("Please review the highlighted fields and try again.");
          return;
        }

        throw new Error("DELIVERY_REQUEST_FAILED");
      }

      const leadId = leadBody.data.id;

      /*
       * Step 2:
       * Create the booking.
       *
       * The backend looks up the selected plan and its price from the
       * database. The frontend never sends a price.
       */
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

      /*
       * Step 3:
       * Create the invoice from the booking.
       *
       * The backend uses the booking amount, so the invoice amount is also
       * controlled by the database-backed plan price.
       */
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
      <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
        <section
          aria-labelledby="delivery-project-success-heading"
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <p className="mb-2 text-sm font-medium uppercase tracking-wide text-blue-700">
            Deliver My Project
          </p>

          <h1
            id="delivery-project-success-heading"
            className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
          >
            Booking received
          </h1>

          <p className="mt-4 text-gray-600">
            Your project request and booking have been created successfully.
          </p>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl bg-[#EBF3FE] p-5">
              <p className="text-sm font-medium text-gray-600">Selected Plan</p>

              <p className="mt-2 text-xl font-bold text-gray-900">
                {selectedPlan.planName}
              </p>

              <p className="mt-2 text-2xl font-bold text-blue-700">
                {formatPrice(selectedPlan)}
              </p>
            </div>

            <div className="rounded-xl bg-[#EBF3FE] p-5">
              <p className="text-sm font-medium text-gray-600">Invoice</p>

              <p className="mt-2 text-xl font-bold text-gray-900">
                {invoice.invoiceNumber}
              </p>

              <p className="mt-2 text-lg font-semibold text-blue-700">
                {invoice.currency} {invoice.amount}
              </p>

              <p className="mt-1 text-sm font-medium text-gray-600">
                Payment: Pending
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-sm leading-6 text-gray-600">
              Your booking is currently pending payment. Payment processing will
              be connected separately.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
      <section aria-labelledby="delivery-project-heading">
        <p className="mb-2 text-sm font-medium uppercase tracking-wide text-blue-700">
          Work With Me
        </p>

        <h1
          id="delivery-project-heading"
          className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
        >
          Deliver My Project
        </h1>

        <p className="mt-4 max-w-2xl text-gray-600">
          Choose the delivery plan that fits your project, then tell me about
          what you want to build and the outcome you want to achieve.
        </p>
      </section>

      <section aria-labelledby="delivery-price-plans-heading" className="mt-10">
        <div className="mb-6">
          <h2
            id="delivery-price-plans-heading"
            className="text-2xl font-bold text-blue-700 sm:text-3xl"
          >
            Price Plans
          </h2>

          <p className="mt-2 text-gray-600">
            Choose the right level of delivery support for your project.
          </p>
        </div>

        {isLoadingPlans && (
          <div className="rounded-xl bg-[#EBF3FE] px-6 py-8 text-center">
            <p className="text-sm font-medium text-gray-700">
              Loading price plans...
            </p>
          </div>
        )}

        {plansError && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700"
          >
            {plansError}
          </div>
        )}

        {!isLoadingPlans && !plansError && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {plans.map((plan) => {
              const isSelected = selectedPlanId === plan.id;

              return (
                <article
                  key={plan.id}
                  className={`flex h-full flex-col rounded-xl border-2 bg-[#EBF3FE] p-6 transition ${
                    isSelected
                      ? "border-blue-600 shadow-md"
                      : "border-transparent"
                  }`}
                >
                  <h3 className="text-xl font-bold text-gray-900">
                    {plan.planName}
                  </h3>

                  <p className="mt-3 min-h-12 text-sm leading-6 text-gray-600">
                    {plan.description}
                  </p>

                  <p className="mt-6 text-3xl font-bold text-blue-700">
                    {formatPrice(plan)}
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPlanId(plan.id);
                      setSubmitError(null);
                    }}
                    className={`mt-6 inline-flex items-center justify-center rounded-lg px-5 py-3 text-base font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                      isSelected
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "border-2 border-blue-600 bg-white text-gray-900 hover:bg-blue-50"
                    }`}
                  >
                    {isSelected ? "Selected" : "Choose Plan"}
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <form
        onSubmit={handleSubmit}
        noValidate
        aria-busy={isSubmitting}
        className="mt-10 space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
      >
        {selectedPlan && (
          <div className="rounded-xl bg-[#EBF3FE] p-5">
            <p className="text-sm font-medium text-gray-600">Selected Plan</p>

            <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xl font-bold text-gray-900">
                {selectedPlan.planName}
              </p>

              <p className="text-xl font-bold text-blue-700">
                {formatPrice(selectedPlan)}
              </p>
            </div>
          </div>
        )}

        {!selectedPlan && (
          <div className="rounded-xl border border-blue-200 bg-[#EBF3FE] px-5 py-4">
            <p className="text-sm font-medium text-gray-700">
              Please choose a price plan above before submitting your project.
            </p>
          </div>
        )}

        {submitError && (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {submitError}
          </p>
        )}

        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-900"
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
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-600"
          />

          {errors.name && (
            <p id="name-error" className="mt-2 text-sm text-red-600">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-900"
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
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-600"
          />

          {errors.email && (
            <p id="email-error" className="mt-2 text-sm text-red-600">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="projectDescription"
            className="block text-sm font-medium text-gray-900"
          >
            What do you want to build?
          </label>

          <textarea
            id="projectDescription"
            name="projectDescription"
            rows={5}
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
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-600"
          />

          {errors.projectDescription && (
            <p
              id="project-description-error"
              className="mt-2 text-sm text-red-600"
            >
              {errors.projectDescription}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="expectedOutcome"
            className="block text-sm font-medium text-gray-900"
          >
            What outcome are you looking for?
          </label>

          <textarea
            id="expectedOutcome"
            name="expectedOutcome"
            rows={4}
            value={formData.expectedOutcome}
            onChange={(event) =>
              updateField("expectedOutcome", event.target.value)
            }
            maxLength={maxLengths.expectedOutcome}
            aria-invalid={Boolean(errors.expectedOutcome)}
            aria-describedby={
              errors.expectedOutcome ? "expected-outcome-error" : undefined
            }
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-600"
          />

          {errors.expectedOutcome && (
            <p
              id="expected-outcome-error"
              className="mt-2 text-sm text-red-600"
            >
              {errors.expectedOutcome}
            </p>
          )}
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="timeline"
              className="block text-sm font-medium text-gray-900"
            >
              Timeline
            </label>

            <input
              id="timeline"
              name="timeline"
              type="text"
              value={formData.timeline}
              onChange={(event) => updateField("timeline", event.target.value)}
              maxLength={maxLengths.timeline}
              aria-invalid={Boolean(errors.timeline)}
              aria-describedby={errors.timeline ? "timeline-error" : undefined}
              placeholder="e.g. 6 weeks"
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-600"
            />

            {errors.timeline && (
              <p id="timeline-error" className="mt-2 text-sm text-red-600">
                {errors.timeline}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="budget"
              className="block text-sm font-medium text-gray-900"
            >
              Budget
            </label>

            <input
              id="budget"
              name="budget"
              type="text"
              value={formData.budget}
              onChange={(event) => updateField("budget", event.target.value)}
              maxLength={maxLengths.budget}
              aria-invalid={Boolean(errors.budget)}
              aria-describedby={errors.budget ? "budget-error" : undefined}
              placeholder="e.g. $1,000–$2,000"
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-600"
            />

            {errors.budget && (
              <p id="budget-error" className="mt-2 text-sm text-red-600">
                {errors.budget}
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !selectedPlan}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span>{isSubmitting ? "Creating Booking..." : "Book This Plan"}</span>

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
      </form>
    </main>
  );
}
