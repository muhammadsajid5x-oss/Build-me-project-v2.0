import { useState, type SyntheticEvent } from "react";

import { ANALYTICS_EVENTS, trackAnalyticsEvent } from "../analytics";
import { getApiBaseUrl } from "../api-url";

type LearningCircleStep = "intro" | "details" | "joined";

type VisitorDetails = {
  name: string;
  email: string;
  website: string;
  organization: string;
};

const TELEGRAM_GROUP_URL = "https://t.me/+Q9KY1dL4c-BkMjg8";

const isValidEmail = (value: string): boolean => {
  const atIndex = value.indexOf("@");

  if (atIndex <= 0 || atIndex === value.length - 1) {
    return false;
  }

  const domain = value.slice(atIndex + 1);
  const dotIndex = domain.indexOf(".");

  return dotIndex > 0 && dotIndex < domain.length - 1;
};

const isValidWebsite = (value: string): boolean => {
  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const getCurrentPart = (step: LearningCircleStep): number => {
  switch (step) {
    case "intro":
      return 1;
    case "details":
      return 2;
    case "joined":
      return 3;
    default:
      return 1;
  }
};

export default function OwnershipLearningCircle() {
  const [step, setStep] = useState<LearningCircleStep>("intro");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [organization, setOrganization] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  const currentPart = getCurrentPart(step);

  const handleContinue = () => {
    setError("");
    setStep("details");
  };

  const handleJoinSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const visitor: VisitorDetails = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      website: website.trim(),
      organization: organization.trim(),
    };

    if (visitor.name.length < 2) {
      setError("Please enter your name.");
      return;
    }

    if (!isValidEmail(visitor.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (visitor.website && !isValidWebsite(visitor.website)) {
      setError(
        "Please enter a valid website starting with http:// or https://.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${getApiBaseUrl(
          import.meta.env.VITE_API_URL,
        )}/api/v1/ownership-learning-circle-requests`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(visitor),
        },
      );

      if (!response.ok) {
        throw new Error("Unable to save your details.");
      }

      trackAnalyticsEvent({
        name: ANALYTICS_EVENTS.CIRCLE_JOIN_CLICK,
        eventType: "click",
        path: "/",
      });

      setStep("joined");

      window.open(TELEGRAM_GROUP_URL, "_blank", "noopener,noreferrer");
    } catch {
      setError("We could not save your details. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTelegramRedirect = () => {
    trackAnalyticsEvent({
      name: ANALYTICS_EVENTS.CIRCLE_TELEGRAM_REDIRECT,
      eventType: "click",
      path: "/",
    });

    window.open(TELEGRAM_GROUP_URL, "_blank", "noopener,noreferrer");
  };

  const handleCopyLink = async () => {
    setError("");
    setIsLinkCopied(false);

    try {
      await navigator.clipboard.writeText(TELEGRAM_GROUP_URL);
      setIsLinkCopied(true);
    } catch {
      setError(
        "We could not copy the Telegram link. Please use the Join Telegram button.",
      );
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
            Ownership Learning Circle
          </p>

          <h2 className="mt-1 text-2xl font-bold tracking-tight text-black sm:text-3xl">
            Learn. Practise. Own.
          </h2>
        </div>

        <span className="shrink-0 rounded-full bg-blue-100 px-3 py-1.5 text-xs font-bold text-blue-700">
          Part {currentPart} of 3
        </span>
      </div>

      {/* Progress */}
      <div
        className="mb-6 grid grid-cols-3 gap-2"
        role="tablist"
        aria-label="Ownership Learning Circle parts"
      >
        {[
          { number: 1, label: "Quick Win" },
          { number: 2, label: "Join" },
          { number: 3, label: "Start Learning" },
        ].map((part) => {
          const isActive = currentPart === part.number;

          return (
            <div
              key={part.number}
              role="tab"
              aria-selected={isActive}
              className={`rounded-xl border-2 px-3 py-3 text-center transition ${
                isActive
                  ? "border-blue-700 bg-blue-700 text-white"
                  : "border-blue-100 bg-blue-100 text-blue-700"
              }`}
            >
              <span className="block text-xs font-bold uppercase tracking-wide">
                Part {part.number}
              </span>

              <span className="mt-1 block text-sm font-semibold">
                {part.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Part 1 */}
      {step === "intro" && (
        <section
          aria-labelledby="learning-circle-part-one"
          className="space-y-6"
        >
          <div className="rounded-2xl border-2 border-blue-100 bg-blue-100 p-6 sm:p-8">
            <h3
              id="learning-circle-part-one"
              className="text-2xl font-bold text-black sm:text-3xl"
            >
              Get a Quick Win
            </h3>

            <p className="mt-3 max-w-2xl text-base leading-7 text-black/70">
              A practical space to build stronger Technology Ownership, one
              small improvement at a time.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border-2 border-blue-100 bg-white p-5">
              <h4 className="font-bold text-black">Learn</h4>

              <p className="mt-2 text-sm leading-6 text-black/70">
                Understand practical ownership principles.
              </p>
            </div>

            <div className="rounded-2xl border-2 border-blue-100 bg-white p-5">
              <h4 className="font-bold text-black">Practise</h4>

              <p className="mt-2 text-sm leading-6 text-black/70">
                Turn ideas into better technology habits.
              </p>
            </div>

            <div className="rounded-2xl border-2 border-blue-100 bg-white p-5">
              <h4 className="font-bold text-black">Share</h4>

              <p className="mt-2 text-sm leading-6 text-black/70">
                Learn with people facing similar challenges.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleContinue}
              className="w-full rounded-xl bg-blue-700 px-6 py-3.5 font-bold text-white transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 sm:w-auto"
            >
              Continue
            </button>
          </div>
        </section>
      )}

      {/* Part 2 */}
      {step === "details" && (
        <section
          aria-labelledby="learning-circle-part-two"
          className="space-y-6"
        >
          <div className="rounded-2xl border-2 border-blue-100 bg-blue-100 p-6 sm:p-8">
            <h3
              id="learning-circle-part-two"
              className="text-2xl font-bold text-black sm:text-3xl"
            >
              Join the Circle
            </h3>

            <p className="mt-2 text-sm text-black/70">
              Just the basics. We will take you straight to Telegram.
            </p>
          </div>

          <form onSubmit={handleJoinSubmit} className="space-y-5" noValidate>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="learning-circle-name"
                  className="block text-sm font-bold text-black"
                >
                  <span>Name</span>
                  <span className="ml-1 text-blue-700" aria-hidden="true">
                    *
                  </span>
                </label>

                <input
                  id="learning-circle-name"
                  name="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  required
                  className="w-full rounded-xl border-2 border-blue-100 bg-white px-4 py-3 text-black outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="learning-circle-email"
                  className="block text-sm font-bold text-black"
                >
                  <span>Email</span>
                  <span className="ml-1 text-blue-700" aria-hidden="true">
                    *
                  </span>
                </label>

                <input
                  id="learning-circle-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border-2 border-blue-100 bg-white px-4 py-3 text-black outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="learning-circle-website"
                  className="block text-sm font-bold text-black"
                >
                  <span>Website</span>
                  <span className="ml-1 text-xs font-normal text-black/50">
                    (Optional)
                  </span>
                </label>

                <input
                  id="learning-circle-website"
                  name="website"
                  type="url"
                  value={website}
                  onChange={(event) => setWebsite(event.target.value)}
                  autoComplete="url"
                  className="w-full rounded-xl border-2 border-blue-100 bg-white px-4 py-3 text-black outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                  placeholder="https://example.com"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="learning-circle-organization"
                  className="block text-sm font-bold text-black"
                >
                  <span>Organization</span>
                  <span className="ml-1 text-xs font-normal text-black/50">
                    (Optional)
                  </span>
                </label>

                <input
                  id="learning-circle-organization"
                  name="organization"
                  type="text"
                  value={organization}
                  onChange={(event) => setOrganization(event.target.value)}
                  autoComplete="organization"
                  className="w-full rounded-xl border-2 border-blue-100 bg-white px-4 py-3 text-black outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                  placeholder="Your organization"
                />
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border-2 border-blue-700 bg-blue-100 px-4 py-3 text-sm font-semibold text-black"
              >
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-blue-700 px-6 py-3.5 font-bold text-white transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {isSubmitting ? "Joining..." : "Join & Open Telegram"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Part 3 */}
      {step === "joined" && (
        <section
          aria-labelledby="learning-circle-part-three"
          className="space-y-6"
        >
          <div className="rounded-2xl border-2 border-blue-700 bg-blue-700 p-6 text-white sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/80">
              You are ready
            </p>

            <h3
              id="learning-circle-part-three"
              className="mt-2 text-2xl font-bold sm:text-3xl"
            >
              Start Learning
            </h3>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80">
              Join the Telegram circle to continue.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border-2 border-blue-700 bg-blue-100 px-4 py-3 text-sm font-semibold text-black"
            >
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={handleTelegramRedirect}
              className="rounded-xl bg-blue-700 px-6 py-3.5 font-bold text-white transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
            >
              Join Telegram
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="rounded-xl border-2 border-blue-700 bg-white px-6 py-3.5 font-bold text-blue-700 transition hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
            >
              {isLinkCopied ? "Link Copied" : "Copy Telegram Link"}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
