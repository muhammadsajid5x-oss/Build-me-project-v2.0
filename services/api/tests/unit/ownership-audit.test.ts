import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const inserted = {
    id: "audit-1",
    fullName: "Ada Lovelace",
    visitorEmail: "ada@example.com",
    q1: "A", q2: "A", q3: "A", q4: "A", q5: "A",
    q6: "B", q7: "B", q8: "B", q9: "B", q10: "B",
    score: 35,
    category: "High Risk",
    diagnosticResult: "High technical debt, unmanaged assets, critical execution gaps.",
    redirectTarget: "Deliver My Project",
    answers: {},
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
    id: "id", fullName: "full_name", visitorEmail: "visitor_email",
    q1:"q1",q2:"q2",q3:"q3",q4:"q4",q5:"q5",q6:"q6",q7:"q7",q8:"q8",q9:"q9",q10:"q10",
    score:"score",category:"category",diagnosticResult:"diagnostic_result",
    redirectTarget:"redirect_target",answers:"answers",createdAt:"created_at",
  },
}));

vi.mock("../../src/auth/auth.service.js", () => ({
  authenticateAccessToken: vi.fn(),
}));

import app from "../../src/app.js";

let server: ReturnType<typeof app.listen>;
let baseUrl: string;

const validPayload = {
  fullName: "Ada Lovelace",
  visitorEmail: "ada@example.com",
  q1:"A",q2:"A",q3:"A",q4:"A",q5:"A",
  q6:"B",q7:"B",q8:"B",q9:"B",q10:"B",
};

beforeEach(() => {
  vi.clearAllMocks();
  server = app.listen(0);
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("API server did not bind.");
  baseUrl = `http://127.0.0.1:${address.port}`;
});

afterEach(async () => {
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

describe("Ownership Audit POST route", () => {
  it("accepts ten answers and returns the calculated outcome", async () => {
    const response = await fetch(`${baseUrl}/api/v1/ownership-audits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validPayload),
    });

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({
      data: expect.objectContaining({
        id: "audit-1",
        fullName: "Ada Lovelace",
        visitorEmail: "ada@example.com",
        score: 35,
        category: "High Risk",
        redirectTarget: "Deliver My Project",
      }),
    });
    expect(mocks.insertValues).toHaveBeenCalledWith(expect.objectContaining({
      q1: "A", q10: "B", score: 35, category: "High Risk",
    }));
  });

  it("rejects missing full name or invalid email", async () => {
    const response = await fetch(`${baseUrl}/api/v1/ownership-audits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...validPayload, fullName: "", visitorEmail: "invalid" }),
    });
    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe("VALIDATION_ERROR");
    expect(mocks.db.insert).not.toHaveBeenCalled();
  });

  it("rejects missing or invalid answers", async () => {
    const response = await fetch(`${baseUrl}/api/v1/ownership-audits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...validPayload, q10: "D" }),
    });
    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe("VALIDATION_ERROR");
    expect(mocks.db.insert).not.toHaveBeenCalled();
  });
});
