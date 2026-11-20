import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ANALYTICS_EVENTS, trackAnalyticsEvent } from "../analytics";
import { getApiBaseUrl } from "../api-url";

type AuditOption = "A" | "B" | "C";

type AuditStage =
  | "intro"
  | "details"
  | "questions"
  | "results"
  | "next-steps"
  | "help";

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
  summary: string;
  cta: string;
  ctaEvent:
    | typeof ANALYTICS_EVENTS.DELIVER_MY_PROJECT_CLICKED
    | typeof ANALYTICS_EVENTS.MENTOR_ME_CLICKED
    | typeof ANALYTICS_EVENTS.COFFEE_WITH_ME_CLICKED;
  href: string;
};

type SwotItem = {
  label: string;
  text: string;
};

const apiBaseUrl = getApiBaseUrl(import.meta.env.VITE_API_URL);
const OWNERSHIP_AUDIT_PATH = "/ownership-audits";

const SCORE_MAP: Record<AuditOption, number> = {
  A: 0,
  B: 5,
  C: 10,
};

const questions: Question[] = [
  {
    number: 1,
    title: "Business & Technology Readiness",
    question:
      "How confident are you that your technology can support your business right now?",
    options: [
      {
        value: "A",
        label:
          "Not confident — we regularly face technology problems, delays, or unexpected issues.",
      },
      {
        value: "B",
        label:
          "Somewhat confident — things work, but we still depend heavily on people or manual work.",
      },
      {
        value: "C",
        label:
          "Very confident — our technology is organised and ready to support business growth.",
      },
    ],
  },
  {
    number: 2,
    title: "Technology Setup",
    question:
      "How well do you understand and control the technology your business depends on?",
    options: [
      {
        value: "A",
        label:
          "We are unsure what we have, where it is hosted, or who manages it.",
      },
      {
        value: "B",
        label:
          "We know the main systems, but some areas depend on individual people or suppliers.",
      },
      {
        value: "C",
        label:
          "We have a clear view of our important systems, accounts, and responsibilities.",
      },
    ],
  },
  {
    number: 3,
    title: "Ownership & Access",
    question:
      "Who controls the important technology accounts your business relies on?",
    options: [
      {
        value: "A",
        label:
          "Important accounts may belong to individuals, former team members, or suppliers.",
      },
      {
        value: "B",
        label:
          "Most accounts are controlled centrally, but access is still managed manually.",
      },
      {
        value: "C",
        label:
          "The business owns the important accounts and access is clearly controlled.",
      },
    ],
  },
  {
    number: 4,
    title: "People & Responsibility",
    question:
      "If your main technology person became unavailable tomorrow, what would happen?",
    options: [
      {
        value: "A",
        label:
          "We would struggle to understand, maintain, or change important systems.",
      },
      {
        value: "B",
        label:
          "Someone else could help, but they would need time to understand the setup.",
      },
      {
        value: "C",
        label:
          "Responsibilities and information are clear enough for someone else to take over.",
      },
    ],
  },
  {
    number: 5,
    title: "Quality & Reliability",
    question:
      "How confident are you that changes to your technology will work as expected?",
    options: [
      {
        value: "A",
        label: "Problems are often discovered after changes are released.",
      },
      {
        value: "B",
        label:
          "We check changes before release, but the process is mostly manual.",
      },
      {
        value: "C",
        label:
          "We have a repeatable way to check important changes before they go live.",
      },
    ],
  },
  {
    number: 6,
    title: "Data & Recovery",
    question:
      "If something important stopped working or data was lost, how prepared are you?",
    options: [
      {
        value: "A",
        label:
          "We are not sure how quickly we could recover or whether everything is backed up.",
      },
      {
        value: "B",
        label: "Backups exist, but recovery has not been regularly checked.",
      },
      {
        value: "C",
        label:
          "Backups and recovery responsibilities are clear and regularly checked.",
      },
    ],
  },
  {
    number: 7,
    title: "Documentation & Knowledge",
    question:
      "How easy would it be for a new person to understand your technology?",
    options: [
      {
        value: "A",
        label: "Most of the important knowledge is in people's heads.",
      },
      {
        value: "B",
        label:
          "We have some guides, but important information is still difficult to find.",
      },
      {
        value: "C",
        label:
          "Important systems, processes, and responsibilities are documented clearly.",
      },
    ],
  },
  {
    number: 8,
    title: "Change & Growth",
    question:
      "How prepared is your technology for your next stage of business growth?",
    options: [
      {
        value: "A",
        label:
          "Growth could expose major technology problems or create more manual work.",
      },
      {
        value: "B",
        label:
          "We can grow, but some parts of the technology need attention first.",
      },
      {
        value: "C",
        label:
          "Our technology is structured to support the growth we are planning.",
      },
    ],
  },
  {
    number: 9,
    title: "Security & Protection",
    question:
      "How confident are you that your business technology is protected?",
    options: [
      {
        value: "A",
        label: "We are unsure where our biggest technology risks are.",
      },
      {
        value: "B",
        label:
          "We have basic protections, but security is mostly handled when problems appear.",
      },
      {
        value: "C",
        label:
          "Security responsibilities and basic protections are part of our normal process.",
      },
    ],
  },
  {
    number: 10,
    title: "Technology Direction",
    question:
      "How clear are you about what your technology needs to achieve for the business?",
    options: [
      {
        value: "A",
        label: "We mainly react to problems and urgent requests.",
      },
      {
        value: "B",
        label:
          "We have priorities, but technology decisions are not always connected to business goals.",
      },
      {
        value: "C",
        label:
          "Technology decisions are clearly connected to business goals and priorities.",
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
      category: "Needs Attention",
      summary:
        "Your business has important technology ownership gaps that could create delays, risk, or unnecessary dependency on individuals.",
      cta: "Deliver My Project",
      ctaEvent: ANALYTICS_EVENTS.DELIVER_MY_PROJECT_CLICKED,
      href: "/deliver-my-project",
    };
  }

  if (score <= 69) {
    return {
      category: "Growing Control",
      summary:
        "You have a useful foundation, but a few ownership gaps could make growth, change, and problem-solving harder than they need to be.",
      cta: "Mentor Me",
      ctaEvent: ANALYTICS_EVENTS.MENTOR_ME_CLICKED,
      href: "/mentor-me",
    };
  }

  return {
    category: "Strong Ownership",
    summary:
      "Your business shows strong technology ownership. The next opportunity is to keep improving and prepare your systems for future growth.",
    cta: "Coffee With Me",
    ctaEvent: ANALYTICS_EVENTS.COFFEE_WITH_ME_CLICKED,
    href: "/coffee-with-me",
  };
}

function getSwotItems(
  currentAnswers: Answers,
): Record<
  "strengths" | "weaknesses" | "opportunities" | "threats",
  SwotItem[]
> {
  const strengths: SwotItem[] = [];
  const weaknesses: SwotItem[] = [];
  const opportunities: SwotItem[] = [];
  const threats: SwotItem[] = [];

  questions.forEach((question) => {
    const answer = currentAnswers[question.number];

    if (answer === "C") {
      strengths.push({
        label: question.title,
        text: "You have a strong foundation in this area.",
      });
    }

    if (answer === "A") {
      weaknesses.push({
        label: question.title,
        text: "This area needs clearer ownership or a more reliable process.",
      });

      threats.push({
        label: question.title,
        text: "Leaving this area unresolved could create avoidable business risk.",
      });
    }

    if (answer === "B") {
      opportunities.push({
        label: question.title,
        text: "A small improvement here could make your technology easier to manage.",
      });
    }
  });

  if (strengths.length === 0) {
    strengths.push({
      label: "Foundation",
      text: "Your audit gives you a clear starting point for improvement.",
    });
  }

  if (weaknesses.length === 0) {
    weaknesses.push({
      label: "No major gaps identified",
      text: "Your answers did not highlight a major weakness.",
    });
  }

  if (opportunities.length === 0) {
    opportunities.push({
      label: "Continuous improvement",
      text: "Keep reviewing ownership as your business grows.",
    });
  }

  if (threats.length === 0) {
    threats.push({
      label: "Maintain your standard",
      text: "Continue protecting the strong ownership you already have.",
    });
  }

  return {
    strengths,
    weaknesses,
    opportunities,
    threats,
  };
}

export default function TechnologyOwnershipAudit() {
  const navigate = useNavigate();
  const auditRef = useRef<HTMLDivElement>(null);

  const [stage, setStage] = useState<AuditStage>("intro");
  const [questionNumber, setQuestionNumber] = useState(1);

  const [fullName, setFullName] = useState("");
  const [visitorEmail, setVisitorEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [website, setWebsite] = useState("");

  const [answers, setAnswers] = useState<Answers>(createInitialAnswers);
  const [score, setScore] = useState<number | null>(null);

  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFullResults, setShowFullResults] = useState(false);

  useEffect(() => {
    trackAnalyticsEvent({
      name: ANALYTICS_EVENTS.OWNERSHIP_AUDIT_VIEWED,
      eventType: "view",
      path: OWNERSHIP_AUDIT_PATH,
    });
  }, []);

  const currentQuestion = questions[questionNumber - 1];

  const result = useMemo(
    () => (score !== null ? getAuditResult(score) : null),
    [score],
  );

  const swot = useMemo(() => getSwotItems(answers), [answers]);

  const scrollToTop = () => {
    auditRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
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

    if (website.trim() && !/^https?:\/\/.+/i.test(website.trim())) {
      setValidationError(
        "Please enter a website starting with http:// or https://.",
      );
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
          organization: organization.trim(),
          website: website.trim() || null,
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
      setShowFullResults(false);
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

  const handleStartAudit = () => {
    setValidationError(null);
    setSubmitError(null);
    setStage("details");
    scrollToTop();
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
      window.setTimeout(scrollToTop, 50);
      return;
    }
  };

  const handleSubmitFinalQuestion = () => {
    if (answers[questions.length] === null || isSubmitting) {
      setValidationError("Please select an answer before continuing.");
      return;
    }

    void submitAudit(answers);
  };

  const handlePrevious = () => {
    if (isSubmitting) {
      return;
    }

    setValidationError(null);
    setSubmitError(null);

    if (stage === "details") {
      setStage("intro");
      scrollToTop();
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
      setQuestionNumber(questions.length);
      scrollToTop();
      return;
    }

    if (stage === "next-steps") {
      setStage("results");
      scrollToTop();
      return;
    }

    if (stage === "help") {
      setStage("next-steps");
      scrollToTop();
    }
  };

  const handleViewFullResults = () => {
    setShowFullResults(true);
    window.setTimeout(scrollToTop, 50);
  };

  const handleDownloadResults = () => {
    if (score === null || !result) {
      return;
    }

    const sections = [
      `Technology Ownership Audit Results`,
      `Name: ${fullName}`,
      `Organization: ${organization}`,
      `Score: ${score}/100`,
      `Category: ${result.category}`,
      "",
      "Summary",
      result.summary,
      "",
      "Strengths",
      ...swot.strengths.map((item) => `- ${item.label}: ${item.text}`),
      "",
      "Weaknesses",
      ...swot.weaknesses.map((item) => `- ${item.label}: ${item.text}`),
      "",
      "Opportunities",
      ...swot.opportunities.map((item) => `- ${item.label}: ${item.text}`),
      "",
      "Threats",
      ...swot.threats.map((item) => `- ${item.label}: ${item.text}`),
      "",
      "Recommended Next Step",
      result.cta,
    ];

    const blob = new Blob([sections.join("\n")], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "technology-ownership-audit-results.txt";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);
  };

  const handleRestart = () => {
    setStage("intro");
    setQuestionNumber(1);
    setFullName("");
    setVisitorEmail("");
    setOrganization("");
    setWebsite("");
    setAnswers(createInitialAnswers());
    setScore(null);
    setValidationError(null);
    setSubmitError(null);
    setIsSubmitting(false);
    setShowFullResults(false);
    scrollToTop();
  };

  const primaryButtonClass =
    "inline-flex items-center justify-center rounded-lg bg-[#0052FF] px-5 py-3 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  const secondaryButtonClass =
    "inline-flex items-center justify-center rounded-lg border-2 border-[#0052FF] bg-white px-5 py-3 font-semibold text-[#0052FF] transition hover:bg-[#EBF3FE] focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  const tabClass = (active: boolean) =>
    [
      "rounded-lg px-3 py-2 text-sm font-semibold transition sm:px-5",
      active ? "bg-[#0052FF] text-white" : "bg-white text-[#0052FF]",
    ].join(" ");

  if (stage === "intro") {
    return (
      <div
        ref={auditRef}
        className="w-full rounded-2xl bg-[#EBF3FE] p-6 sm:p-8"
      >
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-bold uppercase tracking-wide text-[#0052FF]">
            Technology Ownership Audit
          </p>

          <h3 className="mt-3 text-3xl font-bold text-black sm:text-4xl">
            Find out how well your technology supports your business.
          </h3>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-black">
            Answer 10 simple questions to understand where you are strong, where
            you have gaps, and what you can improve next.
          </p>

          <div className="mt-8 grid gap-4 text-left sm:grid-cols-3">
            {[
              ["01", "Answer", "Tell us how things work today."],
              ["02", "Understand", "See your strengths and gaps."],
              ["03", "Act", "Get practical next steps."],
            ].map(([number, title, text]) => (
              <div
                key={number}
                className="rounded-xl border-2 border-white bg-white p-5"
              >
                <span className="text-sm font-bold text-[#0052FF]">
                  {number}
                </span>

                <h4 className="mt-2 font-bold text-black">{title}</h4>

                <p className="mt-1 text-sm leading-6 text-black">{text}</p>
              </div>
            ))}
          </div>

          <button
            type="button"
            className={`mt-8 ${primaryButtonClass}`}
            onClick={handleStartAudit}
          >
            Start the Audit
          </button>
        </div>
      </div>
    );
  }

  if (stage === "details") {
    return (
      <div
        ref={auditRef}
        className="w-full rounded-2xl bg-[#EBF3FE] p-6 sm:p-8"
      >
        <div className="w-full">
          <div className="flex flex-wrap gap-2 rounded-xl bg-white p-2">
            <div className={tabClass(false)}>Part 1 · Intro</div>
            <div className={tabClass(true)}>Part 2 · Details</div>
            <div className={tabClass(false)}>Part 3 · Audit</div>
          </div>

          <div className="mt-8">
            <p className="text-sm font-bold uppercase tracking-wide text-[#0052FF]">
              Part 2 of 3
            </p>

            <h3 className="mt-2 text-2xl font-bold text-black sm:text-3xl">
              Start the Audit
            </h3>

            <p className="mt-3 max-w-2xl leading-7 text-black">
              These details help us show your audit results in the context of
              your business and technology ownership.
            </p>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-black">
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
                className="w-full rounded-lg border-2 border-white bg-white px-4 py-3 text-black outline-none transition focus:border-[#0052FF]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-black">
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
                className="w-full rounded-lg border-2 border-white bg-white px-4 py-3 text-black outline-none transition focus:border-[#0052FF]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-black">
                Organization <span className="font-normal">(optional)</span>
              </span>

              <input
                type="text"
                value={organization}
                onChange={(event) => {
                  setOrganization(event.target.value);
                  setValidationError(null);
                }}
                autoComplete="organization"
                className="w-full rounded-lg border-2 border-white bg-white px-4 py-3 text-black outline-none transition focus:border-[#0052FF]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-black">
                Website <span className="font-normal">(optional)</span>
              </span>

              <input
                type="url"
                value={website}
                onChange={(event) => {
                  setWebsite(event.target.value);
                  setValidationError(null);
                }}
                placeholder="https://example.com"
                autoComplete="url"
                className="w-full rounded-lg border-2 border-white bg-white px-4 py-3 text-black outline-none transition focus:border-[#0052FF]"
              />
            </label>
          </div>

          {validationError && (
            <p className="mt-5 text-sm font-semibold text-black" role="alert">
              {validationError}
            </p>
          )}

          <div className="mt-8 flex flex-col gap-3 border-t-2 border-white pt-6 sm:flex-row sm:justify-between">
            <button
              type="button"
              className={secondaryButtonClass}
              onClick={handlePrevious}
            >
              Back
            </button>

            <button
              type="button"
              className={primaryButtonClass}
              onClick={handleDetailsContinue}
            >
              Start the Audit
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === "questions") {
    const progress = (questionNumber / questions.length) * 100;
    const isLastQuestion = questionNumber === questions.length;

    return (
      <div
        ref={auditRef}
        className="w-full rounded-2xl bg-[#EBF3FE] p-5 sm:p-8"
      >
        <div className="w-full">
          <div className="flex flex-wrap gap-2 rounded-xl bg-white p-2">
            <div className={tabClass(false)}>Part 1 · Intro</div>
            <div className={tabClass(false)}>Part 2 · Details</div>
            <div className={tabClass(true)}>Part 3 · Audit</div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-bold text-[#0052FF]">
                Question {questionNumber} of {questions.length}
              </p>

              <p className="text-sm font-semibold text-black">
                {Math.round(progress)}%
              </p>
            </div>

            <div
              className="mt-2 h-2 overflow-hidden rounded-full bg-white"
              aria-hidden="true"
            >
              <div
                className="h-full rounded-full bg-[#0052FF] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <fieldset className="mt-6">
            <legend className="w-full">
              <p className="text-sm font-bold uppercase tracking-wide text-[#0052FF]">
                {currentQuestion.title}
              </p>

              <h3 className="mt-2 max-w-4xl text-2xl font-bold leading-9 text-black sm:text-3xl">
                {currentQuestion.question}
              </h3>
            </legend>

            <div className="mt-5 grid gap-3">
              {currentQuestion.options.map((option) => {
                const selectedAnswer = answers[currentQuestion.number];
                const isSelected = selectedAnswer === option.value;

                return (
                  <label
                    key={option.value}
                    className={[
                      "flex cursor-pointer items-center rounded-xl border-2 bg-white px-4 py-3 transition",
                      isSelected
                        ? "border-[#0052FF] bg-[#EBF3FE]"
                        : "border-white hover:border-[#0052FF]",
                    ].join(" ")}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.number}`}
                      value={option.value}
                      checked={isSelected}
                      onChange={() => handleAnswer(option.value)}
                      disabled={isSubmitting}
                      className="sr-only"
                    />

                    <span
                      className={[
                        "mr-3 h-4 w-4 shrink-0 rounded-full border-2",
                        isSelected
                          ? "border-[#0052FF] bg-[#0052FF]"
                          : "border-[#0052FF] bg-white",
                      ].join(" ")}
                      aria-hidden="true"
                    />

                    <span className="text-sm font-medium leading-6 text-black">
                      {option.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {validationError && (
            <p className="mt-4 text-sm font-semibold text-black" role="alert">
              {validationError}
            </p>
          )}

          {submitError && (
            <p className="mt-4 text-sm font-semibold text-black" role="alert">
              {submitError}
            </p>
          )}

          <div className="mt-6 flex flex-col gap-3 border-t-2 border-white pt-5 sm:flex-row sm:justify-between">
            <button
              type="button"
              className={secondaryButtonClass}
              onClick={handlePrevious}
              disabled={isSubmitting}
            >
              Back
            </button>

            {isLastQuestion && (
              <button
                type="button"
                className={primaryButtonClass}
                onClick={handleSubmitFinalQuestion}
                disabled={isSubmitting || answers[questionNumber] === null}
              >
                {isSubmitting ? "Preparing Results..." : "See My Results"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (stage === "results") {
    return (
      <div
        ref={auditRef}
        className="w-full rounded-2xl bg-[#EBF3FE] p-5 sm:p-8"
      >
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold uppercase tracking-wide text-[#0052FF]">
              Step 5 of 7 · Results
            </p>

            <button
              type="button"
              className="text-sm font-semibold text-[#0052FF] underline underline-offset-4"
              onClick={handleRestart}
            >
              Start Again
            </button>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-2xl bg-[#0052FF] p-7 text-white sm:p-8">
              <p className="text-sm font-semibold">Your Score</p>

              <p className="mt-2 text-6xl font-bold">{score}</p>

              <p className="mt-1 text-sm font-semibold">out of 100</p>

              <div className="mt-7 border-t border-white/30 pt-6">
                <p className="text-sm font-semibold">Your Position</p>

                <h3 className="mt-2 text-2xl font-bold">{result?.category}</h3>

                <p className="mt-3 text-sm leading-6">{result?.summary}</p>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-7 sm:p-8">
              <p className="text-sm font-bold uppercase tracking-wide text-[#0052FF]">
                What your score means
              </p>

              <p className="mt-3 text-lg font-bold text-black">
                Your score is only the starting point.
              </p>

              <p className="mt-2 leading-7 text-black">
                The useful part is understanding what is working, what needs
                attention, and what you can improve next.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  ["Strengths", swot.strengths.length],
                  ["Weaknesses", swot.weaknesses.length],
                  ["Opportunities", swot.opportunities.length],
                  ["Threats", swot.threats.length],
                ].map(([label, count]) => (
                  <div key={label} className="rounded-xl bg-[#EBF3FE] p-4">
                    <p className="text-sm font-bold text-[#0052FF]">{label}</p>
                    <p className="mt-1 text-sm font-semibold text-black">
                      {count} area{count === 1 ? "" : "s"} identified
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {showFullResults && (
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {(
                [
                  ["Strengths", swot.strengths],
                  ["Weaknesses", swot.weaknesses],
                  ["Opportunities", swot.opportunities],
                  ["Threats", swot.threats],
                ] as const
              ).map(([title, items]) => (
                <section key={title} className="rounded-2xl bg-white p-6">
                  <h4 className="text-xl font-bold text-[#0052FF]">{title}</h4>

                  <div className="mt-4 space-y-3">
                    {items.map((item) => (
                      <div
                        key={`${title}-${item.label}`}
                        className="rounded-xl bg-[#EBF3FE] p-4"
                      >
                        <p className="font-bold text-black">{item.label}</p>
                        <p className="mt-1 text-sm leading-6 text-black">
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}

          <div className="mt-7 flex flex-col gap-3 border-t-2 border-white pt-6 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              className={secondaryButtonClass}
              onClick={handleViewFullResults}
            >
              {showFullResults ? "Full Results Shown" : "View Full Results"}
            </button>

            <button
              type="button"
              className={secondaryButtonClass}
              onClick={handleDownloadResults}
            >
              Download Results
            </button>

            <button
              type="button"
              className={primaryButtonClass}
              onClick={() => {
                setStage("next-steps");
                scrollToTop();
              }}
            >
              Next Steps
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === "next-steps") {
    return (
      <div
        ref={auditRef}
        className="w-full rounded-2xl bg-[#EBF3FE] p-5 sm:p-8"
      >
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-bold uppercase tracking-wide text-[#0052FF]">
            Step 6 of 7 · Next Steps
          </p>

          <h3 className="mt-2 text-3xl font-bold text-black">
            Turn your audit into action.
          </h3>

          <p className="mt-3 max-w-3xl leading-7 text-black">
            You do not need to fix everything at once. Start with the areas that
            create the biggest business risk or opportunity.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[
              [
                "01",
                "Clarify ownership",
                "Make sure your business owns the important systems and accounts.",
              ],
              [
                "02",
                "Reduce dependency",
                "Capture the information people need to keep your technology moving.",
              ],
              [
                "03",
                "Improve reliability",
                "Create simple checks before important changes go live.",
              ],
              [
                "04",
                "Prepare for growth",
                "Make technology decisions around where the business is going next.",
              ],
            ].map(([number, title, text]) => (
              <div key={number} className="rounded-2xl bg-white p-6">
                <span className="text-sm font-bold text-[#0052FF]">
                  {number}
                </span>

                <h4 className="mt-3 text-lg font-bold text-black">{title}</h4>

                <p className="mt-2 text-sm leading-6 text-black">{text}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t-2 border-white pt-6 sm:flex-row sm:justify-between">
            <button
              type="button"
              className={secondaryButtonClass}
              onClick={handlePrevious}
            >
              Back to Results
            </button>

            <button
              type="button"
              className={primaryButtonClass}
              onClick={() => {
                setStage("help");
                scrollToTop();
              }}
            >
              How I Can Help
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={auditRef} className="w-full rounded-2xl bg-[#EBF3FE] p-5 sm:p-8">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-bold uppercase tracking-wide text-[#0052FF]">
          Step 7 of 7 · How I Can Help
        </p>

        <h3 className="mt-2 text-3xl font-bold text-black">
          Choose the kind of support that makes sense for you.
        </h3>

        <p className="mt-3 max-w-3xl leading-7 text-black">
          Your audit is useful on its own. If you want help going further,
          choose the option that fits your situation.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Deliver My Project",
              description:
                "Get practical help taking a technology project from idea to delivery.",
              href: "/deliver-my-project",
              event: ANALYTICS_EVENTS.DELIVER_MY_PROJECT_CLICKED,
            },
            {
              title: "Mentor Me",
              description:
                "Get guidance to improve your technology decisions, processes, and ownership.",
              href: "/mentor-me",
              event: ANALYTICS_EVENTS.MENTOR_ME_CLICKED,
            },
            {
              title: "Coffee With Me",
              description:
                "Have a focused conversation about your technology situation and next move.",
              href: "/coffee-with-me",
              event: ANALYTICS_EVENTS.COFFEE_WITH_ME_CLICKED,
            },
          ].map((option) => (
            <div
              key={option.title}
              className="flex flex-col rounded-2xl bg-white p-6"
            >
              <h4 className="text-xl font-bold text-[#0052FF]">
                {option.title}
              </h4>

              <p className="mt-3 flex-1 text-sm leading-6 text-black">
                {option.description}
              </p>

              <button
                type="button"
                className={`mt-6 ${primaryButtonClass}`}
                onClick={() => {
                  trackAnalyticsEvent({
                    name: option.event,
                    eventType: "click",
                    path: OWNERSHIP_AUDIT_PATH,
                  });

                  navigate(option.href);
                }}
              >
                {option.title}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-between border-t-2 border-white pt-6">
          <button
            type="button"
            className={secondaryButtonClass}
            onClick={handlePrevious}
          >
            Back
          </button>

          <button
            type="button"
            className={secondaryButtonClass}
            onClick={handleRestart}
          >
            Retake Audit
          </button>
        </div>
      </div>
    </div>
  );
}
