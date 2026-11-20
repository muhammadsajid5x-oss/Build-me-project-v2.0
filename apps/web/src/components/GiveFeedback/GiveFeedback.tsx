import { useCallback, useEffect, useState } from "react";

import {
  Modal,
  ModalActions,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@build-me/ui";

import { trackAnalyticsEvent } from "../../analytics";
import { getApiBaseUrl } from "../../api-url";

type FeedbackType = "score" | "rate" | "complaint" | "suggestion";

type FeedbackForm = {
  name: string;
  email: string;
  score: number | null;
  rating: number | null;
  title: string;
  content: string;
};

type FeedbackField =
  | "name"
  | "email"
  | "score"
  | "rating"
  | "title"
  | "content";

type FeedbackErrors = Partial<Record<FeedbackField, string>>;

type FeedbackResponse = {
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
  score: null,
  rating: null,
  title: "",
  content: "",
};

const feedbackOptions: Array<{
  type: FeedbackType;
  title: string;
  description: string;
}> = [
  {
    type: "score",
    title: "Score Us",
    description: "How likely are you to recommend us?",
  },
  {
    type: "rate",
    title: "Rate Us",
    description: "Tell us how your experience was.",
  },
  {
    type: "complaint",
    title: "Report Issues",
    description: "Let us know about a problem.",
  },
  {
    type: "suggestion",
    title: "Suggest Something",
    description: "Share an idea that could make things better.",
  },
];

const feedbackTitles: Record<FeedbackType, string> = {
  score: "Score Us",
  rate: "Rate Us",
  complaint: "Report Issues",
  suggestion: "Suggest Something",
};

function validateEmail(email: string): boolean {
  const atIndex = email.indexOf("@");

  if (atIndex <= 0 || atIndex === email.length - 1) {
    return false;
  }

  const domain = email.slice(atIndex + 1);
  const dotIndex = domain.indexOf(".");

  return dotIndex > 0 && dotIndex < domain.length - 1;
}

function getContentLabel(type: FeedbackType): string {
  switch (type) {
    case "score":
      return "Additional Comments";
    case "rate":
      return "Your Review";
    case "complaint":
      return "Issue Details";
    case "suggestion":
      return "Suggestion Details";
  }
}

function getContentPlaceholder(type: FeedbackType): string {
  switch (type) {
    case "score":
      return "Share any additional comments...";
    case "rate":
      return "Tell us about your experience...";
    case "complaint":
      return "Describe the issue in detail...";
    case "suggestion":
      return "Tell us what you would like to see...";
  }
}

function getSubmitError(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "We could not submit your feedback. Please try again.";
}

export default function GiveFeedback() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [feedbackType, setFeedbackType] = useState<FeedbackType | null>(null);
  const [form, setForm] = useState<FeedbackForm>(initialForm);
  const [errors, setErrors] = useState<FeedbackErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [serverError, setServerError] = useState("");

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

  const reset = useCallback(() => {
    setStep(1);
    setFeedbackType(null);
    setForm(initialForm);
    setErrors({});
    setSubmitting(false);
    setReferenceId(null);
    setServerError("");
  }, []);

  const handleClose = useCallback(() => {
    if (submitting) {
      return;
    }

    setOpen(false);
    reset();
  }, [reset, submitting]);

  const handleOpen = () => {
    setOpen(true);

    trackAnalyticsEvent({
      name: "give.feedback.clicked",
      eventType: "click",
      path: window.location.pathname,
    });
  };

  const handleTypeSelect = (type: FeedbackType) => {
    setFeedbackType(type);
    setErrors({});
    setServerError("");
    setStep(2);

    trackAnalyticsEvent({
      name: "give.feedback.step.one.completed",
      eventType: "click",
      path: window.location.pathname,
    });
  };

  const updateForm = <K extends keyof FeedbackForm>(
    field: K,
    value: FeedbackForm[K],
  ) => {
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
  };

  const validate = (): boolean => {
    if (!feedbackType) {
      return false;
    }

    const nextErrors: FeedbackErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Name is required.";
    }

    const email = form.email.trim();

    if (!email) {
      nextErrors.email = "Email is required.";
    } else if (!validateEmail(email)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (feedbackType === "score") {
      if (
        form.score === null ||
        form.score < 1 ||
        form.score > 10 ||
        !Number.isInteger(form.score)
      ) {
        nextErrors.score = "Please select a score from 1 to 10.";
      }
    }

    if (feedbackType === "rate") {
      if (
        form.rating === null ||
        form.rating < 1 ||
        form.rating > 5 ||
        !Number.isInteger(form.rating)
      ) {
        nextErrors.rating = "Please select a rating.";
      }
    }

    if (
      (feedbackType === "complaint" || feedbackType === "suggestion") &&
      !form.title.trim()
    ) {
      nextErrors.title = "Title is required.";
    }

    if (!form.content.trim()) {
      nextErrors.content = `${getContentLabel(feedbackType)} is required.`;
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (submitting || !feedbackType || !validate()) {
      return;
    }

    setSubmitting(true);
    setServerError("");

    try {
      const apiBaseUrl = getApiBaseUrl(import.meta.env.VITE_API_URL);

      const payload: Record<string, unknown> = {
        type: feedbackType,
        name: form.name.trim(),
        email: form.email.trim(),
        content: form.content.trim(),
      };

      if (feedbackType === "score" && form.score !== null) {
        payload.score = form.score;
      }

      if (feedbackType === "rate" && form.rating !== null) {
        payload.rating = form.rating;
      }

      if (
        (feedbackType === "complaint" || feedbackType === "suggestion") &&
        form.title.trim()
      ) {
        payload.title = form.title.trim();
      }

      const response = await fetch(`${apiBaseUrl}/api/v1/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      let result: FeedbackResponse = {};

      try {
        result = (await response.json()) as FeedbackResponse;
      } catch {
        result = {};
      }

      if (!response.ok) {
        throw new Error(
          result.error?.message ||
            "We could not submit your feedback. Please try again.",
        );
      }

      const returnedReferenceId = result.data?.referenceId;

      if (!returnedReferenceId) {
        throw new Error(
          "Feedback was submitted, but no reference ID was returned.",
        );
      }

      setReferenceId(returnedReferenceId);
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
      setServerError(getSubmitError(error));
    } finally {
      setSubmitting(false);
    }
  };

  let progress = 100;

  if (step === 1) {
    progress = 33;
  } else if (step === 2) {
    progress = 66;
  }

  const stepLabel = `Step ${step} of 3`;

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        aria-label="Give Feedback"
        className="fixed right-0 top-1/2 z-900 -translate-y-1/2 rounded-l-md bg-blue-600 px-3 py-4 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <span className="block [writing-mode:vertical-rl]">Give Feedback</span>
      </button>

      <Modal
        open={open}
        onClose={handleClose}
        size="lg"
        closeOnBackdrop={!submitting}
        closeOnEscape={!submitting}
        aria-label="Give Feedback"
        className="text-gray-900"
      >
        <div className="flex min-h-0 flex-col">
          <div
            className="h-1 w-full bg-blue-100"
            aria-label={`Feedback progress: ${progress}%`}
          >
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <ModalHeader className="border-b-0! pb-2">
            <div className="pr-6">
              <p className="text-sm font-medium text-blue-600">{stepLabel}</p>

              <h2 className="mt-1 text-2xl font-bold text-blue-600">
                Give Feedback
              </h2>
            </div>
          </ModalHeader>

          <ModalBody className="pt-0!">
            {step === 1 && (
              <div className="space-y-3 rounded-xl bg-blue-50 p-5">
                <div className="mb-5">
                  <h3 className="text-lg font-semibold text-blue-700">
                    Share Your Feedback
                  </h3>

                  <p className="mt-1 text-sm text-gray-600">
                    What would you like to share with us?
                  </p>
                </div>

                <div className="grid gap-3">
                  {feedbackOptions.map((option) => (
                    <button
                      key={option.type}
                      type="button"
                      onClick={() => handleTypeSelect(option.type)}
                      className="group w-full rounded-lg border border-blue-100 bg-white p-4 text-left transition hover:border-blue-400 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h3 className="text-base font-semibold text-blue-700">
                            {option.title}
                          </h3>

                          <p className="mt-1 text-sm text-gray-600">
                            {option.description}
                          </p>
                        </div>

                        <span
                          aria-hidden="true"
                          className="text-xl text-blue-400 transition group-hover:translate-x-1 group-hover:text-blue-600"
                        >
                          →
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && feedbackType && (
              <div className="space-y-5 rounded-xl bg-blue-50 p-5">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setErrors({});
                    setServerError("");
                  }}
                  disabled={submitting}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  ← Back
                </button>

                <div>
                  <h3 className="text-xl font-semibold text-blue-700">
                    {feedbackTitles[feedbackType]}
                  </h3>

                  <p className="mt-1 text-sm text-gray-600">
                    Tell us a little about yourself and your feedback.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="feedback-name"
                      className="mb-1.5 block text-sm font-medium text-blue-700"
                    >
                      Name
                    </label>

                    <input
                      id="feedback-name"
                      type="text"
                      value={form.name}
                      onChange={(event) =>
                        updateForm("name", event.target.value)
                      }
                      disabled={submitting}
                      className="w-full rounded-md border border-blue-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                      placeholder="Your name"
                    />

                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="feedback-email"
                      className="mb-1.5 block text-sm font-medium text-blue-700"
                    >
                      Email
                    </label>

                    <input
                      id="feedback-email"
                      type="email"
                      value={form.email}
                      onChange={(event) =>
                        updateForm("email", event.target.value)
                      }
                      disabled={submitting}
                      className="w-full rounded-md border border-blue-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                      placeholder="you@example.com"
                    />

                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                {feedbackType === "score" && (
                  <div className="rounded-lg border border-blue-100 bg-blue-100/60 p-4">
                    <p className="mb-3 text-sm font-medium text-blue-700">
                      How likely are you to recommend us?
                    </p>

                    <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
                      {Array.from({ length: 10 }, (_, index) => {
                        const score = index + 1;
                        const selected = form.score === score;

                        return (
                          <button
                            key={score}
                            type="button"
                            onClick={() => updateForm("score", score)}
                            disabled={submitting}
                            aria-label={`Score ${score}`}
                            aria-pressed={selected}
                            className={[
                              "flex h-10 items-center justify-center rounded-md border text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-500",
                              selected
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "border-blue-200 bg-white text-blue-700 hover:border-blue-500 hover:bg-blue-50",
                            ].join(" ")}
                          >
                            {score}
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-2 flex justify-between text-xs text-blue-600">
                      <span>More Unlikely</span>
                      <span>More Likely</span>
                    </div>

                    {errors.score && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.score}
                      </p>
                    )}
                  </div>
                )}

                {feedbackType === "rate" && (
                  <div className="rounded-lg border border-blue-100 bg-blue-100/60 p-4">
                    <p className="mb-2 text-sm font-medium text-blue-700">
                      Your Rating
                    </p>

                    <div className="flex gap-2">
                      {Array.from({ length: 5 }, (_, index) => {
                        const rating = index + 1;
                        const selected =
                          form.rating !== null && rating <= form.rating;
                        const starLabel =
                          rating === 1 ? "1 star" : `${rating} stars`;

                        return (
                          <button
                            key={rating}
                            type="button"
                            onClick={() => updateForm("rating", rating)}
                            disabled={submitting}
                            aria-label={starLabel}
                            aria-pressed={form.rating === rating}
                            className={[
                              "text-3xl leading-none transition focus:outline-none focus:ring-2 focus:ring-blue-500",
                              selected
                                ? "text-blue-600"
                                : "text-blue-200 hover:text-blue-400",
                            ].join(" ")}
                          >
                            ★
                          </button>
                        );
                      })}
                    </div>

                    {errors.rating && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.rating}
                      </p>
                    )}
                  </div>
                )}

                {(feedbackType === "complaint" ||
                  feedbackType === "suggestion") && (
                  <div className="rounded-lg border border-blue-100 bg-blue-100/60 p-4">
                    <label
                      htmlFor="feedback-title"
                      className="mb-1.5 block text-sm font-medium text-blue-700"
                    >
                      Title
                    </label>

                    <input
                      id="feedback-title"
                      type="text"
                      value={form.title}
                      onChange={(event) =>
                        updateForm("title", event.target.value)
                      }
                      disabled={submitting}
                      className="w-full rounded-md border border-blue-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                      placeholder={
                        feedbackType === "complaint"
                          ? "Briefly describe the issue"
                          : "What would you like us to improve?"
                      }
                    />

                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.title}
                      </p>
                    )}
                  </div>
                )}

                <div className="rounded-lg border border-blue-100 bg-blue-100/60 p-4">
                  <label
                    htmlFor="feedback-content"
                    className="mb-1.5 block text-sm font-medium text-blue-700"
                  >
                    {getContentLabel(feedbackType)}
                  </label>

                  <textarea
                    id="feedback-content"
                    value={form.content}
                    onChange={(event) =>
                      updateForm("content", event.target.value)
                    }
                    disabled={submitting}
                    rows={5}
                    className="w-full resize-y rounded-md border border-blue-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                    placeholder={getContentPlaceholder(feedbackType)}
                  />

                  {errors.content && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.content}
                    </p>
                  )}
                </div>

                {serverError && (
                  <div
                    role="alert"
                    className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
                  >
                    {serverError}
                  </div>
                )}
              </div>
            )}

            {step === 3 && referenceId && (
              <div className="flex min-h-80 flex-col items-center justify-center rounded-xl bg-blue-50 px-4 py-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-3xl text-blue-600">
                  ✓
                </div>

                <h3 className="mt-5 text-2xl font-bold text-blue-700">
                  Thank You!
                </h3>

                <p className="mt-2 max-w-md text-sm text-gray-600">
                  Your feedback has been received successfully.
                </p>

                <div className="mt-5 rounded-lg border border-blue-100 bg-white px-5 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
                    Reference Ticket
                  </p>

                  <p className="mt-1 font-mono text-sm font-semibold text-blue-700">
                    {referenceId}
                  </p>
                </div>
              </div>
            )}
          </ModalBody>

          {step === 2 && (
            <ModalFooter>
              <ModalActions align="between">
                <p className="text-xs text-gray-500">
                  Your feedback helps us improve.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    void handleSubmit();
                  }}
                  disabled={submitting}
                  className="inline-flex min-h-10 items-center justify-center rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Submitting..." : "Preview & Submit"}
                </button>
              </ModalActions>
            </ModalFooter>
          )}

          {step === 3 && (
            <ModalFooter>
              <ModalActions align="end">
                <button
                  type="button"
                  onClick={handleClose}
                  className="inline-flex min-h-10 items-center justify-center rounded-md bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Done
                </button>
              </ModalActions>
            </ModalFooter>
          )}
        </div>
      </Modal>
    </>
  );
}
