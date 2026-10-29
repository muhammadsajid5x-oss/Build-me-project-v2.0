import { SyntheticEvent, useEffect, useRef, useState } from "react";

import { ANALYTICS_EVENTS, trackAnalyticsEvent } from "../analytics";
import { getApiBaseUrl } from "../api-url";

const apiBaseUrl = getApiBaseUrl(import.meta.env.VITE_API_URL);

/**
 * The route the Deliver My Project journey is served from. It is reported with
 * the view event so the journey can be identified in analytics.
 */
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

const initialFormData: FormData = {
  name: "",
  email: "",
  projectDescription: "",
  expectedOutcome: "",
  timeline: "",
  budget: "",
};

/**
 * The maximum lengths accepted by the API. They are repeated here so the
 * visitor gets immediate feedback, while the API remains the authoritative
 * validation.
 */
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

/**
 * Maps the API validation details onto the form fields. Unknown fields and
 * any non-validation payload are ignored so no server internals are shown.
 */
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

export default function DeliverMyProjectPage() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const hasTrackedView = useRef(false);

  /**
   * The journey has actually become visible, so the view event is fired here
   * rather than on the click that selected the path. The ref keeps the event
   * to a single occurrence even when effects are re-run.
   */
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

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  };

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};

    if (!formData.name.trim()) {
      nextErrors.name = "Name is required.";
    } else if (formData.name.trim().length > maxLengths.name) {
      nextErrors.name = `Name must be ${maxLengths.name} characters or fewer.`;
    }

    if (!formData.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (formData.email.trim().length > maxLengths.email) {
      nextErrors.email = `Email must be ${maxLengths.email} characters or fewer.`;
    } else {
      // Non-backtracking deterministic validation check
      const emailValue = formData.email.trim();
      const atIndex = emailValue.indexOf("@");
      const dotIndex = emailValue.lastIndexOf(".");
      const isValidEmail =
        atIndex > 0 &&
        dotIndex > atIndex + 1 &&
        dotIndex < emailValue.length - 1;

      if (!isValidEmail) {
        nextErrors.email = "Please enter a valid email address.";
      }
    }

    if (!formData.projectDescription.trim()) {
      nextErrors.projectDescription = "Project description is required.";
    } else if (
      formData.projectDescription.trim().length > maxLengths.projectDescription
    ) {
      nextErrors.projectDescription = `Project description must be ${maxLengths.projectDescription} characters or fewer.`;
    }

    if (!formData.expectedOutcome.trim()) {
      nextErrors.expectedOutcome = "Expected outcome is required.";
    } else if (
      formData.expectedOutcome.trim().length > maxLengths.expectedOutcome
    ) {
      nextErrors.expectedOutcome = `Expected outcome must be ${maxLengths.expectedOutcome} characters or fewer.`;
    }

    if (formData.timeline.trim().length > maxLengths.timeline) {
      nextErrors.timeline = `Timeline must be ${maxLengths.timeline} characters or fewer.`;
    }

    if (formData.budget.trim().length > maxLengths.budget) {
      nextErrors.budget = `Budget must be ${maxLengths.budget} characters or fewer.`;
    }

    return nextErrors;
  };

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validate();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setSubmitError(null);
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setSubmitError(null);

    try {
      const response = await fetch(
        `${apiBaseUrl}/api/v1/delivery-project-requests`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );

      if (response.status === 201) {
        // The request is persisted, so the journey is complete. Analytics must
        // never block the confirmation shown to the visitor.
        trackAnalyticsEvent({
          name: ANALYTICS_EVENTS.DELIVER_MY_PROJECT_COMPLETED,
          eventType: "click",
        });
        setSubmitted(true);
        return;
      }

      const body = await response.json().catch(() => undefined);
      const fieldErrors = readFieldErrors(body);

      if (response.status === 400 && Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
        setSubmitError("Please review the highlighted fields and try again.");
        return;
      }

      setSubmitError(genericSubmitError);
    } catch {
      setSubmitError(genericSubmitError);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="min-h-screen w-full bg-white px-4 py-12 text-gray-900 sm:px-6">
        <section
          aria-labelledby="delivery-project-success-heading"
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <p className="mb-2 text-sm font-medium uppercase tracking-wide text-gray-500">
            Deliver My Project
          </p>

          <h1
            id="delivery-project-success-heading"
            className="text-3xl font-bold tracking-tight text-gray-900"
          >
            Request received
          </h1>

          <p className="mt-4 text-gray-600">
            Thank you. Your project request has been received and will be
            reviewed.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <section aria-labelledby="delivery-project-heading">
        <p className="mb-2 text-sm font-medium uppercase tracking-wide text-gray-500">
          Work With Me
        </p>

        <h1
          id="delivery-project-heading"
          className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
        >
          Deliver My Project
        </h1>

        <p className="mt-4 max-w-2xl text-gray-600">
          Tell me about your project, the outcome you want to achieve, and the
          delivery context. I&apos;ll use this information to understand how I
          can help.
        </p>
      </section>

      <form
        onSubmit={handleSubmit}
        noValidate
        aria-busy={isSubmitting}
        className="mt-8 space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
      >
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
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-gray-500"
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
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-gray-500"
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
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-gray-500"
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
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-gray-500"
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
              aria-describedby={
                errors.timeline ? "timeline-error" : undefined
              }
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-gray-500"
              placeholder="e.g. 6 weeks"
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
              aria-describedby={
                errors.budget ? "budget-error" : undefined
              }
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-gray-500"
              placeholder="e.g. $1,000–$2,000"
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
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span>{isSubmitting ? "Submitting..." : "Submit Project Request"}</span>
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
