import { useEffect, useMemo, useState } from "react";

import { Modal, ModalBody, ModalFooter, ModalHeader } from "@build-me/ui";

import { trackAnalyticsEvent } from "../../analytics";
import { getApiBaseUrl } from "../../api-url";

type FeedbackType = "rate" | "score" | "complaint" | "suggestion";

type FeedbackForm = {
  name: string;
  email: string;
  role: string;
  company: string;
  location: string;
  tags: string;
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

const initialForm: FeedbackForm = {
  name: "",
  email: "",
  role: "",
  company: "",
  location: "",
  tags: "",
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
      <p className="mb-2 text-sm font-bold text-black">{label}</p>

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

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};

    if (!feedbackType) {
      nextErrors.feedbackType = "Please select a feedback type.";
    }

    if (!form.name.trim()) {
      nextErrors.name = "Name is required.";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!validateEmail(form.email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (feedbackType === "score") {
      if (form.score === null || form.score < 0 || form.score > 10) {
        nextErrors.score = "Please select a score from 0 to 10.";
      }
    } else if (feedbackType === "rate") {
      if (form.rating === null || form.rating < 1 || form.rating > 5) {
        nextErrors.rating = "Please select your rating.";
      }
    }

    if (!form.content.trim()) {
      nextErrors.content = "Please share your feedback.";
    }

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

      const tags = form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      const payload = {
        type: feedbackType,
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role.trim() || undefined,
        company: form.company.trim() || undefined,
        location: form.location.trim() || undefined,
        tags,
        rating: feedbackType === "rate" ? form.rating : undefined,
        score: feedbackType === "score" ? form.score : undefined,
        content: form.content.trim(),
        outcome:
          feedbackType === "rate" || feedbackType === "score"
            ? form.outcome.trim() || undefined
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

                  <div>
                    <label
                      htmlFor="feedback-role"
                      className="mb-1.5 block text-sm font-bold"
                    >
                      Role
                    </label>

                    <input
                      id="feedback-role"
                      value={form.role}
                      onChange={(event) =>
                        updateForm("role", event.target.value)
                      }
                      disabled={submitting}
                      placeholder="e.g. Product Manager"
                      className="w-full rounded-lg border-2 border-blue-700 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-700"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="feedback-company"
                      className="mb-1.5 block text-sm font-bold"
                    >
                      Company
                    </label>

                    <input
                      id="feedback-company"
                      value={form.company}
                      onChange={(event) =>
                        updateForm("company", event.target.value)
                      }
                      disabled={submitting}
                      placeholder="Company or organisation"
                      className="w-full rounded-lg border-2 border-blue-700 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-700"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="feedback-location"
                      className="mb-1.5 block text-sm font-bold"
                    >
                      Location
                    </label>

                    <input
                      id="feedback-location"
                      value={form.location}
                      onChange={(event) =>
                        updateForm("location", event.target.value)
                      }
                      disabled={submitting}
                      placeholder="e.g. England (UK)"
                      className="w-full rounded-lg border-2 border-blue-700 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-700"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="feedback-tags"
                      className="mb-1.5 block text-sm font-bold"
                    >
                      Tags
                    </label>

                    <input
                      id="feedback-tags"
                      value={form.tags}
                      onChange={(event) =>
                        updateForm("tags", event.target.value)
                      }
                      disabled={submitting}
                      placeholder="Delivery, Mentoring, Engineering"
                      className="w-full rounded-lg border-2 border-blue-700 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-700"
                    />

                    <p className="mt-1 text-xs">Separate tags with commas.</p>
                  </div>
                </div>

                {(feedbackType === "rate" || feedbackType === "score") && (
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
                  <label
                    htmlFor="feedback-content"
                    className="mb-1.5 block text-sm font-bold"
                  >
                    Your Review <span className="text-blue-700">*</span>
                  </label>

                  <textarea
                    id="feedback-content"
                    value={form.content}
                    onChange={(event) =>
                      updateForm("content", event.target.value)
                    }
                    disabled={submitting}
                    rows={6}
                    placeholder="Tell us about your experience..."
                    className="w-full rounded-lg border-2 border-blue-700 bg-white px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-700"
                  />

                  {errors.content && (
                    <p className="mt-1 text-sm font-bold">{errors.content}</p>
                  )}
                </div>

                {(feedbackType === "rate" || feedbackType === "score") && (
                  <div>
                    <label
                      htmlFor="feedback-outcome"
                      className="mb-1.5 block text-sm font-bold"
                    >
                      Outcome / Result
                    </label>

                    <textarea
                      id="feedback-outcome"
                      value={form.outcome}
                      onChange={(event) =>
                        updateForm("outcome", event.target.value)
                      }
                      disabled={submitting}
                      rows={3}
                      placeholder="What result or improvement did you experience? (Optional)"
                      className="w-full rounded-lg border-2 border-blue-700 bg-white px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-700"
                    />
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
                  Your feedback has been submitted
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
