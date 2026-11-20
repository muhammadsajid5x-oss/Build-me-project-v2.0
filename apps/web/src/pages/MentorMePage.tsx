import { useEffect, useRef, useState, type SyntheticEvent } from "react";
import { Link } from "react-router-dom";

import { ANALYTICS_EVENTS, trackAnalyticsEvent } from "../analytics";
import { getApiBaseUrl } from "../api-url";

const apiBaseUrl = getApiBaseUrl(import.meta.env.VITE_API_URL);

const MENTOR_ME_PATH = "/mentor-me";

type FormData = {
  name: string;
  email: string;
  mentoringArea: string;
  helpWith: string;
  experienceContext: string;
  preferredFormat: string;
  availability: string;
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
  planName: string;
  price: number;
  currency: string;
  billingPeriod: string;
  status: "pending_payment" | "paid" | "cancelled";
};

type Invoice = {
  id: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: "pending" | "paid" | "void";
};

const initialFormData: FormData = {
  name: "",
  email: "",
  mentoringArea: "",
  helpWith: "",
  experienceContext: "",
  preferredFormat: "",
  availability: "",
};

const FORMAT_OPTIONS = [
  { value: "Video call", label: "Video call" },
  { value: "Phone call", label: "Phone call" },
  { value: "Async guidance", label: "Async guidance" },
  { value: "Not sure yet", label: "Not sure yet" },
];

const AVAILABILITY_OPTIONS = [
  { value: "Weekday mornings", label: "Weekday mornings" },
  { value: "Weekday afternoons", label: "Weekday afternoons" },
  { value: "Weekday evenings", label: "Weekday evenings" },
  { value: "Weekend", label: "Weekend" },
  { value: "Flexible", label: "Flexible" },
];

const GENERIC_SUBMIT_ERROR =
  "We could not submit your mentoring request right now. Please try again.";

function formatPrice(plan: ServicePlan): string {
  const amount = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(plan.price);

  return `${plan.currency} $${amount}`;
}

function validateForm(formData: FormData): FormErrors {
  const errors: FormErrors = {};

  if (!formData.name.trim()) {
    errors.name = "Name is required.";
  } else if (formData.name.trim().length > 100) {
    errors.name = "Name must not exceed 100 characters.";
  }

  if (!formData.email.trim()) {
    errors.email = "Email is required.";
  } else if (formData.email.trim().length > 254) {
    errors.email = "Email must not exceed 254 characters.";
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

  if (!formData.mentoringArea.trim()) {
    errors.mentoringArea = "Mentoring area is required.";
  } else if (formData.mentoringArea.trim().length > 100) {
    errors.mentoringArea = "Mentoring area must not exceed 100 characters.";
  }

  if (!formData.helpWith.trim()) {
    errors.helpWith = "Please add what you need help with.";
  } else if (formData.helpWith.trim().length > 2000) {
    errors.helpWith = "This field must not exceed 2000 characters.";
  }

  if (!formData.experienceContext.trim()) {
    errors.experienceContext = "Experience or context is required.";
  } else if (formData.experienceContext.trim().length > 2000) {
    errors.experienceContext = "This field must not exceed 2000 characters.";
  }

  if (formData.preferredFormat.trim().length > 100) {
    errors.preferredFormat = "Format must not exceed 100 characters.";
  }

  if (formData.availability.trim().length > 100) {
    errors.availability = "Availability must not exceed 100 characters.";
  }

  return errors;
}

function readFieldErrors(body: unknown): FormErrors {
  if (!body || typeof body !== "object") {
    return {};
  }

  const record = body as Record<string, unknown>;

  const error =
    record.error && typeof record.error === "object"
      ? (record.error as Record<string, unknown>)
      : null;

  const details =
    error?.details ??
    (Array.isArray(record.details) ? record.details : undefined);

  if (!Array.isArray(details)) {
    return {};
  }

  const allowedFields = new Set<keyof FormData>([
    "name",
    "email",
    "mentoringArea",
    "helpWith",
    "experienceContext",
    "preferredFormat",
    "availability",
  ]);

  const errors: FormErrors = {};

  for (const detail of details) {
    if (!detail || typeof detail !== "object") {
      continue;
    }

    const item = detail as Record<string, unknown>;
    const field = item.field;
    const message = item.message;

    if (
      typeof field === "string" &&
      allowedFields.has(field as keyof FormData) &&
      typeof message === "string"
    ) {
      errors[field as keyof FormData] = message;
    }
  }

  return errors;
}

function readResponseData(body: unknown): Record<string, unknown> | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const record = body as Record<string, unknown>;

  if (!record.data || typeof record.data !== "object") {
    return null;
  }

  return record.data as Record<string, unknown>;
}

export default function MentorMePage() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [plans, setPlans] = useState<ServicePlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [createdInvoice, setCreatedInvoice] = useState<Invoice | null>(null);

  const hasTrackedView = useRef(false);

  useEffect(() => {
    if (hasTrackedView.current) {
      return;
    }

    hasTrackedView.current = true;

    trackAnalyticsEvent({
      name: ANALYTICS_EVENTS.MENTOR_ME_VIEWED,
      eventType: "view",
      path: MENTOR_ME_PATH,
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadPlans() {
      setIsLoadingPlans(true);
      setPlansError(null);

      try {
        const response = await fetch(`${apiBaseUrl}/api/v1/service-plans`);

        if (!response.ok) {
          throw new Error("Failed to load pricing plans.");
        }

        const body: unknown = await response.json();

        const data =
          body && typeof body === "object"
            ? (body as Record<string, unknown>).data
            : null;

        if (!Array.isArray(data)) {
          throw new Error("Invalid pricing plan response.");
        }

        const mentorPlans = data.filter((plan): plan is ServicePlan =>
          Boolean(
            plan &&
            typeof plan === "object" &&
            (plan as ServicePlan).service === "mentor-me" &&
            (plan as ServicePlan).active === true,
          ),
        );

        if (!cancelled) {
          setPlans(mentorPlans);
        }
      } catch {
        if (!cancelled) {
          setPlansError(
            "Mentoring plans are unavailable right now. Please refresh and try again.",
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

    setErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];

      return next;
    });

    if (submitError) {
      setSubmitError(null);
    }
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlanId(planId);
    setSubmitError(null);
  };

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSubmitError(null);
      return;
    }

    if (!selectedPlanId) {
      setSubmitError("Select a mentoring plan before continuing.");
      return;
    }

    setErrors({});
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      /*
       * Step 1:
       * Create the mentoring request / lead.
       */
      const leadResponse = await fetch(
        `${apiBaseUrl}/api/v1/mentor-me-requests`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.trim(),
            mentoringArea: formData.mentoringArea.trim(),
            helpWith: formData.helpWith.trim(),
            experienceContext: formData.experienceContext.trim(),
            ...(formData.preferredFormat.trim()
              ? {
                  preferredFormat: formData.preferredFormat.trim(),
                }
              : {}),
            ...(formData.availability.trim()
              ? {
                  availability: formData.availability.trim(),
                }
              : {}),
          }),
        },
      );

      const leadBody: unknown = await leadResponse.json().catch(() => null);

      if (leadResponse.status === 400) {
        const fieldErrors = readFieldErrors(leadBody);

        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
        } else {
          setSubmitError(GENERIC_SUBMIT_ERROR);
        }

        return;
      }

      if (!leadResponse.ok) {
        setSubmitError(GENERIC_SUBMIT_ERROR);
        return;
      }

      const leadData = readResponseData(leadBody);
      const leadId = leadData?.id;

      if (typeof leadId !== "string") {
        setSubmitError(GENERIC_SUBMIT_ERROR);
        return;
      }

      /*
       * Step 2:
       * Create the booking.
       *
       * Only leadId + planId are sent.
       * The backend owns the actual price.
       */
      const bookingResponse = await fetch(`${apiBaseUrl}/api/v1/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leadId,
          planId: selectedPlanId,
        }),
      });

      const bookingBody: unknown = await bookingResponse
        .json()
        .catch(() => null);

      if (!bookingResponse.ok) {
        setSubmitError(
          "Your mentoring request was received, but the booking could not be created.",
        );
        return;
      }

      const bookingData = readResponseData(bookingBody);

      if (!bookingData) {
        setSubmitError(GENERIC_SUBMIT_ERROR);
        return;
      }

      const booking: Booking = {
        id: String(bookingData.id),
        planName: String(bookingData.planName),
        price: Number(bookingData.price),
        currency: String(bookingData.currency),
        billingPeriod: String(bookingData.billingPeriod),
        status: bookingData.status as Booking["status"],
      };

      /*
       * Step 3:
       * Create the invoice from the booking.
       */
      const invoiceResponse = await fetch(`${apiBaseUrl}/api/v1/invoices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: booking.id,
        }),
      });

      const invoiceBody: unknown = await invoiceResponse
        .json()
        .catch(() => null);

      if (!invoiceResponse.ok) {
        setSubmitError(
          "Your booking was created, but the invoice could not be created.",
        );
        return;
      }

      const invoiceData = readResponseData(invoiceBody);

      if (!invoiceData) {
        setSubmitError(GENERIC_SUBMIT_ERROR);
        return;
      }

      const invoice: Invoice = {
        id: String(invoiceData.id),
        invoiceNumber: String(invoiceData.invoiceNumber),
        amount: Number(invoiceData.amount),
        currency: String(invoiceData.currency),
        status: invoiceData.status as Invoice["status"],
      };

      setCreatedBooking(booking);
      setCreatedInvoice(invoice);
      setSubmitted(true);

      trackAnalyticsEvent({
        name: ANALYTICS_EVENTS.MENTOR_ME_SUBMITTED,
        eventType: "click",
        path: MENTOR_ME_PATH,
      });

      trackAnalyticsEvent({
        name: ANALYTICS_EVENTS.MENTOR_ME_COMPLETED,
        eventType: "click",
        path: MENTOR_ME_PATH,
      });
    } catch {
      setSubmitError(GENERIC_SUBMIT_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted && createdBooking && createdInvoice) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex flex-wrap items-center gap-2 text-sm font-semibold"
        >
          <Link
            to="/"
            className="text-blue-700 underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-700"
          >
            Home
          </Link>

          <span aria-hidden="true" className="text-black">
            /
          </span>

          <Link
            to="/#work-with-me"
            className="text-blue-700 underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-700"
          >
            Work With Me
          </Link>

          <span aria-hidden="true" className="text-black">
            /
          </span>

          <span className="text-black">Mentor Me</span>
        </nav>

        <section
          aria-labelledby="mentor-success-title"
          className="rounded-2xl border-2 border-blue-700 bg-white p-6 sm:p-8"
        >
          <div className="rounded-xl bg-blue-100 p-6 sm:p-7">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-blue-700">
              Mentor Me
            </p>

            <h1
              id="mentor-success-title"
              className="mt-4 text-3xl font-bold tracking-tight text-black sm:text-4xl"
            >
              Booking received.
            </h1>

            <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-black">
              Your booking and invoice are ready.
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border-2 border-blue-100 bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                Plan
              </p>

              <p className="mt-1 text-lg font-bold text-black">
                {createdBooking.planName}
              </p>
            </div>

            <div className="rounded-xl border-2 border-blue-100 bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                Price
              </p>

              <p className="mt-1 text-lg font-bold text-black">
                {createdBooking.currency} $
                {createdBooking.price.toLocaleString("en-US")}
                {createdBooking.billingPeriod === "monthly" ? " / mo" : ""}
              </p>
            </div>

            <div className="rounded-xl border-2 border-blue-100 bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                Invoice
              </p>

              <p className="mt-1 text-lg font-bold text-black">
                {createdInvoice.invoiceNumber}
              </p>
            </div>

            <div className="rounded-xl border-2 border-blue-100 bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                Status
              </p>

              <p className="mt-1 text-lg font-bold text-black">
                Payment Pending
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-blue-100 p-4">
            <p className="text-sm font-semibold leading-6 text-black">
              Invoice total:{" "}
              <strong>
                {createdInvoice.currency} $
                {createdInvoice.amount.toLocaleString("en-US")}
              </strong>
            </p>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/#work-with-me"
              className="inline-flex items-center justify-center rounded-xl border-2 border-blue-700 bg-white px-5 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-700"
            >
              Back to Work With Me
            </Link>

            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-black focus:outline-none focus:ring-2 focus:ring-blue-700"
            >
              Home
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
      <section aria-labelledby="mentor-page-title">
        <nav
          aria-label="Breadcrumb"
          className="mb-5 flex flex-wrap items-center gap-2 text-sm font-semibold"
        >
          <Link
            to="/"
            className="text-blue-700 underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-700"
          >
            Home
          </Link>

          <span aria-hidden="true" className="text-black">
            /
          </span>

          <Link
            to="/#work-with-me"
            className="text-blue-700 underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-700"
          >
            Work With Me
          </Link>

          <span aria-hidden="true" className="text-black">
            /
          </span>

          <span className="text-black">Mentor Me</span>
        </nav>

        <div className="rounded-2xl bg-blue-100 p-6 sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.15em] text-blue-700">
            Work With Me
          </p>

          <h1
            id="mentor-page-title"
            className="mt-4 text-3xl font-bold tracking-tight text-black sm:text-4xl"
          >
            Mentor Me
          </h1>

          <p className="mt-2 max-w-xl text-sm font-medium text-black sm:text-base">
            Choose a plan. Share the essentials. Start.
          </p>
        </div>

        <section aria-labelledby="mentor-plans-title" className="mt-7">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-blue-700">
                01
              </p>

              <h2
                id="mentor-plans-title"
                className="mt-1 text-2xl font-bold text-black"
              >
                Choose a plan
              </h2>
            </div>

            {selectedPlan && (
              <span className="hidden rounded-full bg-blue-700 px-3 py-1.5 text-xs font-bold text-white sm:inline-flex">
                {selectedPlan.planName}
              </span>
            )}
          </div>

          {isLoadingPlans && (
            <div
              className="rounded-xl border-2 border-blue-100 bg-blue-100 p-5 text-sm font-semibold text-black"
              role="status"
            >
              Loading plans...
            </div>
          )}

          {plansError && !isLoadingPlans && (
            <div
              className="rounded-xl border-2 border-blue-700 bg-blue-100 p-5 text-sm font-semibold text-black"
              role="alert"
            >
              {plansError}
            </div>
          )}

          {!isLoadingPlans && !plansError && plans.length === 0 && (
            <div className="rounded-xl border-2 border-blue-100 bg-blue-100 p-5 text-sm font-semibold text-black">
              No plans are currently available.
            </div>
          )}

          {!isLoadingPlans && plans.length > 0 && (
            <div className="grid gap-4 md:grid-cols-3">
              {plans.map((plan) => {
                const isSelected = selectedPlanId === plan.id;

                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => handlePlanSelect(plan.id)}
                    aria-pressed={isSelected}
                    className={[
                      "group rounded-2xl border-2 p-5 text-left transition",
                      "focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2",
                      isSelected
                        ? "border-blue-700 bg-blue-700 text-white"
                        : "border-blue-100 bg-white text-black hover:border-blue-700 hover:bg-blue-100",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span
                        className={[
                          "text-xs font-bold uppercase tracking-[0.12em]",
                          isSelected ? "text-white" : "text-blue-700",
                        ].join(" ")}
                      >
                        Plan
                      </span>

                      {isSelected && (
                        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-blue-700">
                          Selected
                        </span>
                      )}
                    </div>

                    <h3
                      className={[
                        "mt-3 text-xl font-bold",
                        isSelected ? "text-white" : "text-black",
                      ].join(" ")}
                    >
                      {plan.planName}
                    </h3>

                    <p
                      className={[
                        "mt-3 min-h-10 text-sm leading-5",
                        isSelected ? "text-white" : "text-black",
                      ].join(" ")}
                    >
                      {plan.description}
                    </p>

                    <div className="mt-5 flex items-end justify-between gap-3">
                      <span
                        className={[
                          "text-2xl font-bold",
                          isSelected ? "text-white" : "text-blue-700",
                        ].join(" ")}
                      >
                        {formatPrice(plan)}
                        {plan.billingPeriod === "monthly" && (
                          <span className="ml-1 text-sm font-bold">/ mo</span>
                        )}
                      </span>

                      <span
                        className={[
                          "rounded-lg px-3 py-2 text-xs font-bold",
                          isSelected
                            ? "bg-white text-blue-700"
                            : "bg-blue-100 text-blue-700",
                        ].join(" ")}
                      >
                        {isSelected ? "Selected" : "Choose"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-7 rounded-2xl border-2 border-blue-100 bg-white p-5 sm:p-6"
        >
          <div className="mb-6 flex flex-col gap-3 border-b-2 border-blue-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-blue-700">
                02
              </p>

              <h2 className="mt-1 text-2xl font-bold text-black">
                Booking details
              </h2>
            </div>

            {selectedPlan && (
              <div className="rounded-xl bg-blue-100 px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                  Selected
                </p>

                <p className="mt-0.5 text-sm font-bold text-black">
                  {selectedPlan.planName} · {formatPrice(selectedPlan)}
                </p>
              </div>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="mentor-name"
                className="block text-sm font-bold text-black"
              >
                Name
              </label>

              <input
                id="mentor-name"
                name="name"
                type="text"
                value={formData.name}
                maxLength={100}
                autoComplete="name"
                onChange={(event) => updateField("name", event.target.value)}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "mentor-name-error" : undefined}
                className="mt-2 w-full rounded-xl border-2 border-blue-100 bg-white px-4 py-3 text-black outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              />

              {errors.name && (
                <p
                  id="mentor-name-error"
                  className="mt-1.5 text-xs font-semibold text-blue-700"
                >
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="mentor-email"
                className="block text-sm font-bold text-black"
              >
                Email
              </label>

              <input
                id="mentor-email"
                name="email"
                type="email"
                value={formData.email}
                maxLength={254}
                autoComplete="email"
                onChange={(event) => updateField("email", event.target.value)}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={
                  errors.email ? "mentor-email-error" : undefined
                }
                className="mt-2 w-full rounded-xl border-2 border-blue-100 bg-white px-4 py-3 text-black outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              />

              {errors.email && (
                <p
                  id="mentor-email-error"
                  className="mt-1.5 text-xs font-semibold text-blue-700"
                >
                  {errors.email}
                </p>
              )}
            </div>
          </div>

          <div className="mt-5">
            <label
              htmlFor="mentor-area"
              className="block text-sm font-bold text-black"
            >
              Mentoring area
            </label>

            <input
              id="mentor-area"
              name="mentoringArea"
              type="text"
              value={formData.mentoringArea}
              maxLength={100}
              placeholder="e.g. Full-stack development, career growth"
              onChange={(event) =>
                updateField("mentoringArea", event.target.value)
              }
              aria-invalid={Boolean(errors.mentoringArea)}
              aria-describedby={
                errors.mentoringArea ? "mentor-area-error" : undefined
              }
              className="mt-2 w-full rounded-xl border-2 border-blue-100 bg-white px-4 py-3 text-black outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
            />

            {errors.mentoringArea && (
              <p
                id="mentor-area-error"
                className="mt-1.5 text-xs font-semibold text-blue-700"
              >
                {errors.mentoringArea}
              </p>
            )}
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="mentor-help"
                className="block text-sm font-bold text-black"
              >
                What do you need help with?
              </label>

              <textarea
                id="mentor-help"
                name="helpWith"
                value={formData.helpWith}
                maxLength={2000}
                rows={4}
                placeholder="Your goal, challenge, or question"
                onChange={(event) =>
                  updateField("helpWith", event.target.value)
                }
                aria-invalid={Boolean(errors.helpWith)}
                aria-describedby={
                  errors.helpWith ? "mentor-help-error" : undefined
                }
                className="mt-2 w-full resize-y rounded-xl border-2 border-blue-100 bg-white px-4 py-3 text-black outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              />

              {errors.helpWith && (
                <p
                  id="mentor-help-error"
                  className="mt-1.5 text-xs font-semibold text-blue-700"
                >
                  {errors.helpWith}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="mentor-experience"
                className="block text-sm font-bold text-black"
              >
                Current context
              </label>

              <textarea
                id="mentor-experience"
                name="experienceContext"
                value={formData.experienceContext}
                maxLength={2000}
                rows={4}
                placeholder="Your current experience or situation"
                onChange={(event) =>
                  updateField("experienceContext", event.target.value)
                }
                aria-invalid={Boolean(errors.experienceContext)}
                aria-describedby={
                  errors.experienceContext
                    ? "mentor-experience-error"
                    : undefined
                }
                className="mt-2 w-full resize-y rounded-xl border-2 border-blue-100 bg-white px-4 py-3 text-black outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              />

              {errors.experienceContext && (
                <p
                  id="mentor-experience-error"
                  className="mt-1.5 text-xs font-semibold text-blue-700"
                >
                  {errors.experienceContext}
                </p>
              )}
            </div>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="mentor-format"
                className="block text-sm font-bold text-black"
              >
                Format
              </label>

              <select
                id="mentor-format"
                name="preferredFormat"
                value={formData.preferredFormat}
                onChange={(event) =>
                  updateField("preferredFormat", event.target.value)
                }
                aria-invalid={Boolean(errors.preferredFormat)}
                aria-describedby={
                  errors.preferredFormat ? "mentor-format-error" : undefined
                }
                className="mt-2 w-full appearance-none rounded-xl border-2 border-blue-100 bg-white px-4 py-3 text-black outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Select format</option>

                {FORMAT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {errors.preferredFormat && (
                <p
                  id="mentor-format-error"
                  className="mt-1.5 text-xs font-semibold text-blue-700"
                >
                  {errors.preferredFormat}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="mentor-availability"
                className="block text-sm font-bold text-black"
              >
                Availability
              </label>

              <select
                id="mentor-availability"
                name="availability"
                value={formData.availability}
                onChange={(event) =>
                  updateField("availability", event.target.value)
                }
                aria-invalid={Boolean(errors.availability)}
                aria-describedby={
                  errors.availability ? "mentor-availability-error" : undefined
                }
                className="mt-2 w-full appearance-none rounded-xl border-2 border-blue-100 bg-white px-4 py-3 text-black outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Select availability</option>

                {AVAILABILITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {errors.availability && (
                <p
                  id="mentor-availability-error"
                  className="mt-1.5 text-xs font-semibold text-blue-700"
                >
                  {errors.availability}
                </p>
              )}
            </div>
          </div>

          {submitError && (
            <div
              role="alert"
              className="mt-5 rounded-xl border-2 border-blue-700 bg-blue-100 px-4 py-3 text-sm font-semibold text-black"
            >
              {submitError}
            </div>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              to="/#work-with-me"
              className="inline-flex items-center justify-center rounded-xl border-2 border-blue-700 bg-white px-5 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-700"
            >
              Back to Work With Me
            </Link>

            <button
              type="submit"
              disabled={isSubmitting || isLoadingPlans || !selectedPlanId}
              className="inline-flex items-center justify-center rounded-xl bg-blue-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-black focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Creating booking..."
                : selectedPlan
                  ? `Book ${selectedPlan.planName}`
                  : "Select a plan"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
