import { db } from "@build-me/database/drizzle/client";
import { ownershipAudits } from "@build-me/database/schema/ownership-audits";

export type OwnershipAuditOption = "A" | "B" | "C";

export type CreateOwnershipAuditInput = {
  fullName: string;
  visitorEmail: string;
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

export type OwnershipAuditCategory =
  | "High Risk"
  | "Moderate Control"
  | "Strong Ownership";

export type OwnershipAuditResult = {
  id: string;
  fullName: string;
  visitorEmail: string;
  answers: Record<`q${number}`, OwnershipAuditOption>;
  score: number;
  category: OwnershipAuditCategory;
  diagnosticResult: string;
  redirectTarget: "Deliver My Project" | "Mentor Me" | "Coffee With Me";
  createdAt: string;
};

const SCORE_MAP: Record<OwnershipAuditOption, number> = {
  A: 2,
  B: 5,
  C: 10,
};

function getOutcome(score: number): {
  category: OwnershipAuditCategory;
  diagnosticResult: string;
  redirectTarget: OwnershipAuditResult["redirectTarget"];
} {
  if (score <= 35) {
    return {
      category: "High Risk",
      diagnosticResult:
        "High technical debt, unmanaged assets, critical execution gaps.",
      redirectTarget: "Deliver My Project",
    };
  }

  if (score <= 69) {
    return {
      category: "Moderate Control",
      diagnosticResult:
        "Functional foundation, but lacks automated governance and structure.",
      redirectTarget: "Mentor Me",
    };
  }

  return {
    category: "Strong Ownership",
    diagnosticResult: "Highly mature, automated, and secure architecture.",
    redirectTarget: "Coffee With Me",
  };
}

const questionKeys = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10"] as const;

export function calculateOwnershipAuditScore(
  answers: Record<(typeof questionKeys)[number], OwnershipAuditOption>,
): number {
  return questionKeys.reduce((total, key) => total + SCORE_MAP[answers[key]], 0);
}

export async function createOwnershipAudit(
  input: CreateOwnershipAuditInput,
): Promise<OwnershipAuditResult> {
  const answers = {
    q1: input.q1,
    q2: input.q2,
    q3: input.q3,
    q4: input.q4,
    q5: input.q5,
    q6: input.q6,
    q7: input.q7,
    q8: input.q8,
    q9: input.q9,
    q10: input.q10,
  };

  const score = calculateOwnershipAuditScore(answers);
  const outcome = getOutcome(score);

  const [created] = await db
    .insert(ownershipAudits)
    .values({
      fullName: input.fullName,
      visitorEmail: input.visitorEmail,
      ...answers,
      score,
      category: outcome.category,
      diagnosticResult: outcome.diagnosticResult,
      redirectTarget: outcome.redirectTarget,
      answers,
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

  return {
    id: created.id,
    fullName: created.fullName,
    visitorEmail: created.visitorEmail,
    answers: created.answers as OwnershipAuditResult["answers"],
    score: created.score,
    category: created.category as OwnershipAuditCategory,
    diagnosticResult: created.diagnosticResult,
    redirectTarget: created.redirectTarget as OwnershipAuditResult["redirectTarget"],
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

  return audits.map((audit) => ({
    id: audit.id,
    fullName: audit.fullName,
    visitorEmail: audit.visitorEmail,
    answers: audit.answers as OwnershipAuditResult["answers"],
    score: audit.score,
    category: audit.category as OwnershipAuditCategory,
    diagnosticResult: audit.diagnosticResult,
    redirectTarget: audit.redirectTarget as OwnershipAuditResult["redirectTarget"],
    createdAt: audit.createdAt.toISOString(),
  }));
}
