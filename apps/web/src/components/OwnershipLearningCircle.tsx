import { useState, type FormEvent } from "react";

import { ANALYTICS_EVENTS, trackAnalyticsEvent } from "../analytics";
import { getApiBaseUrl } from "../api-url";

type LearningCircleStep = "intro" | "details" | "joined";

type VisitorDetails = {
  name: string;
  email: string;
};

const TELEGRAM_GROUP_URL = "https://t.me/+Q9KY1dL4c-BkMjg8";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function OwnershipLearningCircle() {
  const [step, setStep] = useState<LearningCircleStep>("intro");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  const handleContinue = () => {
    setError("");
    setStep("details");
  };

  const handleJoinSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const visitor: VisitorDetails = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
    };

    if (visitor.name.length < 2) {
      setError("Please enter your name.");
      return;
    }

    if (!emailPattern.test(visitor.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${getApiBaseUrl()}/api/v1/ownership-learning-circle-requests`,
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
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-gray-600">
          Ownership Learning Circle
        </p>

        <p className="text-sm text-gray-500">
          {step === "intro" && "Step 1 of 3"}
          {step === "details" && "Step 2 of 3"}
          {step === "joined" && "Step 3 of 3"}
        </p>
      </div>

      <div
        className="h-2 w-full overflow-hidden rounded-full bg-gray-200"
        role="progressbar"
        aria-label="Learning Circle journey progress"
        aria-valuemin={1}
        aria-valuemax={3}
        aria-valuenow={step === "intro" ? 1 : step === "details" ? 2 : 3}
      >
        <div
          className="h-full rounded-full bg-blue-600 transition-all"
          style={{
            width:
              step === "intro"
                ? "33.33%"
                : step === "details"
                  ? "66.66%"
                  : "100%",
          }}
        />
      </div>

      {step === "intro" && (
        <section className="space-y-5">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-blue-600">
              Join the Ownership Learning Circle
            </h2>

            <p className="leading-7 text-gray-600">
              A free community for people who want to understand, practise, and
              grow Technology Ownership together.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h3 className="font-semibold text-blue-600">
                What is the Learning Circle?
              </h3>

              <p className="mt-2 leading-7 text-gray-700">
                It is a community learning space where people can share
                experiences, discuss Technology Ownership, learn from each
                other, and build stronger ownership practices.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-blue-600">Who is it for?</h3>

              <p className="mt-2 leading-7 text-gray-600">
                Developers, engineers, technology leaders, and anyone who wants
                to take greater ownership of technology outcomes.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-blue-600">
                What do members get?
              </h3>

              <ul className="mt-2 list-disc space-y-2 pl-5 text-gray-600">
                <li>Peer learning and practical discussions.</li>
                <li>Technology Ownership conversations.</li>
                <li>Shared experiences, questions, and insights.</li>
                <li>A free community for continuous learning.</li>
              </ul>
            </div>
          </div>

          <button
            type="button"
            onClick={handleContinue}
            className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Continue
          </button>
        </section>
      )}

      {step === "details" && (
        <section className="space-y-5">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-blue-600">
              Join the Learning Circle
            </h2>

            <p className="leading-7 text-gray-600">
              Share your basic details before joining the community.
            </p>
          </div>

          <form onSubmit={handleJoinSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <label
                htmlFor="learning-circle-name"
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>

              <input
                id="learning-circle-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                minLength={2}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your name"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="learning-circle-email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>

              <input
                id="learning-circle-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email address"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {error && (
              <p
                id="learning-circle-form-error"
                role="alert"
                className="text-sm font-medium text-red-600"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isSubmitting ? "Joining..." : "Join the Learning Circle"}
            </button>
          </form>
        </section>
      )}

      {step === "joined" && (
        <section className="space-y-5">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">
              You're ready to join
            </h2>

            <p className="leading-7 text-gray-600">
              Your details have been received. Continue to Telegram to join the
              Ownership Learning Circle community.
            </p>
          </div>

          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="text-sm leading-6 text-green-800">
              The Telegram group will open in a new tab. If the browser blocks
              the new tab, copy the invite link below and open it in Telegram.
            </p>
          </div>

          {error && (
            <p role="alert" className="text-sm font-medium text-red-600">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleTelegramRedirect}
            className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Join on Telegram
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {isLinkCopied ? "Telegram Link Copied" : "Copy Telegram Link"}
          </button>
        </section>
      )}
    </div>
  );
}
