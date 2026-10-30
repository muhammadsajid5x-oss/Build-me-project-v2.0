import { useEffect, useState, type ChangeEvent } from "react";

import { Button } from "@build-me/ui";

import { ANALYTICS_EVENTS, trackAnalyticsEvent } from "../analytics";
import { getApiBaseUrl } from "../api-url";

type AuditOptionValue = "A" | "B" | "C";

interface AuditAnswer {
  step1: AuditOptionValue | null;
  step2: AuditOptionValue | null;
  step3: AuditOptionValue | null;
}

interface StepOption {
  value: AuditOptionValue;
  label: string;
}

interface Step {
  id: number;
  title: string;
  question: string;
  options: StepOption[];
}

interface AuditResult {
  title: string;
  category: string;
  meaning: string;
  recommendedAction: string;
}

interface OwnershipAuditResponse {
  data: {
    id: string;
    step1: AuditOptionValue;
    step2: AuditOptionValue;
    step3: AuditOptionValue;
    score: number;
    category: string;
    createdAt: string;
  };
}

const apiBaseUrl = getApiBaseUrl(import.meta.env.VITE_API_URL);
const OWNERSHIP_AUDIT_PATH = "/ownership-audits";

const steps: Step[] = [
  {
    id: 1,
    title: "Project Scope & Current Stage",
    question:
      "What stage is your current technology initiative or software project in right now?",
    options: [
      {
        value: "A",
        label:
          "Just exploring ideas / Early concept stage (Low immediate urgency)",
      },
      {
        value: "B",
        label:
          "Active development or refactoring, but hitting bottlenecks (Medium urgency, potential consulting/dev support)",
      },
      {
        value: "C",
        label:
          "Ready to build, scale, or migrate immediately with dedicated budget (High-value prospect)",
      },
    ],
  },
  {
    id: 2,
    title: "Tech Stack & Architecture",
    question:
      "What core technology stack or infrastructure are you building or scaling with?",
    options: [
      {
        value: "A",
        label:
          "Traditional monolith / Legacy stack (PHP, WordPress, old .NET/Java)",
      },
      {
        value: "B",
        label:
          "Modern Web Stack (React, Node.js, Python/FastAPI, PostgreSQL, Docker)",
      },
      {
        value: "C",
        label:
          "Complex Cloud-Native / Multi-service architecture or Custom AI Integration",
      },
    ],
  },
  {
    id: 3,
    title: "Primary Bottleneck / Pain Point",
    question:
      "What is your biggest blocker to hitting your technical or delivery goals right now?",
    options: [
      {
        value: "A",
        label: "Lack of reliable engineering talent or development bandwidth",
      },
      {
        value: "B",
        label:
          "Architectural debt, scaling issues, or database optimization problems",
      },
      {
        value: "C",
        label:
          "DevSecOps, CI/CD pipeline setup, or deployment/infrastructure bottlenecks",
      },
    ],
  },
];

function getAuditResult(score: number): AuditResult {
  if (score <= 6) {
    return {
      title: "Tech Chaos & Orphaned Assets",
      category: "High Risk",
      meaning:
        "There may be significant gaps in asset tracking and clear ownership. Unassigned accounts and rogue software can introduce security vulnerabilities, compliance risks, and wasted spending.",
      recommendedAction:
        "Conduct a full 30-day technology asset sweep, establish a centralized registry, and assign a point person to every active license immediately.",
    };
  }

  if (score <= 11) {
    return {
      title: "Managed, but Reactive",
      category: "Moderate Control",
      meaning:
        "You have basic tracking, but ownership may still depend on spreadsheets or informal procedures. Ownership can fall through the cracks during staffing changes or rapid scaling.",
      recommendedAction:
        "Move from manual spreadsheets to automated or dynamic tracking and standardize lifecycle governance so accounts transition correctly during offboarding.",
    };
  }

  return {
    title: "Optimized & Secure",
    category: "Strong Ownership",
    meaning:
      "You appear to have high visibility over your technology footprint, clearly defined account owners, and proactive offboarding and maintenance policies.",
    recommendedAction:
      "Schedule quarterly vendor cost optimization reviews and introduce automated compliance checks.",
  };
}

export default function TechnologyOwnershipAudit() {
  const [currentStep, setCurrentStep] = useState(1);

  const [answers, setAnswers] = useState<AuditAnswer>({
    step1: null,
    step2: null,
    step3: null,
  });

  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const currentStepData = steps[currentStep - 1];
  const isLastStep = currentStep === steps.length;

  useEffect(() => {
    trackAnalyticsEvent({
      name: ANALYTICS_EVENTS.OWNERSHIP_AUDIT_VIEWED,
      eventType: "view",
      path: OWNERSHIP_AUDIT_PATH,
    });
  }, []);

  const handleOptionSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const { value, name } = event.target;

    setAnswers((previousAnswers) => ({
      ...previousAnswers,
      [name]: value as AuditOptionValue,
    }));

    setValidationError(null);
    setSubmitError(null);

    if (currentStep === 1) {
      trackAnalyticsEvent({
        name: ANALYTICS_EVENTS.OWNERSHIP_AUDIT_STARTED,
        eventType: "click",
        path: OWNERSHIP_AUDIT_PATH,
      });
    }
  };

  const handleNext = () => {
    const currentAnswer = answers[`step${currentStep}` as keyof AuditAnswer];

    if (!currentAnswer) {
      setValidationError("Please select an answer before continuing.");
      return;
    }

    setValidationError(null);
    setSubmitError(null);
    setCurrentStep((previousStep) => previousStep + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setValidationError(null);
      setSubmitError(null);
      setCurrentStep((previousStep) => previousStep - 1);
    }
  };

  const handleComplete = async () => {
    const currentAnswer = answers[`step${currentStep}` as keyof AuditAnswer];

    if (!currentAnswer) {
      setValidationError("Please select an answer before completing.");
      return;
    }

    const selectedAnswers = [
      answers.step1,
      answers.step2,
      answers.step3,
    ].filter((answer): answer is AuditOptionValue => answer !== null);

    if (selectedAnswers.length !== steps.length) {
      setValidationError(
        "Please answer all audit questions before completing.",
      );
      return;
    }

    setValidationError(null);
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/ownership-audits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          step1: answers.step1,
          step2: answers.step2,
          step3: answers.step3,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save Ownership Audit.");
      }

      const result = (await response.json()) as OwnershipAuditResponse;

      setScore(result.data.score);

      trackAnalyticsEvent({
        name: ANALYTICS_EVENTS.OWNERSHIP_AUDIT_COMPLETED,
        eventType: "click",
        path: OWNERSHIP_AUDIT_PATH,
      });
    } catch {
      setSubmitError(
        "We could not save your audit right now. Please try again in a moment.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestart = () => {
    setCurrentStep(1);

    setAnswers({
      step1: null,
      step2: null,
      step3: null,
    });

    setScore(null);
    setValidationError(null);
    setSubmitError(null);
  };

  if (score !== null) {
    const result = getAuditResult(score);

    return (
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-500">
            Ownership Audit Complete
          </p>

          <h3 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
            {result.title}
          </h3>

          <p className="mt-2 text-sm font-semibold text-gray-600">
            {result.category}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-center">
          <p className="text-sm text-gray-500">Your Audit Score</p>

          <p className="mt-1 text-4xl font-bold text-gray-900">
            {score}
            <span className="text-lg font-medium text-gray-500"> / 15</span>
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-base font-semibold text-gray-900">
              What this means
            </h4>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              {result.meaning}
            </p>
          </div>

          <div>
            <h4 className="text-base font-semibold text-gray-900">
              Recommended action
            </h4>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              {result.recommendedAction}
            </p>
          </div>
        </div>

        <div className="flex justify-end border-t border-gray-200 pt-5">
          <Button type="button" variant="secondary" onClick={handleRestart}>
            Retake Audit
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm font-medium text-gray-500">
          Step {currentStep} of {steps.length}
        </p>
      </div>

      <div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">
          {currentStepData.title}
        </h3>

        <p className="mb-5 text-gray-600">{currentStepData.question}</p>

        <fieldset className="space-y-3">
          <legend className="sr-only">{currentStepData.question}</legend>

          {currentStepData.options.map((option) => {
            const answerKey = `step${currentStep}` as keyof AuditAnswer;

            const inputId = `audit-${currentStep}-${option.value}`;

            const isSelected = answers[answerKey] === option.value;

            return (
              <label
                key={option.value}
                htmlFor={inputId}
                className={[
                  "flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-colors",
                  "focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2",
                  isSelected
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
                ].join(" ")}
              >
                <input
                  id={inputId}
                  type="radio"
                  name={answerKey}
                  value={option.value}
                  checked={isSelected}
                  onChange={handleOptionSelect}
                  className="mt-1 h-4 w-4 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />

                <span className="flex-1">
                  <span className="block font-semibold text-gray-900">
                    {option.value}
                  </span>

                  <span className="mt-1 block text-sm leading-5 text-gray-600">
                    {option.label}
                  </span>
                </span>
              </label>
            );
          })}
        </fieldset>

        {validationError && (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {validationError}
          </p>
        )}

        {submitError && (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {submitError}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-gray-200 pt-5">
        {currentStep > 1 ? (
          <Button
            type="button"
            variant="secondary"
            onClick={handlePrevious}
            disabled={isSubmitting}
          >
            Previous
          </Button>
        ) : (
          <span />
        )}

        {!isLastStep ? (
          <Button
            type="button"
            variant="primary"
            onClick={handleNext}
            disabled={isSubmitting}
          >
            Next
          </Button>
        ) : (
          <Button
            type="button"
            variant="primary"
            onClick={handleComplete}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Complete Audit"}
          </Button>
        )}
      </div>
    </div>
  );
}
