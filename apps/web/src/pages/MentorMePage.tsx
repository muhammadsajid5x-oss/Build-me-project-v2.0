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

export default function MentorMePage() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
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

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSubmitError(null);
      return;
    }

    setErrors({});
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/mentor-me-requests`, {
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
      });

      const responseBody: unknown = await response.json().catch(() => null);

      if (response.status === 201) {
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

        setSubmitted(true);
        return;
      }

      if (response.status === 400) {
        const fieldErrors = readFieldErrors(responseBody);

        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
        } else {
          setSubmitError(GENERIC_SUBMIT_ERROR);
        }

        return;
      }

      setSubmitError(GENERIC_SUBMIT_ERROR);
    } catch {
      setSubmitError(GENERIC_SUBMIT_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-16">
        <section
          aria-labelledby="mentor-success-title"
          className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
        >
          <p className="mb-3 text-sm font-medium text-gray-600">Mentor Me</p>

          <h1
            id="mentor-success-title"
            className="text-3xl font-semibold tracking-tight text-gray-900"
          >
            Request received
          </h1>

          <p className="mt-4 text-base leading-7 text-gray-600">
            Thank you. Your mentoring request has been received and will be
            reviewed.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <section aria-labelledby="mentor-page-title">
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-gray-600">Mentor Me</p>

          <h1
            id="mentor-page-title"
            className="text-3xl font-semibold tracking-tight text-gray-900"
          >
            Request mentoring support
          </h1>

          <p className="mt-3 text-base leading-7 text-gray-600">
            Tell me about your goals, challenges, and the area where you would
            like mentoring support.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div>
            <label
              htmlFor="mentor-name"
              className="mb-2 block text-sm font-medium text-gray-900"
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
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-gray-500"
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
              className="mb-2 block text-sm font-medium text-gray-900"
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
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-gray-500"
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
              className="mb-2 block text-sm font-medium text-gray-900"
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
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-gray-500"
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
              className="mb-2 block text-sm font-medium text-gray-900"
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
              className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-gray-500"
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
              className="mb-2 block text-sm font-medium text-gray-900"
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
              className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-gray-500"
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
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              Preferred Mentoring Format{" "}
              <span className="font-normal text-gray-500">(optional)</span>
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
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-gray-500"
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
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              Availability / Preferred Time{" "}
              <span className="font-normal text-gray-500">(optional)</span>
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
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-gray-500"
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
            disabled={isSubmitting}
            className="w-full rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Submitting..." : "Request Mentoring Support"}
          </button>
        </form>
      </section>
    </main>
  );
}
