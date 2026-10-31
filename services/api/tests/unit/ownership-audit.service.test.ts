import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const inserted = {
    id: "77777777-7777-7777-7777-777777777777",
    fullName: "Ada Lovelace",
    visitorEmail: "ada@example.com",
    q1: "A", q2: "A", q3: "A", q4: "A", q5: "A",
    q6: "B", q7: "B", q8: "B", q9: "B", q10: "B",
    score: 35,
    category: "High Risk",
    diagnosticResult: "High technical debt, unmanaged assets, critical execution gaps.",
    redirectTarget: "Deliver My Project",
    answers: {
      q1: "A", q2: "A", q3: "A", q4: "A", q5: "A",
      q6: "B", q7: "B", q8: "B", q9: "B", q10: "B",
    },
    createdAt: new Date("2026-11-01T10:00:00.000Z"),
  };

  const insertValues = vi.fn();
  const insertReturning = vi.fn(() => Promise.resolve([inserted]));
  const insertChain = {
    values: vi.fn((values: unknown) => {
      insertValues(values);
      return { returning: insertReturning };
    }),
  };

  return {
    inserted,
    insertValues,
    insertReturning,
    db: { insert: vi.fn(() => insertChain) },
  };
});

vi.mock("../../../../database/dist/drizzle/client.js", () => ({ db: mocks.db }));

vi.mock("../../../../database/dist/schema/ownership-audits.js", () => ({
  ownershipAudits: {
    id: "id",
    fullName: "full_name",
    visitorEmail: "visitor_email",
    q1: "q1", q2: "q2", q3: "q3", q4: "q4", q5: "q5",
    q6: "q6", q7: "q7", q8: "q8", q9: "q9", q10: "q10",
    score: "score",
    category: "category",
    diagnosticResult: "diagnostic_result",
    redirectTarget: "redirect_target",
    answers: "answers",
    createdAt: "created_at",
  },
}));

import {
  calculateOwnershipAuditScore,
  createOwnershipAudit,
} from "../../src/services/ownership-audit.js";

const baseAnswers = {
  q1: "A" as const, q2: "A" as const, q3: "A" as const, q4: "A" as const, q5: "A" as const,
  q6: "B" as const, q7: "B" as const, q8: "B" as const, q9: "B" as const, q10: "B" as const,
};

describe("Ownership Audit scoring", () => {
  beforeEach(() => vi.clearAllMocks());

  it("uses A=2, B=5, C=10", () => {
    expect(calculateOwnershipAuditScore(baseAnswers)).toBe(35);
    expect(calculateOwnershipAuditScore({
      q1:"C",q2:"C",q3:"C",q4:"C",q5:"C",
      q6:"C",q7:"C",q8:"C",q9:"C",q10:"C",
    })).toBe(100);
  });

  it("persists all ten answers and routes a 35 score to High Risk", async () => {
    const result = await createOwnershipAudit({
      fullName: "Ada Lovelace",
      visitorEmail: "ada@example.com",
      ...baseAnswers,
    });

    expect(mocks.insertValues).toHaveBeenCalledWith(expect.objectContaining({
      fullName: "Ada Lovelace",
      visitorEmail: "ada@example.com",
      score: 35,
      category: "High Risk",
      redirectTarget: "Deliver My Project",
    }));
    expect(result.score).toBe(35);
    expect(result.category).toBe("High Risk");
    expect(result.redirectTarget).toBe("Deliver My Project");
  });

  it("propagates persistence failure", async () => {
    mocks.insertReturning.mockRejectedValueOnce(new Error("database down"));

    await expect(createOwnershipAudit({
      fullName: "Ada Lovelace",
      visitorEmail: "ada@example.com",
      ...baseAnswers,
    })).rejects.toThrow("database down");
  });
});
