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
  visitorEmail: string | null;
  answers: OwnershipAuditAnswers | null;
  score: number;
  category: string;
  createdAt: string;
  legacy?: boolean;
  legacySteps?: {
    step1: string;
    step2: string;
    step3: string;
  };
};

const SCORE_MAP: Record<OwnershipAuditOption, number> = {
  A: 2,
  B: 5,
  C: 10,
};

function calculateScore(answers: OwnershipAuditAnswers): number {
  return Object.values(answers).reduce(
    (total, answer) => total + SCORE_MAP[answer],
    0,
  );
}

function getCategory(score: number): string {
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

function getFullName(value: unknown): string {
  if (!value || typeof value !== "object") {
    return "";
  }

  const fullName = (value as Record<string, unknown>).fullName;

  return typeof fullName === "string" ? fullName : "";
}

export async function createOwnershipAudit(
  input: CreateOwnershipAuditInput,
): Promise<OwnershipAuditResult> {
  const score = calculateScore(input.answers);
  const category = getCategory(score);

  const [created] = await db
    .insert(ownershipAudits)
    .values({
      visitorEmail: input.visitorEmail,
      step1: `${input.answers.q1},${input.answers.q2}`,
      step2: `${input.answers.q3},${input.answers.q4},${input.answers.q5},${input.answers.q6}`,
      step3: `${input.answers.q7},${input.answers.q8},${input.answers.q9},${input.answers.q10}`,
      score,
      category,
      answers: {
        fullName: input.fullName,
        ...input.answers,
      },
    })
    .returning({
      id: ownershipAudits.id,
      visitorEmail: ownershipAudits.visitorEmail,
      answers: ownershipAudits.answers,
      score: ownershipAudits.score,
      category: ownershipAudits.category,
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
    fullName: getFullName(created.answers),
    visitorEmail: created.visitorEmail,
    answers,
    score: created.score,
    category: created.category,
    createdAt: created.createdAt.toISOString(),
  };
}

export async function listOwnershipAudits(): Promise<OwnershipAuditResult[]> {
  const audits = await db
    .select({
      id: ownershipAudits.id,
      visitorEmail: ownershipAudits.visitorEmail,
      step1: ownershipAudits.step1,
      step2: ownershipAudits.step2,
      step3: ownershipAudits.step3,
      answers: ownershipAudits.answers,
      score: ownershipAudits.score,
      category: ownershipAudits.category,
      createdAt: ownershipAudits.createdAt,
    })
    .from(ownershipAudits)
    .orderBy(ownershipAudits.createdAt);

  return audits.map((audit) => {
    const answers = getAnswers(audit.answers);

    if (answers) {
      return {
        id: audit.id,
        fullName: getFullName(audit.answers),
        visitorEmail: audit.visitorEmail,
        answers,
        score: audit.score,
        category: audit.category,
        createdAt: audit.createdAt.toISOString(),
      };
    }

    return {
      id: audit.id,
      fullName: "",
      visitorEmail: audit.visitorEmail,
      answers: null,
      score: audit.score,
      category: audit.category,
      createdAt: audit.createdAt.toISOString(),
      legacy: true,
      legacySteps: {
        step1: audit.step1,
        step2: audit.step2,
        step3: audit.step3,
      },
    };
  });
}
