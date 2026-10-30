import { db } from "@build-me/database/drizzle/client";
import { ownershipAudits } from "@build-me/database/schema/ownership-audits";

export type OwnershipAuditOption = "A" | "B" | "C";

export type CreateOwnershipAuditInput = {
  step1: OwnershipAuditOption;
  step2: OwnershipAuditOption;
  step3: OwnershipAuditOption;
  visitorEmail?: string;
};

export type OwnershipAuditResult = {
  id: string;
  step1: OwnershipAuditOption;
  step2: OwnershipAuditOption;
  step3: OwnershipAuditOption;
  score: number;
  category: string;
  visitorEmail: string | null;
  createdAt: string;
};

const SCORE_MAP: Record<OwnershipAuditOption, number> = {
  A: 1,
  B: 3,
  C: 5,
};

function getCategory(score: number): string {
  if (score <= 6) {
    return "High Risk";
  }

  if (score <= 11) {
    return "Moderate Control";
  }

  return "Strong Ownership";
}

export async function createOwnershipAudit(
  input: CreateOwnershipAuditInput,
): Promise<OwnershipAuditResult> {
  const score =
    SCORE_MAP[input.step1] + SCORE_MAP[input.step2] + SCORE_MAP[input.step3];

  const category = getCategory(score);

  const [created] = await db
    .insert(ownershipAudits)
    .values({
      step1: input.step1,
      step2: input.step2,
      step3: input.step3,
      score,
      category,
      visitorEmail: input.visitorEmail ?? null,
      answers: {
        step1: input.step1,
        step2: input.step2,
        step3: input.step3,
      },
    })
    .returning({
      id: ownershipAudits.id,
      step1: ownershipAudits.step1,
      step2: ownershipAudits.step2,
      step3: ownershipAudits.step3,
      score: ownershipAudits.score,
      category: ownershipAudits.category,
      createdAt: ownershipAudits.createdAt,
      visitorEmail: ownershipAudits.visitorEmail,
    });

  if (!created) {
    throw new Error("Failed to persist the Ownership Audit.");
  }

  return {
    id: created.id,
    step1: created.step1 as OwnershipAuditOption,
    step2: created.step2 as OwnershipAuditOption,
    step3: created.step3 as OwnershipAuditOption,
    score: created.score,
    category: created.category,
    createdAt: created.createdAt.toISOString(),
    visitorEmail: created.visitorEmail,
  };
}

export async function listOwnershipAudits(): Promise<OwnershipAuditResult[]> {
  const audits = await db
    .select({
      id: ownershipAudits.id,
      step1: ownershipAudits.step1,
      step2: ownershipAudits.step2,
      step3: ownershipAudits.step3,
      score: ownershipAudits.score,
      category: ownershipAudits.category,
      createdAt: ownershipAudits.createdAt,
      visitorEmail: ownershipAudits.visitorEmail,
    })
    .from(ownershipAudits)
    .orderBy(ownershipAudits.createdAt);

  return audits.map((audit) => ({
    id: audit.id,
    step1: audit.step1 as OwnershipAuditOption,
    step2: audit.step2 as OwnershipAuditOption,
    step3: audit.step3 as OwnershipAuditOption,
    score: audit.score,
    category: audit.category,
    createdAt: audit.createdAt.toISOString(),
    visitorEmail: audit.visitorEmail,
  }));
}
