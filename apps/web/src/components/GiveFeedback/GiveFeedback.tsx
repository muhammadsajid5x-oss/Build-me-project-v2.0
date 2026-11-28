import { useEffect, useMemo, useState } from "react";

import { Modal, ModalBody, ModalFooter, ModalHeader } from "@build-me/ui";

import { trackAnalyticsEvent } from "../../analytics";
import { getApiBaseUrl } from "../../api-url";

const MAX_REVIEW_LENGTH = 100;

type FeedbackType = "rate" | "score" | "complaint" | "suggestion";

type ServiceType = "client-work" | "coffee-chat" | "mentorship";

type FeedbackForm = {
  name: string;
  email: string;
  source: ServiceType | "";
  labels: string[];
  rating: number | null;
  score: number | null;
  content: string;
  outcome: string;
};

type ApiResponse = {
  data?: {
    referenceId?: string;
  };
  error?: {
    message?: string;
  };
};

type ServiceOption = {
  value: ServiceType;
  label: string;
  labels: string[];
  results: string[];
};

const initialForm: FeedbackForm = {
  name: "",
  email: "",
  source: "",
  labels: [],
  rating: null,
  score: null,
  content: "",
  outcome: "",
};

const feedbackOptions: Array<{
  value: FeedbackType;
  title: string;
  description: string;
}> = [
  {
    value: "rate",
    title: "Rate Me",
    description: "Share your overall experience with a simple rating.",
  },
  {
    value: "score",
    title: "Score Me",
    description: "Give me a score based on your overall experience.",
  },
  {
    value: "complaint",
    title: "Complaint",
    description: "Tell me what did not work well or needs improvement.",
  },
  {
    value: "suggestion",
    title: "Suggestion",
    description: "Share an idea that could make the experience better.",
  },
];

const serviceOptions: ServiceOption[] = [
  {
    value: "client-work",
    label: "Deliver My Project",
    labels: [
      "Project Delivery",
      "Technical Execution",
      "Delivery Clarity",
      "Engineering Support",
      "Solution Quality",
      "Communication",
    ],
    results: [
      "30% Faster Delivery Planning",
      "25% Less Rework",
      "20% Faster Project Decisions",
    ],
  },
  {
    value: "coffee-chat",
    label: "Coffee With Me",
    labels: [
      "Technology Conversation",
      "Career Perspective",
      "Decision Clarity",
      "Technical Perspective",
      "Problem Framing",
      "Professional Direction",
    ],
    results: [
      "2–3 Decisions Clarified",
      "3 Clear Next Actions",
      "1 Clearer Decision Path",
    ],
  },
  {
    value: "mentorship",
    label: "Mentor Me",
    labels: [
      "Technical Mentoring",
      "Engineering Growth",
      "Practical Guidance",
      "Problem Solving",
      "Execution Support",
      "Learning Direction",
    ],
    results: [
      "3 Clearer Execution Priorities",
      "2–3 Blockers Clarified",
      "30% Faster Problem Resolution",
    ],
  },
];

function validateEmail(email: string): boolean {
  const atIndex = email.indexOf("@");

  if (atIndex <= 0 || atIndex === email.length - 1) {
    return false;
  }

  const domain = email.slice(atIndex + 1);
  const dotIndex = domain.indexOf(".");

  return dotIndex > 0 && dotIndex < domain.length - 1;
}

function StarPicker({
  value,
  onChange,
  label,
}: {
  readonly value: number | null;
  readonly onChange: (value: number) => void;
  readonly label: string;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-bold text-black">
        {label} <span className="text-blue-700">*</span>
      </p>

      <div className="flex gap-1.5">
        {Array.from({ length: 5 }, (_, index) => {
          const rating = index + 1;
          const active = value !== null && rating <= value;

          return (
            <button
              key={rating}
              type="button"
              onClick={() => onChange(rating)}
              aria-label={`${rating} star${rating === 1 ? "" : "s"}`}
              aria-pressed={active}
              className={[
                "text-3xl leading-none transition focus:outline-none focus:ring-2 focus:ring-blue-700",
                active ? "text-blue-700" : "text-black/25 hover:text-blue-700",
              ].join(" ")}
            >
              ★
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ScorePicker({
  value,
  onChange,
}: {
  readonly value: number | null;
  readonly onChange: (value: number) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-bold text-black">
        Score / NPS <span className="text-blue-700">*</span>
      </p>

      <p className="mb-4 text-sm text-black">
        How likely are you to recommend working with me?
      </p>

      <div className="grid grid-cols-6 gap-2 sm:grid-cols-11">
        {Array.from({ length: 11 }, (_, index) => {
          const score = index;
          const selected = value === score;

          return (
            <button
              key={score}
              type="button"
              onClick={() => onChange(score)}
              aria-label={`Score ${score} out of 10`}
              aria-pressed={selected}
              className={[
                "flex h-10 items-center justify-center rounded-lg border-2 text-sm font-bold transition",
                selected
                  ? "border-blue-700 bg-blue-700 text-white"
                  : "border-blue-700 bg-white text-black hover:bg-blue-100",
              ].join(" ")}
            >
              {score}
            </button>
          );
        })}
      </div>

      <div className="mt-2 flex justify-between text-xs font-medium text-black">
        <span>Not likely</span>
        <span>Very likely</span>
      </div>
    </div>
  );
}

function getSelectedService(
  source: FeedbackForm["source"],
): ServiceOption | undefined {
  return serviceOptions.find((service) => service.value === source);
}

function validateBasicFields(
  form: FeedbackForm,
  feedbackType: FeedbackType | null,
): Record<string, string> {
  const errors: Record<string, string> = {};
  const trimmedContent = form.content.trim();

  if (!feedbackType) {
    errors.feedbackType = "Please select a feedback type.";
  }

  if (!form.name.trim()) {
    errors.name = "Name is required.";
  }

  if (!form.email.trim()) {
    errors.email = "Email is required.";
  } else if (!validateEmail(form.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (!trimmedContent) {
    errors.content = "Please share your feedback.";
  } else if (trimmedContent.length > MAX_REVIEW_LENGTH) {
    errors.content = `Review must be ${MAX_REVIEW_LENGTH} characters or fewer.`;
  }

  return errors;
}

function validateServiceFields(
  form: FeedbackForm,
  requiresServiceDetails: boolean,
): Record<string, string> {
  if (!requiresServiceDetails) {
    return {};
  }

  const errors: Record<string, string> = {};

  if (!form.source) {
    errors.source = "Please select the service.";
  }

  if (form.labels.length === 0) {
    errors.labels = "Please select at least one service label.";
  } else if (form.labels.length > 3) {
    errors.labels = "You can select up to 3 service labels.";
  }

  return errors;
}

function validateRatingFields(
  form: FeedbackForm,
  feedbackType: FeedbackType | null,
): Record<string, string> {
  if (feedbackType === "rate") {
    if (form.rating === null || form.rating < 1 || form.rating > 5) {
      return {
        rating: "Please select your rating.",
      };
    }

    return {};
  }

  if (feedbackType === "score") {
    if (form.score === null || form.score < 0 || form.score > 10) {
      return {
        score: "Please select a score from 0 to 10.",
      };
    }
  }

  return {};
}

function mergeErrors(
  ...errorGroups: Array<Record<string, string>>
): Record<string, string> {
  return errorGroups.reduce<Record<string, string>>(
    (combined, current) => ({
      ...combined,
      ...current,
    }),
    {},
  );
}

export default function GiveFeedback() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [feedbackType, setFeedbackType] = useState<FeedbackType | null>(null);

  const [form, setForm] = useState<FeedbackForm>(initialForm);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [submitting, setSubmitting] = useState(false);

  const [serverError, setServerError] = useState("");

  const [referenceId, setReferenceId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    trackAnalyticsEvent({
      name: "give.feedback.viewed",
      eventType: "view",
      path: window.location.pathname,
    });
  }, [open]);

  const progress = useMemo(() => {
    if (step === 1) {
      return 33;
    }

    if (step === 2) {
      return 66;
    }

    return 100;
  }, [step]);

  const selectedOption = feedbackOptions.find(
    (option) => option.value === feedbackType,
  );

  const selectedService = getSelectedService(form.source);

  const requiresServiceDetails =
    feedbackType === "rate" || feedbackType === "score";

  const reviewLength = form.content.trim().length;
  const isOverReviewLimit = reviewLength > MAX_REVIEW_LENGTH;

  const reset = () => {
    setStep(1);
    setFeedbackType(null);
    setForm(initialForm);
    setErrors({});
    setServerError("");
    setReferenceId(null);
    setSubmitting(false);
  };

  const close = () => {
    if (submitting) {
      return;
    }

    setOpen(false);
    reset();
  };

  const updateForm = <K extends keyof FeedbackForm>(
    field: K,
    value: FeedbackForm[K],
  ) => {
    const activeElement = document.activeElement;

    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });

    setServerError("");

    if (
      activeElement instanceof HTMLInputElement ||
      activeElement instanceof HTMLTextAreaElement
    ) {
      window.requestAnimationFrame(() => {
        if (activeElement.isConnected && !submitting) {
          activeElement.focus();

          const cursorPosition = activeElement.value.length;

          try {
            activeElement.setSelectionRange(cursorPosition, cursorPosition);
          } catch {
            // Ignore inputs that do not support selection ranges.
          }
        }
      });
    }
  };

  const handleServiceChange = (source: ServiceType | "") => {
    setForm((current) => ({
      ...current,
      source,
      labels: [],
      outcome: "",
    }));

    setErrors((current) => {
      const next = { ...current };
      delete next.source;
      delete next.labels;
      delete next.outcome;
      return next;
    });

    setServerError("");
  };

  const toggleLabel = (label: string) => {
    setForm((current) => {
      const alreadySelected = current.labels.includes(label);

      if (alreadySelected) {
        return {
          ...current,
          labels: current.labels.filter((item) => item !== label),
        };
      }

      if (current.labels.length >= 3) {
        return current;
      }

      return {
        ...current,
        labels: [...current.labels, label],
      };
    });

    setErrors((current) => {
      const next = { ...current };
      delete next.labels;
      return next;
    });

    setServerError("");
  };

  const validate = (): boolean => {
    const nextErrors = mergeErrors(
      validateBasicFields(form, feedbackType),
      validateServiceFields(form, requiresServiceDetails),
      validateRatingFields(form, feedbackType),
    );

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (submitting || !validate() || !feedbackType) {
      return;
    }

    setSubmitting(true);
    setServerError("");

    try {
      const apiBaseUrl = getApiBaseUrl(import.meta.env.VITE_API_URL);

      const payload = {
        type: feedbackType,
        name: form.name.trim(),
        email: form.email.trim(),

        source: requiresServiceDetails ? form.source || undefined : undefined,

        tags: requiresServiceDetails ? form.labels : [],

        rating: feedbackType === "rate" ? form.rating : undefined,

        score: feedbackType === "score" ? form.score : undefined,

        content: form.content.trim().slice(0, MAX_REVIEW_LENGTH),

        outcome:
          requiresServiceDetails && form.outcome.trim()
            ? form.outcome.trim()
            : undefined,
      };

      const response = await fetch(`${apiBaseUrl}/api/v1/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      let result: ApiResponse = {};

      try {
        result = (await response.json()) as ApiResponse;
      } catch {
        result = {};
      }

      if (!response.ok) {
        throw new Error(
          result.error?.message ??
            "We could not submit your feedback. Please try again.",
        );
      }

      if (!result.data?.referenceId) {
        throw new Error(
          "Feedback was submitted, but no reference ID was returned.",
        );
      }

      setReferenceId(result.data.referenceId);
      setStep(3);

      trackAnalyticsEvent({
        name: "give.feedback.step.two.completed",
        eventType: "click",
        path: window.location.pathname,
      });

      trackAnalyticsEvent({
        name: "give.feedback.completed",
        eventType: "click",
        path: window.location.pathname,
      });
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : "We could not submit your feedback. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);

          trackAnalyticsEvent({
            name: "give.feedback.clicked",
            eventType: "click",
            path: window.location.pathname,
          });
        }}
        aria-label="Give Feedback"
        className="fixed right-0 top-1/2 z-900 -translate-y-1/2 rounded-l-md bg-blue-700 px-3 py-4 text-sm font-bold text-white shadow-lg transition hover:bg-black focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
      >
        <span className="block [writing-mode:vertical-rl]">Give Feedback</span>
      </button>

      <Modal
        open={open}
        onClose={close}
        size="lg"
        closeOnBackdrop={!submitting}
        closeOnEscape={!submitting}
        aria-label="Give Feedback"
        className="text-black"
      >
        <div className="flex min-h-0 flex-col">
          <div className="h-1 w-full bg-blue-100">
            <div
              className="h-full bg-blue-700 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <ModalHeader className="border-b-0! pb-2">
            <div>
              <p className="text-sm font-bold text-blue-700">
                Step {step} of 3
              </p>

              <h2 className="mt-1 text-2xl font-bold text-black">
                Give Feedback
              </h2>
            </div>
          </ModalHeader>

          <ModalBody className="pt-0!">
            {step === 1 && (
              <div className="rounded-xl bg-blue-100 p-5">
                <h3 className="text-lg font-bold">
                  How would you like to give feedback?
                </h3>

                <p className="mt-1 text-sm">
                  Choose the type of feedback you would like to share.
                </p>

                <div className="mt-5 space-y-3">
                  {feedbackOptions.map((option) => {
                    const selected = feedbackType === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setFeedbackType(option.value);
                          setErrors({});
                          setServerError("");
                          setStep(2);

                          trackAnalyticsEvent({
                            name: "give.feedback.step.one.completed",
                            eventType: "click",
                            path: window.location.pathname,
                          });
                        }}
                        className={[
                          "group w-full rounded-xl border-2 p-4 text-left transition",
                          selected
                            ? "border-blue-700 bg-white"
                            : "border-blue-700 bg-blue-100 hover:bg-white",
                        ].join(" ")}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-bold text-blue-700">
                              {option.title}
                            </p>

                            <p className="mt-1 text-sm text-black">
                              {option.description}
                            </p>
                          </div>

                          <span className="text-xl font-bold text-blue-700">
                            →
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {errors.feedbackType && (
                  <p className="mt-3 text-sm font-bold text-black">
                    {errors.feedbackType}
                  </p>
                )}
              </div>
            )}

            {step === 2 && feedbackType && (
              <div className="space-y-5">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={submitting}
                  className="text-sm font-bold text-blue-700 hover:text-black disabled:opacity-50"
                >
                  ← Back
                </button>

                <div className="rounded-xl bg-blue-100 p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                    {selectedOption?.title}
                  </p>

                  <h3 className="mt-1 text-xl font-bold">
                    Share your experience
                  </h3>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="feedback-name"
                      className="mb-1.5 block text-sm font-bold"
                    >
                      Name <span className="text-blue-700">*</span>
                    </label>

                    <input
                      id="feedback-name"
                      value={form.name}
                      onChange={(event) =>
                        updateForm("name", event.target.value)
                      }
                      disabled={submitting}
                      placeholder="Your name"
                      className="w-full rounded-lg border-2 border-blue-700 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-700"
                    />

                    {errors.name && (
                      <p className="mt-1 text-sm font-bold">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="feedback-email"
                      className="mb-1.5 block text-sm font-bold"
                    >
                      Email <span className="text-blue-700">*</span>
                    </label>

                    <input
                      id="feedback-email"
                      type="email"
                      value={form.email}
                      onChange={(event) =>
                        updateForm("email", event.target.value)
                      }
                      disabled={submitting}
                      placeholder="you@example.com"
                      className="w-full rounded-lg border-2 border-blue-700 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-700"
                    />

                    {errors.email && (
                      <p className="mt-1 text-sm font-bold">{errors.email}</p>
                    )}
                  </div>

                  {requiresServiceDetails && (
                    <>
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="feedback-service"
                          className="mb-1.5 block text-sm font-bold"
                        >
                          Service <span className="text-blue-700">*</span>
                        </label>

                        <select
                          id="feedback-service"
                          value={form.source}
                          onChange={(event) =>
                            handleServiceChange(
                              event.target.value as ServiceType | "",
                            )
                          }
                          disabled={submitting}
                          className="w-full rounded-lg border-2 border-blue-700 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-700"
                        >
                          <option value="">Select a service</option>

                          {serviceOptions.map((service) => (
                            <option key={service.value} value={service.value}>
                              {service.label}
                            </option>
                          ))}
                        </select>

                        {errors.source && (
                          <p className="mt-1 text-sm font-bold">
                            {errors.source}
                          </p>
                        )}
                      </div>

                      <div className="sm:col-span-2">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-bold text-black">
                              Service Labels{" "}
                              <span className="text-blue-700">*</span>
                            </p>

                            <p className="mt-1 text-xs text-black">
                              Select up to 3 labels that best describe your
                              experience.
                            </p>
                          </div>

                          <span className="shrink-0 text-sm font-bold text-blue-700">
                            {form.labels.length}/3
                          </span>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2">
                          {selectedService?.labels.map((label) => {
                            const selected = form.labels.includes(label);
                            const disabled =
                              !selected && form.labels.length >= 3;

                            return (
                              <label
                                key={label}
                                className={[
                                  "flex cursor-pointer items-center gap-3 rounded-lg border-2 px-3 py-3 transition",
                                  selected
                                    ? "border-blue-700 bg-blue-100"
                                    : "border-blue-700 bg-white hover:bg-blue-100",
                                  disabled
                                    ? "cursor-not-allowed opacity-50"
                                    : "",
                                ].join(" ")}
                              >
                                <input
                                  type="checkbox"
                                  checked={selected}
                                  disabled={submitting || disabled}
                                  onChange={() => toggleLabel(label)}
                                  className="h-4 w-4 accent-blue-700"
                                />

                                <span className="text-sm font-bold text-black">
                                  {label}
                                </span>
                              </label>
                            );
                          })}
                        </div>

                        {!form.source && (
                          <p className="mt-2 text-xs text-black">
                            Select a service first to choose labels.
                          </p>
                        )}

                        {errors.labels && (
                          <p className="mt-2 text-sm font-bold text-black">
                            {errors.labels}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {requiresServiceDetails && (
                  <div className="rounded-xl border-2 border-blue-700 bg-white p-5">
                    {feedbackType === "score" ? (
                      <>
                        <ScorePicker
                          value={form.score}
                          onChange={(value) => updateForm("score", value)}
                        />

                        {errors.score && (
                          <p className="mt-2 text-sm font-bold">
                            {errors.score}
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <StarPicker
                          value={form.rating}
                          onChange={(value) => updateForm("rating", value)}
                          label="Rating"
                        />

                        {errors.rating && (
                          <p className="mt-2 text-sm font-bold">
                            {errors.rating}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}

                <div>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <label
                      htmlFor="feedback-content"
                      className="block text-sm font-bold"
                    >
                      Review <span className="text-blue-700">*</span>
                    </label>

                    <span
                      className={[
                        "text-xs font-bold",
                        isOverReviewLimit ? "text-red-700" : "text-blue-700",
                      ].join(" ")}
                    >
                      {reviewLength}/{MAX_REVIEW_LENGTH}
                    </span>
                  </div>

                  <textarea
                    id="feedback-content"
                    value={form.content}
                    maxLength={MAX_REVIEW_LENGTH}
                    onChange={(event) =>
                      updateForm("content", event.target.value)
                    }
                    disabled={submitting}
                    rows={4}
                    placeholder="Keep your review concise (up to 100 characters)..."
                    className="w-full rounded-lg border-2 border-blue-700 bg-white px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-700"
                  />

                  <p className="mt-1 text-xs text-black">
                    Maximum {MAX_REVIEW_LENGTH} characters.
                  </p>

                  {errors.content && (
                    <p className="mt-1 text-sm font-bold">{errors.content}</p>
                  )}
                </div>

                {requiresServiceDetails && (
                  <div>
                    <label
                      htmlFor="feedback-outcome"
                      className="mb-1.5 block text-sm font-bold"
                    >
                      Result
                    </label>

                    <select
                      id="feedback-outcome"
                      value={form.outcome}
                      onChange={(event) =>
                        updateForm("outcome", event.target.value)
                      }
                      disabled={submitting || !form.source}
                      className="w-full rounded-lg border-2 border-blue-700 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-700 disabled:bg-gray-100"
                    >
                      <option value="">
                        {form.source
                          ? "Select a result if applicable"
                          : "Select a service first"}
                      </option>

                      {selectedService?.results.map((result) => (
                        <option key={result} value={result}>
                          {result}
                        </option>
                      ))}
                    </select>

                    <p className="mt-1 text-xs text-black">
                      Select only a result that accurately reflects your
                      experience.
                    </p>
                  </div>
                )}

                {serverError && (
                  <div className="rounded-lg border-2 border-blue-700 bg-blue-100 px-4 py-3 text-sm font-bold">
                    {serverError}
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="rounded-2xl border-2 border-blue-700 bg-blue-100 p-7 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-700 text-2xl font-bold text-white">
                  ✓
                </div>

                <h3 className="mt-5 text-2xl font-bold">Thank You</h3>

                <p className="mx-auto mt-3 max-w-md text-sm leading-6">
                  Your feedback has been submitted.
                </p>

                {referenceId && (
                  <p className="mt-4 text-sm font-bold text-blue-700">
                    Reference: {referenceId}
                  </p>
                )}
              </div>
            )}
          </ModalBody>

          {step === 2 && (
            <ModalFooter>
              <button
                type="button"
                onClick={close}
                disabled={submitting}
                className="rounded-lg border-2 border-blue-700 bg-white px-5 py-3 text-sm font-bold text-black hover:bg-blue-100 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  void handleSubmit();
                }}
                disabled={submitting}
                className="rounded-lg bg-blue-700 px-5 py-3 text-sm font-bold text-white hover:bg-black disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Feedback"}
              </button>
            </ModalFooter>
          )}

          {step === 3 && (
            <ModalFooter>
              <button
                type="button"
                onClick={close}
                className="w-full rounded-lg bg-blue-700 px-5 py-3 text-sm font-bold text-white hover:bg-black"
              >
                Close
              </button>
            </ModalFooter>
          )}
        </div>
      </Modal>
    </>
  );
}
