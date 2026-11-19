import { useEffect, useState, type SubmitEvent } from "react";

import { ANALYTICS_EVENTS, trackAnalyticsEvent } from "../analytics";
import { getApiBaseUrl } from "../api-url";
import { technologyOwnershipToolkit as toolkit } from "../content/technology-ownership-toolkit";
import { downloadTechnologyOwnershipToolkitPdf } from "../utils/download-technology-ownership-toolkit";

type ToolkitStep = "intro" | "details" | "content";

type VisitorDetails = {
  fullName: string;
  visitorEmail: string;
};

const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const primaryButtonClass =
  "w-full rounded-lg bg-[#0052FF] px-5 py-3 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

const secondaryButtonClass =
  "w-full rounded-lg border-2 border-[#0052FF] bg-white px-5 py-3 font-semibold text-[#0052FF] transition hover:bg-[#EBF3FE] focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

export default function OwnershipToolkitPage() {
  const [step, setStep] = useState<ToolkitStep>("intro");
  const [fullName, setFullName] = useState("");
  const [visitorEmail, setVisitorEmail] = useState("");
  const [error, setError] = useState("");
  const [downloadError, setDownloadError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stepNumberByStep: Record<ToolkitStep, number> = {
    intro: 1,
    details: 2,
    content: 3,
  };

  const progressPercentageByStep: Record<ToolkitStep, number> = {
    intro: 33.33,
    details: 66.66,
    content: 100,
  };

  const stepNumber = stepNumberByStep[step];
  const progressPercentage = progressPercentageByStep[step];

  useEffect(() => {
    if (step !== "content") {
      return;
    }

    trackAnalyticsEvent({
      name: ANALYTICS_EVENTS.OWNERSHIP_TOOLKIT_VIEWED,
      eventType: "view",
      path: "/ownership-toolkit",
    });
  }, [step]);

  const handleContinue = () => {
    setError("");
    setStep("details");
  };

  const handleBackToIntro = () => {
    setError("");
    setStep("intro");
  };

  const handleVisitorDetailsSubmit = async (
    event: SubmitEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setError("");

    const visitor: VisitorDetails = {
      fullName: fullName.trim(),
      visitorEmail: visitorEmail.trim().toLowerCase(),
    };

    if (visitor.fullName.length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (!emailPattern.test(visitor.visitorEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${getApiBaseUrl(import.meta.env.VITE_API_URL)}/api/v1/ownership-toolkit-accesses`,
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
        name: ANALYTICS_EVENTS.OWNERSHIP_TOOLKIT_COMPLETED,
        eventType: "click",
        path: "/ownership-toolkit",
      });

      setStep("content");
    } catch {
      setError("We could not save your details. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = () => {
    setDownloadError("");

    try {
      downloadTechnologyOwnershipToolkitPdf();

      trackAnalyticsEvent({
        name: ANALYTICS_EVENTS.OWNERSHIP_TOOLKIT_DOWNLOADED,
        eventType: "click",
        path: "/ownership-toolkit",
      });
    } catch {
      setDownloadError(
        "We could not download the toolkit right now. Please try again.",
      );
    }
  };

  const handleBackFromToolkit = () => {
    setDownloadError("");
    setStep("details");
  };

  return (
    <main className="min-h-screen w-full bg-white">
      <div
        className={`mx-auto w-full -mt-9 max-w-6xl px-4 sm:px-6 lg:px-8 ${
          step === "content"
            ? "py-8 sm:py-12"
            : "min-h-[calc(100dvh-1rem)] overflow-hidden py-2 sm:min-h-[calc(100dvh-3rem)] sm:py-6"
        }`}
      >
        {/* =========================================================
            STEP PROGRESS
            ========================================================= */}
        <section className="mb-4 rounded-2xl border border-[#0052FF] bg-[#EBF3FE] p-5 sm:p-6">
          <div className="flex flex-col gap-1 -mt-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[#0052FF]">
                Technology Ownership Toolkit
              </p>

              <p className="mt-1 text-sm font-semibold text-black">
                Step {stepNumber} of 3
              </p>
            </div>

            <div className="w-full sm:w-48">
              <div className="h-2 w-full overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-[#0052FF] transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              <p className="mt-1 text-right text-xs font-medium text-black">
                {Math.round(progressPercentage)}% complete
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================
            STEP 1 — INTRODUCTION
            ========================================================= */}
        {step === "intro" && (
          <section className="space-y-3 rounded-2xl border border-[#0052FF] bg-[#EBF3FE] p-5 sm:p-8">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold text-black sm:text-3xl -mt-4">
                Technology Ownership Toolkit
              </h2>

              <p className="leading-7 text-black">
                {toolkit.introduction.description}
              </p>
            </div>

            <div className="rounded-xl border border-black bg-white p-5">
              <h2 className="text-lg font-bold text-black">
                What you will get
              </h2>

              <ul className="mt-4 grid gap-3 text-black sm:grid-cols-2">
                <li className="rounded-lg bg-[#EBF3FE] p-3">
                  Complete technology ownership lifecycle
                </li>

                <li className="rounded-lg bg-[#EBF3FE] p-3">
                  Practical checklists for every stage
                </li>

                <li className="rounded-lg bg-[#EBF3FE] p-3">
                  Production readiness guidance
                </li>

                <li className="rounded-lg bg-[#EBF3FE] p-3">
                  Evidence and ownership review questions
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={handleContinue}
              className={primaryButtonClass}
            >
              Continue Next Step
            </button>
          </section>
        )}

        {/* =========================================================
            STEP 2 — DETAILS
            ========================================================= */}
        {step === "details" && (
          <section className="space-y-6 rounded-2xl border border-[#0052FF] bg-[#EBF3FE] p-5 sm:p-8">
            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-black sm:text-4xl">
                Access the Toolkit
              </h1>

              <p className="leading-7 text-black">
                Enter your details to access the complete Technology Ownership
                Toolkit online.
              </p>
            </div>

            <form
              onSubmit={handleVisitorDetailsSubmit}
              noValidate
              className="space-y-5"
            >
              <div className="space-y-2">
                <label
                  htmlFor="toolkit-full-name"
                  className="block text-sm font-semibold text-black"
                >
                  Full name
                </label>

                <input
                  id="toolkit-full-name"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  required
                  minLength={2}
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Enter your full name"
                  className="w-full rounded-lg border border-black bg-white px-4 py-3 text-black outline-none transition focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/20"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="toolkit-visitor-email"
                  className="block text-sm font-semibold text-black"
                >
                  Email address
                </label>

                <input
                  id="toolkit-visitor-email"
                  name="visitorEmail"
                  type="email"
                  autoComplete="email"
                  required
                  value={visitorEmail}
                  onChange={(event) => setVisitorEmail(event.target.value)}
                  placeholder="Enter your email address"
                  className="w-full rounded-lg border border-black bg-white px-4 py-3 text-black outline-none transition focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/20"
                />
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-lg border border-black bg-white p-3 text-sm font-medium text-black"
                >
                  {error}
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleBackToIntro}
                  disabled={isSubmitting}
                  className={secondaryButtonClass}
                >
                  Back
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={primaryButtonClass}
                >
                  {isSubmitting ? "Saving..." : "Access Toolkit"}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* =========================================================
            STEP 3 — COMPLETE ONLINE TOOLKIT
            ========================================================= */}
        {step === "content" && (
          <>
            {/* =====================================================
                STEP 3 INTRO
                ===================================================== */}
            <section className="mb-10 rounded-2xl border border-[#0052FF] bg-[#EBF3FE] p-5 sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-wide text-[#0052FF]">
                Step 3
              </p>

              <h1 className="mt-2 text-3xl font-bold text-black sm:text-4xl">
                Your Toolkit Is Ready
              </h1>

              <p className="mt-3 leading-7 text-black">
                Your details have been saved successfully. Read the complete
                Technology Ownership Toolkit below.
              </p>
            </section>

            {/* =====================================================
                TOOLKIT HEADER
                ===================================================== */}
            <header className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-wide text-[#0052FF]">
                Technology Ownership
              </p>

              <h1 className="text-3xl font-bold text-black sm:text-4xl">
                {toolkit.title}
              </h1>

              <p className="leading-7 text-black">{toolkit.subtitle}</p>
            </header>

            {/* =====================================================
                WHAT IS TECHNOLOGY OWNERSHIP?
                ===================================================== */}
            <section className="mt-10 space-y-4">
              <h2 className="text-2xl font-bold text-black">
                {toolkit.introduction.heading}
              </h2>

              <p className="leading-7 text-black">
                {toolkit.introduction.description}
              </p>

              <div className="rounded-lg border border-[#0052FF] bg-[#EBF3FE] p-5">
                <p className="font-semibold leading-7 text-black">
                  {toolkit.introduction.principle}
                </p>
              </div>
            </section>

            {/* =====================================================
                TECHNOLOGY OWNERSHIP LIFECYCLE
                ===================================================== */}
            <section className="mt-12 space-y-6">
              <h2 className="text-2xl font-bold text-black">
                The Technology Ownership Lifecycle
              </h2>

              {toolkit.lifecycle.map((stage) => (
                <article
                  key={stage.title}
                  className="space-y-4 rounded-xl border border-black bg-white p-5 sm:p-6"
                >
                  <h3 className="text-xl font-bold text-black">
                    {stage.title}
                  </h3>

                  <div>
                    <h4 className="font-semibold text-black">Objective</h4>

                    <p className="mt-1 leading-7 text-black">
                      {stage.objective}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-black">Checklist</h4>

                    <ul className="mt-2 list-disc space-y-2 pl-5 text-black">
                      {stage.checklist.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-black">
                      Evidence to retain
                    </h4>

                    <ul className="mt-2 list-disc space-y-2 pl-5 text-black">
                      {stage.evidence.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-lg bg-[#EBF3FE] p-4">
                    <h4 className="font-semibold text-black">
                      Ownership question
                    </h4>

                    <p className="mt-1 leading-7 text-black">
                      {stage.ownershipQuestion}
                    </p>
                  </div>
                </article>
              ))}
            </section>

            {/* =====================================================
                PRODUCTION READINESS CHECKLIST
                ===================================================== */}
            <section className="mt-12 space-y-3">
              <h2 className="text-2xl font-bold text-black">
                Production Readiness Checklist
              </h2>

              <ul className="list-disc space-y-2 pl-5 text-black">
                {toolkit.readinessChecklist.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            {/* =====================================================
                TECHNOLOGY OWNERSHIP EVIDENCE RECORD
                ===================================================== */}
            <section className="mt-10 space-y-3">
              <h2 className="text-2xl font-bold text-black">
                Technology Ownership Evidence Record
              </h2>

              <ol className="list-decimal space-y-2 pl-5 text-black">
                {toolkit.evidenceRecord.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </section>

            {/* =====================================================
                OWNERSHIP REVIEW QUESTIONS
                ===================================================== */}
            <section className="mt-10 space-y-3">
              <h2 className="text-2xl font-bold text-black">
                Ownership Review Questions
              </h2>

              <ul className="list-disc space-y-2 pl-5 text-black">
                {toolkit.reviewQuestions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            {/* =====================================================
                OWNERSHIP BOUNDARIES
                ===================================================== */}
            <section className="mt-10 space-y-4">
              <h2 className="text-2xl font-bold text-black">
                Ownership Boundaries
              </h2>

              <div className="rounded-xl border border-black bg-white p-5">
                <h3 className="font-semibold text-black">Product Ownership</h3>

                <p className="mt-2 leading-7 text-black">
                  {toolkit.ownershipBoundaries.productOwnership}
                </p>
              </div>

              <div className="rounded-xl border border-[#0052FF] bg-[#EBF3FE] p-5">
                <h3 className="font-semibold text-black">
                  Technology Ownership
                </h3>

                <p className="mt-2 leading-7 text-black">
                  {toolkit.ownershipBoundaries.technologyOwnership}
                </p>
              </div>
            </section>

            {/* =====================================================
                OWNERSHIP PRINCIPLE
                ===================================================== */}
            <section className="mt-10 rounded-xl border border-[#0052FF] bg-[#EBF3FE] p-5 sm:p-6">
              <h2 className="font-bold text-black">The Ownership Principle</h2>

              <p className="mt-2 font-semibold leading-7 text-black">
                {toolkit.slogan}
              </p>
            </section>

            {/* =====================================================
                STEP 3 COMPLETE
                BACK + DOWNLOAD PDF
                ===================================================== */}
            <section className="mt-14 border-t border-black pt-8">
              <div className="rounded-xl border border-[#0052FF] bg-[#EBF3FE] p-6 text-center sm:p-8">
                <h2 className="mt-2 text-2xl font-bold text-black">
                  You have reached the end
                </h2>

                <p className="mx-auto mt-2 max-w-xl leading-7 text-black">
                  Download the complete Technology Ownership Toolkit as a PDF or
                  return to the previous step.
                </p>

                {downloadError && (
                  <p
                    role="alert"
                    className="mx-auto mt-4 max-w-xl rounded-lg border border-black bg-white p-3 text-sm font-medium text-black"
                  >
                    {downloadError}
                  </p>
                )}

                <div className="mx-auto mt-6 flex max-w-xl flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleBackFromToolkit}
                    className="flex-1 rounded-lg border-2 border-[#0052FF] bg-white px-5 py-3 font-semibold text-[#0052FF] transition hover:bg-[#EBF3FE] focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:ring-offset-2"
                  >
                    ← Back
                  </button>

                  <button
                    type="button"
                    onClick={handleDownload}
                    className="flex-1 rounded-lg bg-[#0052FF] px-5 py-3 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:ring-offset-2"
                  >
                    Download PDF ↓
                  </button>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
