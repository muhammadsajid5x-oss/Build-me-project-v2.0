import { SyntheticEvent, useEffect, useRef, useState } from "react";

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

const GENERIC_SUBMIT_ERROR =
  "We could not submit your mentoring request right now. Please try again in a moment.";

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
  } else if (
    formData.email.trim().length > 254 ||
    !/^[^\s@]+@[^\s@.]+\.[^\s@]+$/.test(formData.email.trim())
  ) {
    errors.email = "Please enter a valid email address.";
  }

  if (!formData.mentoringArea.trim()) {
    errors.mentoringArea = "Mentoring area is required.";
  } else if (formData.mentoringArea.trim().length > 100) {
    errors.mentoringArea = "Mentoring area must not exceed 100 characters.";
  }

  if (!formData.helpWith.trim()) {
    errors.helpWith = "Please tell us what you would like help with.";
  } else if (formData.helpWith.trim().length > 2000) {
    errors.helpWith = "This field must not exceed 2000 characters.";
  }

  if (!formData.experienceContext.trim()) {
    errors.experienceContext = "Current experience or context is required.";
  } else if (formData.experienceContext.trim().length > 2000) {
    errors.experienceContext = "This field must not exceed 2000 characters.";
  }

  if (formData.preferredFormat.trim().length > 100) {
    errors.preferredFormat =
      "Preferred mentoring format must not exceed 100 characters.";
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
  const details = record.details;

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
            "We could not load the mentoring plans right now. Please refresh and try again.",
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
      setSubmitError("Please select a mentoring plan before continuing.");
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
            preferredFormat: formData.preferredFormat.trim(),
            availability: formData.availability.trim(),
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
          "Your mentoring request was received, but we could not create the booking. Please try again.",
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
          "Your booking was created, but we could not create the invoice. Please try again.",
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
      <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <section
          aria-labelledby="mentor-success-title"
          className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm sm:p-8"
        >
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Mentor Me
          </p>

          <h1
            id="mentor-success-title"
            className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
          >
            Your mentoring booking is confirmed.
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-700">
            Your booking has been created successfully. An invoice has been
            generated and your payment is currently pending.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-[#EBF3FE] p-5">
              <p className="text-sm font-medium text-slate-600">Plan</p>
              <p className="mt-1 text-lg font-bold text-slate-900">
                {createdBooking.planName}
              </p>
            </div>

            <div className="rounded-xl bg-[#EBF3FE] p-5">
              <p className="text-sm font-medium text-slate-600">Price</p>
              <p className="mt-1 text-lg font-bold text-slate-900">
                {createdBooking.currency} $
                {createdBooking.price.toLocaleString("en-US")}
                {createdBooking.billingPeriod === "monthly" ? " / mo" : ""}
              </p>
            </div>

            <div className="rounded-xl bg-[#EBF3FE] p-5">
              <p className="text-sm font-medium text-slate-600">Invoice</p>
              <p className="mt-1 text-lg font-bold text-slate-900">
                {createdInvoice.invoiceNumber}
              </p>
            </div>

            <div className="rounded-xl bg-[#EBF3FE] p-5">
              <p className="text-sm font-medium text-slate-600">
                Payment Status
              </p>
              <p className="mt-1 text-lg font-bold text-blue-700">
                Payment Pending
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50 p-5">
            <p className="text-sm leading-6 text-slate-700">
              Your invoice has been created for{" "}
              <strong>
                {createdInvoice.currency} $
                {createdInvoice.amount.toLocaleString("en-US")}
              </strong>
              . Payment processing will be connected separately.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <section aria-labelledby="mentor-page-title">
        <div className="mb-10">
          <p className="text-sm font-bold uppercase tracking-[0.15em] text-blue-700">
            Mentor Me
          </p>

          <h1
            id="mentor-page-title"
            className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
          >
            Choose your mentoring plan
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-700 sm:text-lg">
            Choose the level of mentoring support that fits your goals, then
            tell me what you want to work on.
          </p>
        </div>

        <section aria-labelledby="mentor-plans-title">
          <div className="mb-5">
            <h2
              id="mentor-plans-title"
              className="text-2xl font-bold text-blue-700"
            >
              Price Plans
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              All Mentor Me plans are billed monthly.
            </p>
          </div>

          {isLoadingPlans && (
            <div
              className="rounded-xl border border-blue-100 bg-[#EBF3FE] p-5 text-sm text-slate-700"
              role="status"
            >
              Loading mentoring plans...
            </div>
          )}

          {plansError && !isLoadingPlans && (
            <div
              className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"
              role="alert"
            >
              {plansError}
            </div>
          )}

          {!isLoadingPlans && !plansError && plans.length === 0 && (
            <div className="rounded-xl border border-blue-100 bg-[#EBF3FE] p-5 text-sm text-slate-700">
              No mentoring plans are currently available.
            </div>
          )}

          {!isLoadingPlans && plans.length > 0 && (
            <div className="grid gap-5 md:grid-cols-3">
              {plans.map((plan) => {
                const isSelected = selectedPlanId === plan.id;

                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => handlePlanSelect(plan.id)}
                    aria-pressed={isSelected}
                    className={[
                      "text-left rounded-2xl border-2 p-6 transition",
                      isSelected
                        ? "border-blue-600 bg-blue-50 shadow-md"
                        : "border-blue-100 bg-[#EBF3FE] hover:border-blue-400",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-xl font-bold text-slate-900">
                        {plan.planName}
                      </h3>

                      {isSelected && (
                        <span className="rounded-full bg-blue-600 px-2.5 py-1 text-xs font-bold text-white">
                          Selected
                        </span>
                      )}
                    </div>

                    <p className="mt-5 text-3xl font-bold text-blue-700">
                      {formatPrice(plan)}
                      <span className="ml-1 text-sm font-semibold text-slate-600">
                        / mo
                      </span>
                    </p>

                    <p className="mt-4 text-sm leading-6 text-slate-700">
                      {plan.description}
                    </p>

                    <span
                      className={[
                        "mt-6 inline-flex w-full items-center justify-center rounded-lg px-4 py-3 text-sm font-semibold",
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "border-2 border-blue-700 bg-white text-blue-700",
                      ].join(" ")}
                    >
                      {isSelected ? "Plan Selected" : "Choose This Plan"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-10 space-y-6 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm sm:p-8"
        >
          <div>
            <h2 className="text-2xl font-bold text-blue-700">
              Booking Details
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              {selectedPlan
                ? `Selected plan: ${selectedPlan.planName} — ${formatPrice(
                    selectedPlan,
                  )} / mo`
                : "Select a plan above before submitting your booking."}
            </p>
          </div>

          <div>
            <label
              htmlFor="mentor-name"
              className="mb-2 block text-sm font-semibold text-slate-900"
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
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

            {errors.name && (
              <p id="mentor-name-error" className="mt-2 text-sm text-red-600">
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="mentor-email"
              className="mb-2 block text-sm font-semibold text-slate-900"
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
              aria-describedby={errors.email ? "mentor-email-error" : undefined}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

            {errors.email && (
              <p id="mentor-email-error" className="mt-2 text-sm text-red-600">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="mentor-area"
              className="mb-2 block text-sm font-semibold text-slate-900"
            >
              Mentoring Area
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
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

            {errors.mentoringArea && (
              <p id="mentor-area-error" className="mt-2 text-sm text-red-600">
                {errors.mentoringArea}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="mentor-help"
              className="mb-2 block text-sm font-semibold text-slate-900"
            >
              What would you like help with?
            </label>

            <textarea
              id="mentor-help"
              name="helpWith"
              value={formData.helpWith}
              maxLength={2000}
              rows={5}
              onChange={(event) => updateField("helpWith", event.target.value)}
              aria-invalid={Boolean(errors.helpWith)}
              aria-describedby={
                errors.helpWith ? "mentor-help-error" : undefined
              }
              className="w-full resize-y rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

            {errors.helpWith && (
              <p id="mentor-help-error" className="mt-2 text-sm text-red-600">
                {errors.helpWith}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="mentor-experience"
              className="mb-2 block text-sm font-semibold text-slate-900"
            >
              Current Experience / Context
            </label>

            <textarea
              id="mentor-experience"
              name="experienceContext"
              value={formData.experienceContext}
              maxLength={2000}
              rows={5}
              onChange={(event) =>
                updateField("experienceContext", event.target.value)
              }
              aria-invalid={Boolean(errors.experienceContext)}
              aria-describedby={
                errors.experienceContext ? "mentor-experience-error" : undefined
              }
              className="w-full resize-y rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

            {errors.experienceContext && (
              <p
                id="mentor-experience-error"
                className="mt-2 text-sm text-red-600"
              >
                {errors.experienceContext}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="mentor-format"
              className="mb-2 block text-sm font-semibold text-slate-900"
            >
              Preferred Mentoring Format{" "}
              <span className="font-normal text-slate-500">(optional)</span>
            </label>

            <input
              id="mentor-format"
              name="preferredFormat"
              type="text"
              value={formData.preferredFormat}
              maxLength={100}
              placeholder="e.g. Online call, async guidance"
              onChange={(event) =>
                updateField("preferredFormat", event.target.value)
              }
              aria-invalid={Boolean(errors.preferredFormat)}
              aria-describedby={
                errors.preferredFormat ? "mentor-format-error" : undefined
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

            {errors.preferredFormat && (
              <p id="mentor-format-error" className="mt-2 text-sm text-red-600">
                {errors.preferredFormat}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="mentor-availability"
              className="mb-2 block text-sm font-semibold text-slate-900"
            >
              Availability / Preferred Time{" "}
              <span className="font-normal text-slate-500">(optional)</span>
            </label>

            <input
              id="mentor-availability"
              name="availability"
              type="text"
              value={formData.availability}
              maxLength={100}
              placeholder="e.g. Weekday evenings"
              onChange={(event) =>
                updateField("availability", event.target.value)
              }
              aria-invalid={Boolean(errors.availability)}
              aria-describedby={
                errors.availability ? "mentor-availability-error" : undefined
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

            {errors.availability && (
              <p
                id="mentor-availability-error"
                className="mt-2 text-sm text-red-600"
              >
                {errors.availability}
              </p>
            )}
          </div>

          {submitError && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || isLoadingPlans || !selectedPlanId}
            className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-base font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? "Creating Booking..."
              : selectedPlan
                ? `Book ${selectedPlan.planName} — ${formatPrice(
                    selectedPlan,
                  )} / mo`
                : "Select a Plan to Continue"}
          </button>
        </form>
      </section>
    </main>
  );
}
