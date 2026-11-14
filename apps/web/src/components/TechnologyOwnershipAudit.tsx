import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ANALYTICS_EVENTS, trackAnalyticsEvent } from "../analytics";
import { getApiBaseUrl } from "../api-url";

type AuditOption = "A" | "B" | "C";

type AuditStage = "details" | "questions" | "results";

type Question = {
  number: number;
  title: string;
  question: string;
  options: {
    value: AuditOption;
    label: string;
  }[];
};

type Answers = Record<number, AuditOption | null>;

type AuditResult = {
  category: string;
  diagnostic: string;
  cta: string;
  ctaEvent:
    | typeof ANALYTICS_EVENTS.DELIVER_MY_PROJECT_CLICKED
    | typeof ANALYTICS_EVENTS.MENTOR_ME_CLICKED
    | typeof ANALYTICS_EVENTS.COFFEE_WITH_ME_CLICKED;
  href: string;
};

const apiBaseUrl = getApiBaseUrl(import.meta.env.VITE_API_URL);
const OWNERSHIP_AUDIT_PATH = "/ownership-audits";

const SCORE_MAP: Record<AuditOption, number> = {
  A: 2,
  B: 5,
  C: 10,
};

const questions: Question[] = [
  {
    number: 1,
    title: "Project Readiness & Timelines",
    question:
      "What is the current status and urgency of your technology project or platform?",
    options: [
      {
        value: "A",
        label:
          "Urgent rescue required—we have broken code, missed deadlines, or scaling bottlenecks.",
      },
      {
        value: "B",
        label:
          "Active build or refactor in progress, but we need architecture guidance and oversight.",
      },
      {
        value: "C",
        label:
          "Stable platform with clear internal ownership; looking for high-level strategy or expansion.",
      },
    ],
  },
  {
    number: 2,
    title: "Core Technology Stack & Infrastructure",
    question:
      "How would you describe your core software architecture and stack management?",
    options: [
      {
        value: "A",
        label:
          "Legacy or fragmented tech stack with undocumented dependencies and ad-hoc hosting.",
      },
      {
        value: "B",
        label:
          "Modern stack (e.g., React, Node, Python, SQL) managed manually or via basic deployment scripts.",
      },
      {
        value: "C",
        label:
          "Standardized monorepo/microservices with automated CI/CD pipelines and IaC setup.",
      },
    ],
  },
  {
    number: 3,
    title: "Source Code & Repository Control",
    question:
      "Where does your source code live, and who has administrative ownership over it?",
    options: [
      {
        value: "A",
        label:
          "Code is stored on personal developer machines or managed entirely by third-party freelancers.",
      },
      {
        value: "B",
        label:
          "Centrally stored on GitHub/GitLab, but access permissions and branches are managed manually.",
      },
      {
        value: "C",
        label:
          "Managed in an organization-owned repo with enforced branch rules, automated linting, and PR reviews.",
      },
    ],
  },
  {
    number: 4,
    title: "Software Subscriptions & Infrastructure Accounts",
    question:
      "Who holds the primary administrative credentials for your cloud servers, APIs, and SaaS tools?",
    options: [
      {
        value: "A",
        label:
          "Credentials are scattered across team members' personal emails or unknown accounts.",
      },
      {
        value: "B",
        label:
          "Shared via a central password manager, but lacks role-based access control or audit logs.",
      },
      {
        value: "C",
        label:
          "Managed under a centralized corporate identity with multi-factor authentication (MFA) and strict access roles.",
      },
    ],
  },
  {
    number: 5,
    title: "Quality Assurance & Automated Testing",
    question:
      "How do you test and verify code quality before releasing updates to production?",
    options: [
      {
        value: "A",
        label:
          "Manual testing directly in production or relying on end-users to report bugs.",
      },
      {
        value: "B",
        label:
          "Basic manual QA testing in a staging environment before manual deployments.",
      },
      {
        value: "C",
        label:
          "Automated test suites (Unit/Integration) enforced through automated CI/CD deployment pipelines.",
      },
    ],
  },
  {
    number: 6,
    title: "Data Protection & Database Management",
    question:
      "How are your application databases, state backups, and migrations handled?",
    options: [
      {
        value: "A",
        label:
          "Manual database changes run directly in production with irregular or missing backups.",
      },
      {
        value: "B",
        label:
          "Scheduled automated backups are active, but database migrations are run manually.",
      },
      {
        value: "C",
        label:
          "Version-controlled ORM migrations with automated daily backups, point-in-time recovery, and encryption.",
      },
    ],
  },
  {
    number: 7,
    title: "Technical Documentation & Knowledge Base",
    question:
      "If your lead developer or key engineer stepped away today, how easily could a new developer take over?",
    options: [
      {
        value: "A",
        label:
          "Extremely difficult—most application logic and setup knowledge exist only in people's heads.",
      },
      {
        value: "B",
        label:
          "Moderately easy—we have a basic README and setup guide, but architectural decisions aren't documented.",
      },
      {
        value: "C",
        label:
          "Seamless—we maintain clear API documentation, setup scripts, and architectural decisions (ADRs).",
      },
    ],
  },
  {
    number: 8,
    title: "Offboarding & Off-Board Access Revocation",
    question:
      "What process is executed when a developer or vendor leaves your project?",
    options: [
      {
        value: "A",
        label:
          "Ad-hoc—we change main passwords only if we remember or if an issue arises.",
      },
      {
        value: "B",
        label:
          "Manual offboarding checklist to revoke GitHub, cloud, and database access.",
      },
      {
        value: "C",
        label:
          "Automated offboarding via Single Sign-On (SSO) with instant access revocation across all tools.",
      },
    ],
  },
  {
    number: 9,
    title: "DevSecOps & Security Monitoring",
    question:
      "How do you monitor security vulnerabilities, dependency updates, and secrets in your codebase?",
    options: [
      {
        value: "A",
        label:
          "We don't actively scan; API keys and secrets are occasionally hardcoded in source files.",
      },
      {
        value: "B",
        label:
          "Environment variables are isolated (.env), but dependency updates and security patches are done reactively.",
      },
      {
        value: "C",
        label:
          "Automated secret scanning, automated dependency security alerts, and strict environment isolation.",
      },
    ],
  },
  {
    number: 10,
    title: "Engineering Budget & Scaling Capacity",
    question:
      "What is your primary constraint regarding engineering delivery right now?",
    options: [
      {
        value: "A",
        label:
          "Lack of technical direction and execution power—we need end-to-end execution support.",
      },
      {
        value: "B",
        label:
          "Lack of strategic coaching—we have developers but need high-level guidance to optimize workflows.",
      },
      {
        value: "C",
        label:
          "Budget and operations are fully optimized—we are simply networking or exploring elite advisory partnerships.",
      },
    ],
  },
];

function createInitialAnswers(): Answers {
  return Object.fromEntries(
    questions.map((question) => [question.number, null]),
  ) as Answers;
}

function getAuditResult(score: number): AuditResult {
  if (score <= 35) {
    return {
      category: "High Risk",
      diagnostic:
        "High technical debt, unmanaged assets, critical execution gaps.",
      cta: "Deliver My Project",
      ctaEvent: ANALYTICS_EVENTS.DELIVER_MY_PROJECT_CLICKED,
      href: "/deliver-my-project",
    };
  }

  if (score <= 69) {
    return {
      category: "Moderate Control",
      diagnostic:
        "Functional foundation, but lacks automated governance and structure.",
      cta: "Mentor Me",
      ctaEvent: ANALYTICS_EVENTS.MENTOR_ME_CLICKED,
      href: "/mentor-me",
    };
  }

  return {
    category: "Strong Ownership",
    diagnostic: "Highly mature, automated, and secure architecture.",
    cta: "Coffee With Me",
    ctaEvent: ANALYTICS_EVENTS.COFFEE_WITH_ME_CLICKED,
    href: "/coffee-with-me",
  };
}

export default function TechnologyOwnershipAudit() {
  const navigate = useNavigate();

  const [stage, setStage] = useState<AuditStage>("details");
  const [questionNumber, setQuestionNumber] = useState(1);

  const [fullName, setFullName] = useState("");
  const [visitorEmail, setVisitorEmail] = useState("");

  const [answers, setAnswers] = useState<Answers>(createInitialAnswers);

  const [score, setScore] = useState<number | null>(null);

  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    trackAnalyticsEvent({
      name: ANALYTICS_EVENTS.OWNERSHIP_AUDIT_VIEWED,
      eventType: "view",
      path: OWNERSHIP_AUDIT_PATH,
    });
  }, []);

  const currentQuestion = questions[questionNumber - 1];

  const scrollToTop = () => {
    const modalBody = document.querySelector<HTMLElement>(
      ".ui-modal[open] .ui-modal__body",
    );

    if (modalBody) {
      modalBody.scrollTo({
        top: 0,
        behavior: "auto",
      });

      return;
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const validateVisitorDetails = () => {
    if (!fullName.trim()) {
      setValidationError("Please enter your full name.");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(visitorEmail.trim())) {
      setValidationError("Please enter a valid email address.");
      return false;
    }

    return true;
  };

  const calculateScore = (currentAnswers: Answers) =>
    questions.reduce((total, question) => {
      const answer = currentAnswers[question.number];

      return total + (answer ? SCORE_MAP[answer] : 0);
    }, 0);

  const submitAudit = async (finalAnswers: Answers) => {
    if (isSubmitting) {
      return;
    }

    const calculatedScore = calculateScore(finalAnswers);

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
          fullName: fullName.trim(),
          visitorEmail: visitorEmail.trim(),
          answers: Object.fromEntries(
            questions.map((question) => [
              `q${question.number}`,
              finalAnswers[question.number],
            ]),
          ),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save Ownership Audit.");
      }

      setScore(calculatedScore);
      setStage("results");
      scrollToTop();

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

  const handleDetailsContinue = () => {
    setValidationError(null);
    setSubmitError(null);

    if (!validateVisitorDetails()) {
      return;
    }

    setQuestionNumber(1);
    setStage("questions");
    scrollToTop();
  };

  const handleAnswer = (value: AuditOption) => {
    if (isSubmitting) {
      return;
    }

    const updatedAnswers: Answers = {
      ...answers,
      [questionNumber]: value,
    };

    setAnswers(updatedAnswers);
    setValidationError(null);
    setSubmitError(null);

    if (questionNumber === 1) {
      trackAnalyticsEvent({
        name: ANALYTICS_EVENTS.OWNERSHIP_AUDIT_STARTED,
        eventType: "click",
        path: OWNERSHIP_AUDIT_PATH,
      });
    }

    if (questionNumber < questions.length) {
      setQuestionNumber((previous) => previous + 1);
      scrollToTop();
      return;
    }

    void submitAudit(updatedAnswers);
  };

  const handlePrevious = () => {
    if (isSubmitting) {
      return;
    }

    setValidationError(null);
    setSubmitError(null);

    if (stage === "details") {
      return;
    }

    if (stage === "questions") {
      if (questionNumber === 1) {
        setStage("details");
        scrollToTop();
        return;
      }

      setQuestionNumber((previous) => previous - 1);
      scrollToTop();
      return;
    }

    if (stage === "results") {
      setStage("questions");
      setQuestionNumber(10);
      scrollToTop();
    }
  };

  const handleResultCta = () => {
    if (score === null) {
      return;
    }

    const result = getAuditResult(score);

    trackAnalyticsEvent({
      name: result.ctaEvent,
      eventType: "click",
      path: OWNERSHIP_AUDIT_PATH,
    });

    navigate(result.href);
  };

  const handleRestart = () => {
    setStage("details");
    setQuestionNumber(1);
    setFullName("");
    setVisitorEmail("");
    setAnswers(createInitialAnswers());
    setScore(null);
    setValidationError(null);
    setSubmitError(null);
    setIsSubmitting(false);
    scrollToTop();
  };

  const primaryButtonClass =
    "inline-flex items-center justify-center rounded-lg bg-[#0052FF] px-5 py-3 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  const secondaryButtonClass =
    "inline-flex items-center justify-center rounded-lg border-2 border-[#0052FF] bg-white px-5 py-3 font-semibold text-[#0052FF] transition hover:bg-[#EBF3FE] focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  if (stage === "details") {
    return (
      <div className="space-y-6 rounded-2xl bg-[#EBF3FE] p-6 sm:p-8">
        <div>
          <p className="text-sm font-semibold text-[#0052FF]">Step 1 of 3</p>

          <h3 className="mt-2 text-2xl font-bold text-[#0052FF] sm:text-3xl">
            Your Details
          </h3>

          <p className="mt-3 leading-7 text-gray-700">
            Enter your name and email to begin your Technology Ownership Audit.
          </p>
        </div>

        <div className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-gray-900">
              Full Name
            </span>

            <input
              type="text"
              value={fullName}
              onChange={(event) => {
                setFullName(event.target.value);
                setValidationError(null);
              }}
              autoComplete="name"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-gray-900">
              Email
            </span>

            <input
              type="email"
              value={visitorEmail}
              onChange={(event) => {
                setVisitorEmail(event.target.value);
                setValidationError(null);
              }}
              autoComplete="email"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]"
            />
          </label>
        </div>

        {validationError && (
          <p className="text-sm font-medium text-red-600" role="alert">
            {validationError}
          </p>
        )}

        <div className="border-t border-blue-200 pt-5">
          <button
            type="button"
            className={primaryButtonClass}
            onClick={handleDetailsContinue}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (stage === "questions") {
    return (
      <div className="space-y-6 rounded-2xl bg-[#EBF3FE] p-6 sm:p-8">
        <div>
          <p className="text-sm font-semibold text-[#0052FF]">Step 2 of 3</p>

          <p className="mt-2 text-sm font-semibold text-gray-700">
            Question {questionNumber} of {questions.length}
          </p>

          <div
            className="mt-3 h-2 overflow-hidden rounded-full bg-white"
            aria-hidden="true"
          >
            <div
              className="h-full rounded-full bg-[#0052FF] transition-all duration-300"
              style={{
                width: `${(questionNumber / questions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        <fieldset className="space-y-5">
          <legend className="w-full">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#0052FF]">
              {currentQuestion.title}
            </p>

            <h3 className="mt-3 text-xl font-bold leading-8 text-[#0052FF] sm:text-2xl">
              {currentQuestion.question}
            </h3>
          </legend>

          <div className="space-y-3">
            {currentQuestion.options.map((option) => {
              const selectedAnswer = answers[currentQuestion.number];
              const isSelected = selectedAnswer === option.value;

              return (
                <label
                  key={option.value}
                  className={[
                    "flex cursor-pointer items-start gap-3 rounded-xl border-2 bg-white p-4 transition",
                    isSelected
                      ? "border-[#0052FF] bg-blue-50"
                      : "border-transparent hover:border-blue-300",
                  ].join(" ")}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.number}`}
                    value={option.value}
                    checked={isSelected}
                    onChange={() => handleAnswer(option.value)}
                    disabled={isSubmitting}
                    className="mt-1 h-4 w-4 accent-[#0052FF]"
                  />

                  <span className="flex-1">
                    <span className="block font-semibold text-gray-900">
                      {option.value}
                    </span>

                    <span className="mt-1 block text-sm leading-6 text-gray-700">
                      {option.label}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {submitError && (
          <p className="text-sm font-medium text-red-600" role="alert">
            {submitError}
          </p>
        )}

        <div className="border-t border-blue-200 pt-5">
          <button
            type="button"
            className={secondaryButtonClass}
            onClick={handlePrevious}
            disabled={isSubmitting}
          >
            Back
          </button>
        </div>

        {isSubmitting && (
          <p className="text-sm font-medium text-gray-600" role="status">
            Preparing your Ownership Audit results...
          </p>
        )}
      </div>
    );
  }

  const result = score !== null ? getAuditResult(score) : null;

  return (
    <div className="space-y-6 rounded-2xl bg-[#EBF3FE] p-6 sm:p-8">
      <div className="text-center">
        <p className="text-sm font-semibold text-[#0052FF]">Step 3 of 3</p>

        <h3 className="mt-2 text-2xl font-bold text-[#0052FF] sm:text-3xl">
          Your Ownership Audit Results
        </h3>

        <p className="mt-3 leading-7 text-gray-700">
          Your score shows your current level of technology ownership and the
          most relevant next step.
        </p>
      </div>

      <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold text-gray-600">Your Score</p>

        <p className="mt-2 text-6xl font-bold text-[#0052FF]">{score}</p>

        <p className="mt-2 text-gray-600">out of 100</p>
      </div>

      <div className="rounded-xl bg-white p-6 text-center">
        <h4 className="text-xl font-bold text-[#0052FF]">{result?.category}</h4>

        <p className="mt-3 leading-7 text-gray-700">{result?.diagnostic}</p>
      </div>

      <div className="rounded-xl bg-white p-6">
        <p className="text-sm font-semibold text-[#0052FF]">
          Recommended Next Step
        </p>

        <p className="mt-2 text-xl font-bold text-gray-900">{result?.cta}</p>
      </div>

      <div className="flex flex-col gap-3 border-t border-blue-200 pt-5 sm:flex-row sm:justify-between">
        <button
          type="button"
          className={secondaryButtonClass}
          onClick={handleRestart}
        >
          Retake Audit
        </button>

        <button
          type="button"
          className={primaryButtonClass}
          onClick={handleResultCta}
        >
          {result?.cta}
        </button>
      </div>
    </div>
  );
}
