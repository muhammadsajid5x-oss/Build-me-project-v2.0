import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { ANALYTICS_EVENTS, trackAnalyticsEvent } from "../analytics";
import { getApiBaseUrl } from "../api-url";
import { technologyOwnershipToolkit as toolkit } from "../content/technology-ownership-toolkit";
import { downloadTechnologyOwnershipToolkitPdf } from "../utils/download-technology-ownership-toolkit";

type ToolkitStep = "intro" | "details" | "content";

type VisitorDetails = {
  fullName: string;
  visitorEmail: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function TechnologyOwnershipToolkit() {
  const navigate = useNavigate();

  const [step, setStep] = useState<ToolkitStep>("intro");
  const [fullName, setFullName] = useState("");
  const [visitorEmail, setVisitorEmail] = useState("");
  const [error, setError] = useState("");
  const [downloadError, setDownloadError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContinue = () => {
    setError("");
    setStep("details");
  };

  const handleVisitorDetailsSubmit = async (
    event: FormEvent<HTMLFormElement>,
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
        `${getApiBaseUrl()}/api/v1/ownership-toolkit-accesses`,
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

      setStep("content");

      trackAnalyticsEvent({
        name: ANALYTICS_EVENTS.OWNERSHIP_TOOLKIT_COMPLETED,
        eventType: "click",
        path: "/ownership-toolkit",
      });
    } catch {
      setError("We could not save your details. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewOnline = () => {
    navigate("/ownership-toolkit");
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
        "The Toolkit PDF could not be downloaded. Please try again.",
      );
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-gray-600">
          Technology Ownership Toolkit
        </p>

        <p className="text-sm text-gray-500">
          {step === "intro" && "Step 1 of 3"}
          {step === "details" && "Step 2 of 3"}
          {step === "content" && "Step 3 of 3"}
        </p>
      </div>

      <div
        className="h-2 w-full overflow-hidden rounded-full bg-gray-200"
        role="progressbar"
        aria-label="Toolkit journey progress"
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
            <h2 className="text-2xl font-bold text-gray-900">
              Why use the Technology Ownership Toolkit?
            </h2>

            <p className="leading-7 text-gray-600">
              {toolkit.introduction.description}
            </p>

            <p className="leading-7 text-gray-600">
              This practical toolkit helps you understand and apply ownership
              across the complete technology lifecycle.
            </p>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h3 className="font-semibold text-gray-900">
              The ownership principle
            </h3>

            <p className="mt-2 leading-7 text-gray-700">
              {toolkit.introduction.principle}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">What you will get</h3>

            <ul className="list-disc space-y-2 pl-5 text-gray-600">
              <li>The complete ten-stage ownership lifecycle.</li>
              <li>Practical checklists for every lifecycle stage.</li>
              <li>Evidence guidance and production readiness checks.</li>
              <li>Ownership review questions and responsibilities.</li>
              <li>An online version and downloadable PDF.</li>
            </ul>
          </div>

          <button
            type="button"
            onClick={handleContinue}
            className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Continue Next Step
          </button>
        </section>
      )}

      {step === "details" && (
        <section className="space-y-5">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">
              Access the Toolkit
            </h2>

            <p className="leading-7 text-gray-600">
              Please provide your details to access the complete Technology
              Ownership Toolkit.
            </p>
          </div>

          <form
            onSubmit={handleVisitorDetailsSubmit}
            className="space-y-4"
            noValidate
          >
            <div className="space-y-2">
              <label
                htmlFor="toolkit-full-name"
                className="block text-sm font-medium text-gray-700"
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
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                aria-invalid={Boolean(error) && fullName.trim().length < 2}
                aria-describedby={
                  error && fullName.trim().length < 2
                    ? "toolkit-form-error"
                    : undefined
                }
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="toolkit-visitor-email"
                className="block text-sm font-medium text-gray-700"
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
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                aria-invalid={
                  Boolean(error) && !emailPattern.test(visitorEmail.trim())
                }
                aria-describedby={
                  error && !emailPattern.test(visitorEmail.trim())
                    ? "toolkit-form-error"
                    : undefined
                }
              />
            </div>

            {error && (
              <p
                id="toolkit-form-error"
                role="alert"
                className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setStep("intro");
                }}
                disabled={isSubmitting}
                className="w-full rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Back
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Saving..." : "Access Toolkit"}
              </button>
            </div>
          </form>
        </section>
      )}

      {step === "content" && (
        <section className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900">
              {toolkit.title}
            </h2>

            <p className="leading-7 text-gray-600">{toolkit.subtitle}</p>

            <p className="leading-7 text-gray-600">
              Your details have been saved. Choose how you would like to access
              the complete Technology Ownership Toolkit.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={handleViewOnline}
              className="flex min-h-36 flex-col items-center justify-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-6 text-center transition hover:border-blue-400 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span className="text-lg font-bold text-gray-900">
                View Online
              </span>

              <span className="text-sm leading-6 text-gray-600">
                Open the complete Technology Ownership Toolkit in your browser.
              </span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="flex min-h-36 flex-col items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white p-6 text-center transition hover:border-blue-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span className="text-lg font-bold text-gray-900">
                Download PDF
              </span>

              <span className="text-sm leading-6 text-gray-600">
                Download the complete toolkit as a PDF document.
              </span>
            </button>
          </div>

          {downloadError && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {downloadError}
            </p>
          )}
        </section>
      )}
    </div>
  );
}
