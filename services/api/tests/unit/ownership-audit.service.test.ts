import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => {
  const insertedRows = [
    {
      id: "77777777-7777-7777-7777-777777777777",
      visitorEmail: "ada@example.com",
      answers: {
        fullName: "Ada Lovelace",
        q1: "C",
        q2: "C",
        q3: "C",
        q4: "C",
        q5: "C",
        q6: "C",
        q7: "C",
        q8: "C",
        q9: "C",
        q10: "C",
      },
      score: 100,
      category: "Strong Ownership",
      createdAt: new Date("2026-10-01T10:00:00.000Z"),
    },
  ];
  const insertValues = vi.fn();
  const insertReturning = vi.fn(() => Promise.resolve(insertedRows));
  const insertChain = {
    values: vi.fn((values: unknown) => {
      insertValues(values);
      return {
        returning: insertReturning,
      };
    }),
  };
  return {
    insertedRows,
    insertValues,
    insertReturning,
    db: {
      insert: vi.fn(() => insertChain),
    },
  };
});
vi.mock("../../../../database/dist/drizzle/client.js", () => ({
  db: mocks.db,
}));
vi.mock("../../../../database/dist/schema/ownership-audits.js", () => ({
  ownershipAudits: {
    id: "id",
    step1: "step1",
    step2: "step2",
    step3: "step3",
    score: "score",
    category: "category",
    visitorEmail: "visitor_email",
    answers: "answers",
    createdAt: "created_at",
  },
}));
import { createOwnershipAudit } from "../../src/services/ownership-audit.js";
const baseAnswers = {
  q1: "A" as const,
  q2: "A" as const,
  q3: "A" as const,
  q4: "A" as const,
  q5: "A" as const,
  q6: "A" as const,
  q7: "A" as const,
  q8: "A" as const,
  q9: "A" as const,
  q10: "A" as const,
};
function createAnswers(
  values: Array<"A" | "B" | "C">,
) {
  return {
    q1: values[0],
    q2: values[1],
    q3: values[2],
    q4: values[3],
    q5: values[4],
    q6: values[5],
    q7: values[6],
    q8: values[7],
    q9: values[8],
    q10: values[9],
  };
}
function returnedRow(
  answers: ReturnType<typeof createAnswers>,
  score: number,
  category: string,
) {
  return {
    ...mocks.insertedRows[0],
    answers: {
      fullName: "Ada Lovelace",
      ...answers,
    },
    score,
    category,
  };
}
describe("createOwnershipAudit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("persists ten answers, visitor details, score and category", async () => {
    const answers = createAnswers([
      "C",
      "C",
      "C",
      "C",
      "C",
      "C",
      "C",
      "C",
      "C",
      "C",
    ]);
    mocks.insertReturning.mockResolvedValueOnce([
      returnedRow(answers, 100, "Strong Ownership"),
    ]);
    const result = await createOwnershipAudit({
      fullName: "Ada Lovelace",
      visitorEmail: "ada@example.com",
      answers,
    });
    expect(mocks.db.insert).toHaveBeenCalledOnce();
    expect(mocks.insertValues).toHaveBeenCalledWith({
      visitorEmail: "ada@example.com",
      step1: "C,C",
      step2: "C,C,C,C",
      step3: "C,C,C,C",
      score: 100,
      category: "Strong Ownership",
      answers: {
        fullName: "Ada Lovelace",
        ...answers,
      },
    });
    expect(result).toEqual({
      id: "77777777-7777-7777-7777-777777777777",
      fullName: "Ada Lovelace",
      visitorEmail: "ada@example.com",
      answers,
      score: 100,
      category: "Strong Ownership",
      createdAt: "2026-10-01T10:00:00.000Z",
    });
  });
  it("returns High Risk at score 20", async () => {
    const answers = createAnswers([
      "A",
      "A",
      "A",
      "A",
      "A",
      "A",
      "A",
      "A",
      "A",
      "A",
    ]);
    mocks.insertReturning.mockResolvedValueOnce([
      returnedRow(answers, 20, "High Risk"),
    ]);
    const result = await createOwnershipAudit({
      fullName: "Ada Lovelace",
      visitorEmail: "ada@example.com",
      answers,
    });
    expect(mocks.insertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        score: 20,
        category: "High Risk",
      }),
    );
    expect(result.score).toBe(20);
    expect(result.category).toBe("High Risk");
  });
  it("returns High Risk at the 35-point boundary", async () => {
    const answers = createAnswers([
      "A",
      "A",
      "A",
      "A",
      "A",
      "B",
      "B",
      "B",
      "B",
      "B",
    ]);
    mocks.insertReturning.mockResolvedValueOnce([
      returnedRow(answers, 35, "High Risk"),
    ]);
    const result = await createOwnershipAudit({
      fullName: "Ada Lovelace",
      visitorEmail: "ada@example.com",
      answers,
    });
    expect(result.score).toBe(35);
    expect(result.category).toBe("High Risk");
  });
  it("returns Moderate Control at the 36-point boundary", async () => {
    const answers = createAnswers([
      "A",
      "A",
      "A",
      "A",
      "A",
      "A",
      "A",
      "A",
      "C",
      "C",
    ]);
    mocks.insertReturning.mockResolvedValueOnce([
      returnedRow(answers, 36, "Moderate Control"),
    ]);
    const result = await createOwnershipAudit({
      fullName: "Ada Lovelace",
      visitorEmail: "ada@example.com",
      answers,
    });
    expect(result.score).toBe(36);
    expect(result.category).toBe("Moderate Control");
  });
  it("returns Moderate Control at the 69-point boundary", async () => {
    const answers = createAnswers([
      "A",
      "A",
      "B",
      "B",
      "B",
      "C",
      "C",
      "C",
      "C",
      "C",
    ]);
    mocks.insertReturning.mockResolvedValueOnce([
      returnedRow(answers, 69, "Moderate Control"),
    ]);
    const result = await createOwnershipAudit({
      fullName: "Ada Lovelace",
      visitorEmail: "ada@example.com",
      answers,
    });
    expect(result.score).toBe(69);
    expect(result.category).toBe("Moderate Control");
  });
  it("returns Strong Ownership at the 70-point boundary", async () => {
    const answers = createAnswers([
      "B",
      "B",
      "B",
      "B",
      "B",
      "B",
      "C",
      "C",
      "C",
      "C",
    ]);
    mocks.insertReturning.mockResolvedValueOnce([
      returnedRow(answers, 70, "Strong Ownership"),
    ]);
    const result = await createOwnershipAudit({
      fullName: "Ada Lovelace",
      visitorEmail: "ada@example.com",
      answers,
    });
    expect(result.score).toBe(70);
    expect(result.category).toBe("Strong Ownership");
  });
  it("returns Strong Ownership at score 100", async () => {
    const answers = createAnswers([
      "C",
      "C",
      "C",
      "C",
      "C",
      "C",
      "C",
      "C",
      "C",
      "C",
    ]);
    mocks.insertReturning.mockResolvedValueOnce([
      returnedRow(answers, 100, "Strong Ownership"),
    ]);
    const result = await createOwnershipAudit({
      fullName: "Ada Lovelace",
      visitorEmail: "ada@example.com",
      answers,
    });
    expect(result.score).toBe(100);
    expect(result.category).toBe("Strong Ownership");
  });
  it("persists the full name inside the existing answers JSON field", async () => {
    const answers = createAnswers([
      "A",
      "B",
      "A",
      "B",
      "A",
      "B",
      "A",
      "B",
      "A",
      "B",
    ]);
    mocks.insertReturning.mockResolvedValueOnce([
      returnedRow(answers, 35, "High Risk"),
    ]);
    await createOwnershipAudit({
      fullName: "Grace Hopper",
      visitorEmail: "grace@example.com",
      answers,
    });
    expect(mocks.insertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        answers: {
          fullName: "Grace Hopper",
          ...answers,
        },
      }),
    );
  });
  it("throws when persistence returns no row", async () => {
    mocks.insertReturning.mockResolvedValueOnce([]);
    await expect(
      createOwnershipAudit({
        fullName: "Ada Lovelace",
        visitorEmail: "ada@example.com",
        answers: baseAnswers,
      }),
    ).rejects.toThrow("Failed to persist the Ownership Audit.");
  });
  it("throws when persisted answers cannot be read", async () => {
    mocks.insertReturning.mockResolvedValueOnce([
      {
        ...mocks.insertedRows[0],
        answers: {
          fullName: "Ada Lovelace",
          q1: "A",
        },
      },
    ]);
    await expect(
      createOwnershipAudit({
        fullName: "Ada Lovelace",
        visitorEmail: "ada@example.com",
        answers: baseAnswers,
      }),
    ).rejects.toThrow("Failed to read the newly created Ownership Audit.");
  });
  it("propagates persistence failures", async () => {
    mocks.insertReturning.mockRejectedValueOnce(
      new Error("database down"),
    );
    await expect(
      createOwnershipAudit({
        fullName: "Ada Lovelace",
        visitorEmail: "ada@example.com",
        answers: baseAnswers,
      }),
    ).rejects.toThrow("database down");
  });
});


