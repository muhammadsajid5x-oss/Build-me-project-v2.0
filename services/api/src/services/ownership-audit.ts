import { db } from "@build-me/database/drizzle/client";
import { ownershipAudits } from "@build-me/database/schema/ownership-audits";
export type OwnershipAuditOption = "A" | "B" | "C";
export type OwnershipAuditAnswers = {
  q1: OwnershipAuditOption;
  q2: OwnershipAuditOption;
  q3: OwnershipAuditOption;
  q4: OwnershipAuditOption;
  q5: OwnershipAuditOption;
  q6: OwnershipAuditOption;
  q7: OwnershipAuditOption;
  q8: OwnershipAuditOption;
  q9: OwnershipAuditOption;
  q10: OwnershipAuditOption;
};
export type CreateOwnershipAuditInput = {
  fullName: string;
  visitorEmail: string;
  answers: OwnershipAuditAnswers;
};
export type OwnershipAuditResult = {
  id: string;
  fullName: string;
  visitorEmail: string;
  answers: OwnershipAuditAnswers;
  score: number;
  category: string;
  diagnosticResult: string;
  redirectTarget: string;
  createdAt: string;
};
const SCORE_MAP: Record<OwnershipAuditOption, number> = {
  A: 2,
  B: 5,
  C: 10,
};
const DIAGNOSTIC_RESULTS = {
  "High Risk":
    "High technical debt, unmanaged assets, critical execution gaps.",
  "Moderate Control":
    "Functional foundation, but lacks automated governance and structure.",
  "Strong Ownership":
    "Highly mature, automated, and secure architecture.",
} as const;
const REDIRECT_TARGETS = {
  "High Risk": "Deliver My Project",
  "Moderate Control": "Mentor Me",
  "Strong Ownership": "Coffee With Me",
} as const;
function calculateScore(answers: OwnershipAuditAnswers): number {
  return Object.values(answers).reduce(
    (total, answer) => total + SCORE_MAP[answer],
    0,
  );
}
function getCategory(score: number): keyof typeof DIAGNOSTIC_RESULTS {
  if (score <= 35) {
    return "High Risk";
  }
  if (score <= 69) {
    return "Moderate Control";
  }
  return "Strong Ownership";
}
function isAuditOption(value: unknown): value is OwnershipAuditOption {
  return value === "A" || value === "B" || value === "C";
}
function getAnswers(value: unknown): OwnershipAuditAnswers | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const answers = value as Record<string, unknown>;
  const keys = [
    "q1",
    "q2",
    "q3",
    "q4",
    "q5",
    "q6",
    "q7",
    "q8",
    "q9",
    "q10",
  ] as const;
  if (!keys.every((key) => isAuditOption(answers[key]))) {
    return null;
  }
  return {
    q1: answers.q1 as OwnershipAuditOption,
    q2: answers.q2 as OwnershipAuditOption,
    q3: answers.q3 as OwnershipAuditOption,
    q4: answers.q4 as OwnershipAuditOption,
    q5: answers.q5 as OwnershipAuditOption,
    q6: answers.q6 as OwnershipAuditOption,
    q7: answers.q7 as OwnershipAuditOption,
    q8: answers.q8 as OwnershipAuditOption,
    q9: answers.q9 as OwnershipAuditOption,
    q10: answers.q10 as OwnershipAuditOption,
  };
}
export async function createOwnershipAudit(
  input: CreateOwnershipAuditInput,
): Promise<OwnershipAuditResult> {
  const score = calculateScore(input.answers);
  const category = getCategory(score);
  const diagnosticResult = DIAGNOSTIC_RESULTS[category];
  const redirectTarget = REDIRECT_TARGETS[category];
  const [created] = await db
    .insert(ownershipAudits)
    .values({
      fullName: input.fullName,
      visitorEmail: input.visitorEmail,
      q1: input.answers.q1,
      q2: input.answers.q2,
      q3: input.answers.q3,
      q4: input.answers.q4,
      q5: input.answers.q5,
      q6: input.answers.q6,
      q7: input.answers.q7,
      q8: input.answers.q8,
      q9: input.answers.q9,
      q10: input.answers.q10,
      score,
      category,
      diagnosticResult,
      redirectTarget,
      answers: input.answers,
    })
    .returning({
      id: ownershipAudits.id,
      fullName: ownershipAudits.fullName,
      visitorEmail: ownershipAudits.visitorEmail,
      q1: ownershipAudits.q1,
      q2: ownershipAudits.q2,
      q3: ownershipAudits.q3,
      q4: ownershipAudits.q4,
      q5: ownershipAudits.q5,
      q6: ownershipAudits.q6,
      q7: ownershipAudits.q7,
      q8: ownershipAudits.q8,
      q9: ownershipAudits.q9,
      q10: ownershipAudits.q10,
      score: ownershipAudits.score,
      category: ownershipAudits.category,
      diagnosticResult: ownershipAudits.diagnosticResult,
      redirectTarget: ownershipAudits.redirectTarget,
      answers: ownershipAudits.answers,
      createdAt: ownershipAudits.createdAt,
    });
  if (!created) {
    throw new Error("Failed to persist the Ownership Audit.");
  }
  const answers = getAnswers(created.answers);
  if (!answers) {
    throw new Error("Failed to read the newly created Ownership Audit.");
  }
  return {
    id: created.id,
    fullName: created.fullName,
    visitorEmail: created.visitorEmail,
    answers,
    score: created.score,
    category: created.category,
    diagnosticResult: created.diagnosticResult,
    redirectTarget: created.redirectTarget,
    createdAt: created.createdAt.toISOString(),
  };
}
export async function listOwnershipAudits(): Promise<OwnershipAuditResult[]> {
  const audits = await db
    .select({
      id: ownershipAudits.id,
      fullName: ownershipAudits.fullName,
      visitorEmail: ownershipAudits.visitorEmail,
      q1: ownershipAudits.q1,
      q2: ownershipAudits.q2,
      q3: ownershipAudits.q3,
      q4: ownershipAudits.q4,
      q5: ownershipAudits.q5,
      q6: ownershipAudits.q6,
      q7: ownershipAudits.q7,
      q8: ownershipAudits.q8,
      q9: ownershipAudits.q9,
      q10: ownershipAudits.q10,
      score: ownershipAudits.score,
      category: ownershipAudits.category,
      diagnosticResult: ownershipAudits.diagnosticResult,
      redirectTarget: ownershipAudits.redirectTarget,
      answers: ownershipAudits.answers,
      createdAt: ownershipAudits.createdAt,
    })
    .from(ownershipAudits)
    .orderBy(ownershipAudits.createdAt);
  return audits.map((audit) => {
    const answers =
      getAnswers(audit.answers) ??
      ({
        q1: audit.q1 as OwnershipAuditOption,
        q2: audit.q2 as OwnershipAuditOption,
        q3: audit.q3 as OwnershipAuditOption,
        q4: audit.q4 as OwnershipAuditOption,
        q5: audit.q5 as OwnershipAuditOption,
        q6: audit.q6 as OwnershipAuditOption,
        q7: audit.q7 as OwnershipAuditOption,
        q8: audit.q8 as OwnershipAuditOption,
        q9: audit.q9 as OwnershipAuditOption,
        q10: audit.q10 as OwnershipAuditOption,
      } satisfies OwnershipAuditAnswers);
    return {
      id: audit.id,
      fullName: audit.fullName,
      visitorEmail: audit.visitorEmail,
      answers,
      score: audit.score,
      category: audit.category,
      diagnosticResult: audit.diagnosticResult,
      redirectTarget: audit.redirectTarget,
      createdAt: audit.createdAt.toISOString(),
    };
  });
}
