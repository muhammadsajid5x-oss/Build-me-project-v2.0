import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const insertedRows = [
    {
      id: "77777777-7777-7777-7777-777777777777",
      step1: "A",
      step2: "B",
      step3: "C",
      score: 9,
      category: "Moderate Control",
      visitorEmail: "ada@example.com",
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
    createdAt: "created_at",
  },
}));

import { createOwnershipAudit } from "../../src/services/ownership-audit.js";

describe("createOwnershipAudit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calculates and persists the correct score and category", async () => {
    const result = await createOwnershipAudit({
      step1: "A",
      step2: "B",
      step3: "C",
      visitorEmail: "ada@example.com",
    });

    expect(mocks.db.insert).toHaveBeenCalledOnce();

    expect(mocks.insertValues).toHaveBeenCalledWith({
      step1: "A",
      step2: "B",
      step3: "C",
      score: 9,
      category: "Moderate Control",
      visitorEmail: "ada@example.com",
      answers: {
        step1: "A",
        step2: "B",
        step3: "C",
      },
    });

    expect(result).toEqual({
      id: "77777777-7777-7777-7777-777777777777",
      step1: "A",
      step2: "B",
      step3: "C",
      score: 9,
      category: "Moderate Control",
      visitorEmail: "ada@example.com",
      createdAt: "2026-10-01T10:00:00.000Z",
    });
  });

  it("returns High Risk for the lowest score", async () => {
    mocks.insertReturning.mockResolvedValueOnce([
      {
        ...mocks.insertedRows[0],
        step1: "A",
        step2: "A",
        step3: "A",
        score: 3,
        category: "High Risk",
      },
    ]);

    const result = await createOwnershipAudit({
      step1: "A",
      step2: "A",
      step3: "A",
    });

    expect(mocks.insertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        score: 3,
        category: "High Risk",
      }),
    );

    expect(result.score).toBe(3);
    expect(result.category).toBe("High Risk");
  });

  it("returns Moderate Control for a middle score", async () => {
    mocks.insertReturning.mockResolvedValueOnce([
      {
        ...mocks.insertedRows[0],
        step1: "B",
        step2: "B",
        step3: "B",
        score: 9,
        category: "Moderate Control",
      },
    ]);

    const result = await createOwnershipAudit({
      step1: "B",
      step2: "B",
      step3: "B",
    });

    expect(mocks.insertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        score: 9,
        category: "Moderate Control",
      }),
    );

    expect(result.score).toBe(9);
    expect(result.category).toBe("Moderate Control");
  });

  it("returns Strong Ownership for the highest score", async () => {
    mocks.insertReturning.mockResolvedValueOnce([
      {
        ...mocks.insertedRows[0],
        step1: "C",
        step2: "C",
        step3: "C",
        score: 15,
        category: "Strong Ownership",
      },
    ]);

    const result = await createOwnershipAudit({
      step1: "C",
      step2: "C",
      step3: "C",
    });

    expect(mocks.insertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        score: 15,
        category: "Strong Ownership",
      }),
    );

    expect(result.score).toBe(15);
    expect(result.category).toBe("Strong Ownership");
  });

  it("persists null when visitor email is not provided", async () => {
    mocks.insertReturning.mockResolvedValueOnce([
      {
        ...mocks.insertedRows[0],
        visitorEmail: null,
      },
    ]);

    const result = await createOwnershipAudit({
      step1: "A",
      step2: "A",
      step3: "A",
    });

    expect(mocks.insertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        visitorEmail: null,
      }),
    );

    expect(result.visitorEmail).toBeNull();
  });

  it("throws when persistence returns no row", async () => {
    mocks.insertReturning.mockResolvedValueOnce([]);

    await expect(
      createOwnershipAudit({
        step1: "A",
        step2: "B",
        step3: "C",
      }),
    ).rejects.toThrow("Failed to persist the Ownership Audit.");
  });

  it("propagates persistence failures", async () => {
    mocks.insertReturning.mockRejectedValueOnce(new Error("database down"));

    await expect(
      createOwnershipAudit({
        step1: "A",
        step2: "B",
        step3: "C",
      }),
    ).rejects.toThrow("database down");
  });
});
