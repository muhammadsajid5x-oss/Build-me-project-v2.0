import { SyntheticEvent, useEffect, useRef, useState } from "react";
import { ANALYTICS_EVENTS, trackAnalyticsEvent } from "../analytics";
import { getApiBaseUrl } from "../api-url";

const apiBaseUrl = getApiBaseUrl(import.meta.env.VITE_API_URL);

const COFFEE_WITH_ME_PATH = "/coffee-with-me";

type FormData = {
  name: string;
  email: string;
  topic: string;
  preferredFormat: string;
  availability: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

const initialFormData: FormData = {
  name: "",
  email: "",
  topic: "",
  preferredFormat: "",
  availability: "",
};

const GENERIC_SUBMIT_ERROR =
  "We could not submit your request right now. Please try again in a moment.";

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

  if (!formData.topic.trim()) {
    errors.topic = "Please tell us what you would like to discuss.";
  } else if (formData.topic.trim().length > 2000) {
    errors.topic = "This field must not exceed 2000 characters.";
  }

  if (formData.preferredFormat.trim().length > 100) {
    errors.preferredFormat = "Preferred format must not exceed 100 characters.";
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
  const error = record.error;

  if (!error || typeof error !== "object") {
    return {};
  }

  const details = (error as Record<string, unknown>).details;
  if (!Array.isArray(details)) {
    return {};
  }

  const allowedFields = new Set<keyof FormData>([
    "name",
    "email",
    "topic",
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

export default function CoffeeWithMePage() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const hasTrackedView = useRef(false);

  useEffect(() => {
    if (hasTrackedView.current) {
      return;
    }

    hasTrackedView.current = true;

    trackAnalyticsEvent({
      name: ANALYTICS_EVENTS.COFFEE_WITH_ME_VIEWED,
      eventType: "view",
      path: COFFEE_WITH_ME_PATH,
    });
  }, []);

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));

    setErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${apiBaseUrl}/api/v1/coffee-with-me-requests`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.trim(),
            topic: formData.topic.trim(),
            ...(formData.preferredFormat.trim()
              ? { preferredFormat: formData.preferredFormat.trim() }
              : {}),
            ...(formData.availability.trim()
              ? { availability: formData.availability.trim() }
              : {}),
          }),
        },
      );

      if (response.status === 201) {
        trackAnalyticsEvent({
          name: ANALYTICS_EVENTS.COFFEE_WITH_ME_SUBMITTED,
          eventType: "click",
          path: COFFEE_WITH_ME_PATH,
        });
        trackAnalyticsEvent({
          name: ANALYTICS_EVENTS.COFFEE_WITH_ME_COMPLETED,
          eventType: "click",
          path: COFFEE_WITH_ME_PATH,
        });

        setIsSubmitting(false);
        setSubmitted(true);
        return;
      }

      const body = await response.json().catch(() => null);

      if (response.status === 400 && body) {
        const fieldErrors = readFieldErrors(body);

        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
          setIsSubmitting(false);
          return;
        }
      }

      setSubmitError(GENERIC_SUBMIT_ERROR);
      setIsSubmitting(false);
    } catch {
      setSubmitError(GENERIC_SUBMIT_ERROR);
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-16">
        <section
          aria-labelledby="coffee-success-title"
          className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
        >
          <p className="mb-3 text-sm font-medium text-gray-600">
            Coffee With Me
          </p>

          <h1
            id="coffee-success-title"
            className="text-3xl font-semibold tracking-tight text-gray-900"
          >
            Request received
          </h1>

          <p className="mt-4 text-base leading-7 text-gray-600">
            Thank you. Your coffee chat request has been received and we will be
            in touch soon to schedule a time.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <section aria-labelledby="coffee-page-title">
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-gray-600">
            Coffee With Me
          </p>

          <h1
            id="coffee-page-title"
            className="text-3xl font-semibold tracking-tight text-gray-900"
          >
            Grab a virtual coffee
          </h1>

          <p className="mt-3 text-base leading-7 text-gray-600">
            Let's chat about what's next for you. Tell me a bit about what you
            have in mind and we'll find a time that works.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div>
            <label
              htmlFor="coffee-name"
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              Name
            </label>

            <input
              id="coffee-name"
              name="name"
              type="text"
              value={formData.name}
              maxLength={100}
              autoComplete="name"
              onChange={(event) => updateField("name", event.target.value)}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "coffee-name-error" : undefined}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-gray-500"
            />

            {errors.name && (
              <p id="coffee-name-error" className="mt-2 text-sm text-red-600">
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="coffee-email"
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              Email
            </label>

            <input
              id="coffee-email"
              name="email"
              type="email"
              value={formData.email}
              maxLength={254}
              autoComplete="email"
              onChange={(event) => updateField("email", event.target.value)}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "coffee-email-error" : undefined}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-gray-500"
            />

            {errors.email && (
              <p id="coffee-email-error" className="mt-2 text-sm text-red-600">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="coffee-topic"
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              What would you like to discuss?
            </label>

            <textarea
              id="coffee-topic"
              name="topic"
              value={formData.topic}
              maxLength={2000}
              rows={4}
              placeholder="e.g. Career transition, product feedback, project idea..."
              onChange={(event) => updateField("topic", event.target.value)}
              aria-invalid={Boolean(errors.topic)}
              aria-describedby={errors.topic ? "coffee-topic-error" : undefined}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-gray-500 resize-none"
            />

            {errors.topic && (
              <p id="coffee-topic-error" className="mt-2 text-sm text-red-600">
                {errors.topic}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="coffee-format"
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              Preferred Format{" "}
              <span className="font-normal text-gray-500">(optional)</span>
            </label>

            <input
              id="coffee-format"
              name="preferredFormat"
              type="text"
              value={formData.preferredFormat}
              maxLength={100}
              placeholder="e.g. Video call, phone, async chat"
              onChange={(event) =>
                updateField("preferredFormat", event.target.value)
              }
              aria-invalid={Boolean(errors.preferredFormat)}
              aria-describedby={
                errors.preferredFormat ? "coffee-format-error" : undefined
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-gray-500"
            />

            {errors.preferredFormat && (
              <p id="coffee-format-error" className="mt-2 text-sm text-red-600">
                {errors.preferredFormat}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="coffee-availability"
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              Availability / Preferred Time{" "}
              <span className="font-normal text-gray-500">(optional)</span>
            </label>

            <input
              id="coffee-availability"
              name="availability"
              type="text"
              value={formData.availability}
              maxLength={100}
              placeholder="e.g. Weekday mornings, Thursday afternoons"
              onChange={(event) =>
                updateField("availability", event.target.value)
              }
              aria-invalid={Boolean(errors.availability)}
              aria-describedby={
                errors.availability ? "coffee-availability-error" : undefined
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-gray-500"
            />

            {errors.availability && (
              <p
                id="coffee-availability-error"
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
            disabled={isSubmitting}
            className="w-full rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Submitting..." : "Request Coffee Chat"}
          </button>
        </form>
      </section>
    </main>
  );
}
