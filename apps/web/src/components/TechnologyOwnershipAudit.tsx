import { useEffect, useMemo, useState } from "react";

import { Button } from "@build-me/ui";

import { ANALYTICS_EVENTS, trackAnalyticsEvent } from "../analytics";
import { getApiBaseUrl } from "../api-url";

type AuditOption = "A" | "B" | "C";
type AnswerMap = Record<string, AuditOption | null>;

type Question = {
  id: number;
  title: string;
  question: string;
  options: Record<AuditOption, string>;
};

type AuditResponse = {
  data: {
    id: string;
    fullName: string;
    visitorEmail: string;
    score: number;
    category: "High Risk" | "Moderate Control" | "Strong Ownership";
    diagnosticResult: string;
    redirectTarget: "Deliver My Project" | "Mentor Me" | "Coffee With Me";
    createdAt: string;
  };
};

const apiBaseUrl = getApiBaseUrl(import.meta.env.VITE_API_URL);
const OWNERSHIP_AUDIT_PATH = "/";

const questions: Question[] = [
  {
    id: 1,
    title: "Business Intent & Architecture Scope",
    question: "What is the current status and urgency of your technology project or platform?",
    options: {
      A: "Urgent rescue required—we have broken code, missed deadlines, or scaling bottlenecks.",
      B: "Active build or refactor in progress, but we need architecture guidance and oversight.",
      C: "Stable platform with clear internal ownership; looking for high-level strategy or expansion.",
    },
  },
  {
    id: 2,
    title: "Business Intent & Architecture Scope",
    question: "How would you describe your core software architecture and stack management?",
    options: {
      A: "Legacy or fragmented tech stack with undocumented dependencies and ad-hoc hosting.",
      B: "Modern stack (e.g., React, Node, Python, SQL) managed manually or via basic deployment scripts.",
      C: "Standardized monorepo/microservices with automated CI/CD pipelines and IaC setup.",
    },
  },
  {
    id: 3,
    title: "Asset Inventory & Source Code Ownership",
    question: "Where does your source code live, and who has administrative ownership over it?",
    options: {
      A: "Code is stored on personal developer machines or managed entirely by third-party freelancers.",
      B: "Centrally stored on GitHub/GitLab, but access permissions and branches are managed manually.",
      C: "Managed in an organization-owned repo with enforced branch rules, automated linting, and PR reviews.",
    },
  },
  {
    id: 4,
    title: "Asset Inventory & Source Code Ownership",
    question: "Who holds the primary administrative credentials for your cloud servers, APIs, and SaaS tools?",
    options: {
      A: "Credentials are scattered across team members' personal emails or unknown accounts.",
      B: "Shared via a central password manager, but lacks role-based access control or audit logs.",
      C: "Managed under a centralized corporate identity with MFA and strict access roles.",
    },
  },
  {
    id: 5,
    title: "Development Lifecycles & QA Governance",
    question: "How do you test and verify code quality before releasing updates to production?",
    options: {
      A: "Manual testing directly in production or relying on end-users to report bugs.",
      B: "Basic manual QA testing in a staging environment before manual deployments.",
      C: "Automated test suites (Unit/Integration) enforced through automated CI/CD deployment pipelines.",
    },
  },
  {
    id: 6,
    title: "Development Lifecycles & QA Governance",
    question: "How are your application databases, state backups, and migrations handled?",
    options: {
      A: "Manual database changes run directly in production with irregular or missing backups.",
      B: "Scheduled automated backups are active, but database migrations are run manually.",
      C: "Version-controlled ORM migrations with automated daily backups, point-in-time recovery, and encryption.",
    },
  },
  {
    id: 7,
    title: "Team Ownership & Offboarding Protocol",
    question: "If your lead developer or key engineer stepped away today, how easily could a new developer take over?",
    options: {
      A: "Extremely difficult—most application logic and setup knowledge exist only in people's heads.",
      B: "Moderately easy—we have a basic README and setup guide, but architectural decisions aren't documented.",
      C: "Seamless—we maintain clear API documentation, setup scripts, and architectural decisions (ADRs).",
    },
  },
  {
    id: 8,
    title: "Team Ownership & Offboarding Protocol",
    question: "What process is executed when a developer or vendor leaves your project?",
    options: {
      A: "Ad-hoc—we change main passwords only if we remember or if an issue arises.",
      B: "Manual offboarding checklist to revoke GitHub, cloud, and database access.",
      C: "Automated offboarding via Single Sign-On (SSO) with instant access revocation across all tools.",
    },
  },
  {
    id: 9,
    title: "Security, Performance & Budget Scaling",
    question: "How do you monitor security vulnerabilities, dependency updates, and secrets in your codebase?",
    options: {
      A: "We don't actively scan; API keys and secrets are occasionally hardcoded in source files.",
      B: "Environment variables are isolated (.env), but dependency updates and security patches are done reactively.",
      C: "Automated secret scanning, automated dependency security alerts, and strict environment isolation.",
    },
  },
  {
    id: 10,
    title: "Security, Performance & Budget Scaling",
    question: "What is your primary constraint regarding engineering delivery right now?",
    options: {
      A: "Lack of technical direction and execution power—we need end-to-end execution support.",
      B: "Lack of strategic coaching—we have developers but need high-level guidance to optimize workflows.",
      C: "Budget and operations are fully optimized—we are simply networking or exploring elite advisory partnerships.",
    },
  },
];

const pageGroups = [
  [questions[0], questions[1]],
  [questions[2], questions[3]],
  [questions[4], questions[5]],
  [questions[6], questions[7]],
  [questions[8], questions[9]],
];

export default function TechnologyOwnershipAudit() {
  const [screen, setScreen] = useState(1);
  const [fullName, setFullName] = useState("");
  const [visitorEmail, setVisitorEmail] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [result, setResult] = useState<AuditResponse["data"] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    trackAnalyticsEvent({
      name: ANALYTICS_EVENTS.OWNERSHIP_AUDIT_VIEWED,
      eventType: "view",
      path: OWNERSHIP_AUDIT_PATH,
    });
  }, []);

  const currentQuestions = useMemo(() => {
    if (screen < 3 || screen > 7) return [];
    return pageGroups[screen - 3];
  }, [screen]);

  const setAnswer = (id: number, value: AuditOption) => {
    setAnswers((previous) => ({ ...previous, [`q${id}`]: value }));
    setError(null);
  };

  const validateDetails = () => {
    if (fullName.trim().length < 2) {
      setError("Please enter your full name.");
      return false;
    }
    if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(visitorEmail.trim())) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (roleTitle.trim().length < 2) {
      setError("Please enter your role or title.");
      return false;
    }
    return true;
  };

  const validateQuestions = () => {
    if (currentQuestions.some((question) => !answers[`q${question.id}`])) {
      setError("Please answer both questions before continuing.");
      return false;
    }
    return true;
  };

  const startAudit = () => {
    if (!validateDetails()) return;
    setError(null);
    trackAnalyticsEvent({
      name: ANALYTICS_EVENTS.OWNERSHIP_AUDIT_STARTED,
      eventType: "click",
      path: OWNERSHIP_AUDIT_PATH,
    });
    setScreen(3);
  };

  const completeAudit = async () => {
    if (!validateQuestions()) return;

    const payload = {
      fullName: fullName.trim(),
      visitorEmail: visitorEmail.trim(),
      roleTitle: roleTitle.trim(),
      q1: answers.q1,
      q2: answers.q2,
      q3: answers.q3,
      q4: answers.q4,
      q5: answers.q5,
      q6: answers.q6,
      q7: answers.q7,
      q8: answers.q8,
      q9: answers.q9,
      q10: answers.q10,
    };

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/ownership-audits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = (await response.json()) as AuditResponse | { error?: { message?: string } };

      if (!response.ok || !("data" in body)) {
        throw new Error("error" in body ? body.error?.message : "Unable to save your audit.");
      }

      setResult(body.data);
      setScreen(8);

      trackAnalyticsEvent({
        name: ANALYTICS_EVENTS.OWNERSHIP_AUDIT_COMPLETED,
        eventType: "click",
        path: OWNERSHIP_AUDIT_PATH,
      });
    } catch (submissionError) {
      console.error("Ownership Audit submission failed.", submissionError);
      setError("We could not save your audit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const restart = () => {
    setScreen(1);
    setFullName("");
    setVisitorEmail("");
    setRoleTitle("");
    setAnswers({});
    setResult(null);
    setError(null);
  };

  const progressLabel =
    screen === 1
      ? "Step 1 of 3 — About the Audit"
      : screen === 2
        ? "Step 2 of 3 — Visitor Details"
        : screen <= 7
          ? `Step 3 of 3 — Audit Questions (${screen - 2} of 5)`
          : screen === 8
            ? "Step 3 of 3 — Score"
            : screen === 9
              ? "Step 3 of 3 — Results"
              : "Step 3 of 3 — Analytics";

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm font-medium text-gray-500">{progressLabel}</p>
        <h3 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
          Technology Ownership Audit
        </h3>
      </div>

      {screen === 1 && (
        <section className="space-y-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              Ownership Audit - Step 1 Overview
            </p>
            <h4 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
              Evaluate Your Technology Ownership
            </h4>
          </div>
          <p className="leading-7 text-gray-600">
            Evaluate your engineering readiness, source code ownership, infrastructure
            control, and delivery bottlenecks. This 10-question assessment diagnoses
            technical debt, team governance, and security gaps to provide clear
            execution recommendations for your platform.
          </p>
          <Button
            type="button"
            variant="primary"
            onClick={() => setScreen(2)}
            className="bg-[#2563EB] font-bold text-white hover:bg-[#1D4ED8]"
          >
            Start Audit
          </Button>
        </section>
      )}

      {screen === 2 && (
        <section className="space-y-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              Visitor Details
            </p>
            <h4 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
              Tell Us About You
            </h4>
          </div>
          <p className="text-gray-600">
            Enter your details before starting the 10-question Ownership Audit.
          </p>

          <label className="block">
            <span className="text-sm font-semibold text-gray-900">Full Name</span>
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="e.g. John Doe"
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              autoComplete="name"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-gray-900">Work Email</span>
            <input
              type="email"
              value={visitorEmail}
              onChange={(event) => setVisitorEmail(event.target.value)}
              placeholder="e.g. john@company.com"
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              autoComplete="email"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-gray-900">Your Role / Title</span>
            <input
              value={roleTitle}
              onChange={(event) => setRoleTitle(event.target.value)}
              placeholder="e.g. Founder, CTO, Product Lead"
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              autoComplete="organization-title"
              required
            />
          </label>

          {error && <p className="text-sm text-red-600" role="alert">{error}</p>}

          <div className="flex justify-between border-t border-gray-200 pt-5">
            <Button type="button" variant="secondary" onClick={() => setScreen(1)}>
              Back
            </Button>
            <Button type="button" variant="primary" onClick={startAudit}>
              Start Audit
            </Button>
          </div>
        </section>
      )}

      {screen >= 3 && screen <= 7 && (
        <section className="space-y-6">
          {currentQuestions.map((question) => (
            <fieldset key={question.id} className="space-y-3">
              <legend className="text-base font-semibold leading-6 text-gray-900">
                {question.id}. {question.question}
              </legend>
              <p className="text-sm font-medium text-gray-500">{question.title}</p>
              {(Object.entries(question.options) as [AuditOption, string][]).map(([value, label]) => {
                const selected = answers[`q${question.id}`] === value;
                return (
                  <label
                    key={value}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 ${selected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
                  >
                    <input
                      type="radio"
                      name={`q${question.id}`}
                      value={value}
                      checked={selected}
                      onChange={() => setAnswer(question.id, value)}
                      className="mt-1 h-4 w-4"
                    />
                    <span>
                      <span className="font-semibold text-gray-900">{value}</span>
                      <span className="mt-1 block text-sm leading-5 text-gray-600">{label}</span>
                    </span>
                  </label>
                );
              })}
            </fieldset>
          ))}

          {error && <p className="text-sm text-red-600" role="alert">{error}</p>}

          <div className="flex justify-between border-t border-gray-200 pt-5">
            <Button
              type="button"
              variant="secondary"
              disabled={isSubmitting}
              onClick={() => setScreen((value) => value - 1)}
            >
              Back
            </Button>
            {screen < 7 ? (
              <Button
                type="button"
                variant="primary"
                onClick={() => validateQuestions() && setScreen((value) => value + 1)}
              >
                Next
              </Button>
            ) : (
              <Button type="button" variant="primary" disabled={isSubmitting} onClick={completeAudit}>
                {isSubmitting ? "Calculating..." : "Calculate Score"}
              </Button>
            )}
          </div>
        </section>
      )}

      {screen === 8 && result && (
        <section className="space-y-5 text-center">
          <p className="text-sm font-medium text-gray-500">Your Ownership Score</p>
          <p className="text-6xl font-bold text-gray-900">{result.score}<span className="text-xl text-gray-500"> / 100</span></p>
          <p className="text-gray-600">Your score has been calculated from all 10 answers.</p>
          <Button type="button" variant="primary" onClick={() => setScreen(9)}>View Results</Button>
        </section>
      )}

      {screen === 9 && result && (
        <section className="space-y-5">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
            <p className="text-sm font-medium text-gray-500">Maturity Level</p>
            <h4 className="mt-1 text-2xl font-bold text-gray-900">{result.category}</h4>
            <p className="mt-3 text-gray-600">{result.diagnosticResult}</p>
          </div>
          <div className="rounded-xl border border-gray-200 p-5">
            <p className="text-sm font-medium text-gray-500">Recommended Path</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">{result.redirectTarget}</p>
            <a
              href={
                result.redirectTarget === "Deliver My Project"
                  ? "/deliver-my-project"
                  : result.redirectTarget === "Mentor Me"
                    ? "/mentor-me"
                    : "/coffee-with-me"
              }
              onClick={() => {
                const eventName =
                  result.redirectTarget === "Deliver My Project"
                    ? ANALYTICS_EVENTS.DELIVER_MY_PROJECT_CLICKED
                    : result.redirectTarget === "Mentor Me"
                      ? ANALYTICS_EVENTS.MENTOR_ME_CLICKED
                      : ANALYTICS_EVENTS.COFFEE_WITH_ME_CLICKED;

                trackAnalyticsEvent({
                  name: eventName,
                  eventType: "click",
                  path: OWNERSHIP_AUDIT_PATH,
                });
              }}
              className="mt-4 inline-flex rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white"
            >
              Continue to {result.redirectTarget}
            </a>
          </div>
          <div className="flex justify-end border-t border-gray-200 pt-5">
            <Button type="button" variant="primary" onClick={() => setScreen(10)}>Continue</Button>
          </div>
        </section>
      )}

      {screen === 10 && result && (
        <section className="space-y-5">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
            <p className="font-semibold text-gray-900">Analytics Recorded</p>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Your completed Ownership Audit is stored with your score, maturity
              level, answers, and recommended path. The completion event is tracked
              separately from the visitor journey so analytics failures never block
              the result.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="primary" onClick={restart}>Retake Audit</Button>
          </div>
        </section>
      )}
    </div>
  );
}
