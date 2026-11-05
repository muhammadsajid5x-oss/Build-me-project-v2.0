import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const insertedRows = [
    {
      id: "77777777-7777-7777-7777-777777777777",
      fullName: "Ada Lovelace",
      visitorEmail: "ada@example.com",
      answers: {
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
      diagnosticResult: "Highly mature, automated, and secure architecture.",
      redirectTarget: "Coffee With Me",
      createdAt: new Date("2026-10-01T10:00:00.000Z"),
    },
  ];

  const selectedRows = [
    {
      id: "77777777-7777-7777-7777-777777777777",
      fullName: "Ada Lovelace",
      visitorEmail: "ada@example.com",
      answers: {
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
      diagnosticResult: "Highly mature, automated, and secure architecture.",
      redirectTarget: "Coffee With Me",
      createdAt: new Date("2026-10-01T10:00:00.000Z"),
    },
  ];

  const insertValues = vi.fn();
  const insertReturning = vi.fn(() => Promise.resolve(insertedRows));

  const selectOrderBy = vi.fn(() => ({
    then: (resolve: (rows: unknown[]) => unknown) => resolve(selectedRows),
  }));

  const insertChain = {
    values: vi.fn((values: unknown) => {
      insertValues(values);
      return { returning: insertReturning };
    }),
  };

  const selectChain = {
    from: vi.fn(() => ({
      orderBy: selectOrderBy,
    })),
  };

  const authenticateAccessToken = vi.fn();

  return {
    insertedRows,
    selectedRows,
    insertValues,
    insertReturning,
    selectOrderBy,
    authenticateAccessToken,
    db: {
      insert: vi.fn(() => insertChain),
      select: vi.fn(() => selectChain),
    },
  };
});

vi.mock("../../../../database/dist/drizzle/client.js", () => ({
  db: mocks.db,
}));

vi.mock("../../../../database/dist/schema/ownership-audits.js", () => ({
  ownershipAudits: {
    id: "id",
    fullName: "full_name",
    q1: "q1",
    q2: "q2",
    q3: "q3",
    q4: "q4",
    q5: "q5",
    q6: "q6",
    q7: "q7",
    q8: "q8",
    q9: "q9",
    q10: "q10",
    diagnosticResult: "diagnostic_result",
    redirectTarget: "redirect_target",
    score: "score",
    category: "category",
    visitorEmail: "visitor_email",
    answers: "answers",
    createdAt: "created_at",
  },
}));

vi.mock("../../src/auth/auth.service.js", () => ({
  authenticateAccessToken: mocks.authenticateAccessToken,
}));

import app from "../../src/app.js";

let server: ReturnType<typeof app.listen>;
let baseUrl: string;

const validAnswers = {
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
};

const validPayload = {
  fullName: "Ada Lovelace",
  visitorEmail: "ada@example.com",
  answers: validAnswers,
};

beforeEach(() => {
  vi.clearAllMocks();

  mocks.authenticateAccessToken.mockResolvedValue(null);

  server = app.listen(0);

  const address = server.address();

  if (!address || typeof address === "string") {
    throw new Error("API server did not bind to a TCP port.");
  }

  baseUrl = `http://127.0.0.1:${address.port}`;
});

afterEach(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

describe("Ownership Audit routes", () => {
  describe("POST /api/v1/ownership-audits", () => {
    it("stores a valid ten-question audit and returns the persisted record", async () => {
      const response = await fetch(`${baseUrl}/api/v1/ownership-audits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validPayload),
      });

      expect(response.status).toBe(201);

      expect(await response.json()).toEqual({
        data: {
          id: "77777777-7777-7777-7777-777777777777",
          fullName: "Ada Lovelace",
          visitorEmail: "ada@example.com",
          answers: validAnswers,
          score: 100,
          category: "Strong Ownership",
          diagnosticResult:
            "Highly mature, automated, and secure architecture.",
          redirectTarget: "Coffee With Me",
          createdAt: "2026-10-01T10:00:00.000Z",
        },
      });

      expect(mocks.insertValues).toHaveBeenCalledWith({
        fullName: "Ada Lovelace",
        visitorEmail: "ada@example.com",
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
        score: 100,
        category: "Strong Ownership",
        diagnosticResult: "Highly mature, automated, and secure architecture.",
        redirectTarget: "Coffee With Me",
        answers: validAnswers,
      });
    });

    it("rejects a missing full name", async () => {
      const response = await fetch(`${baseUrl}/api/v1/ownership-audits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...validPayload,
          fullName: "",
        }),
      });

      expect(response.status).toBe(400);

      expect(await response.json()).toEqual({
        error: {
          code: "VALIDATION_ERROR",
          message: "Full name is required.",
        },
      });

      expect(mocks.db.insert).not.toHaveBeenCalled();
    });

    it("rejects an invalid visitor email", async () => {
      const response = await fetch(`${baseUrl}/api/v1/ownership-audits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...validPayload,
          visitorEmail: "not-an-email",
        }),
      });

      expect(response.status).toBe(400);

      expect(await response.json()).toEqual({
        error: {
          code: "VALIDATION_ERROR",
          message: "A valid visitor email is required.",
        },
      });

      expect(mocks.db.insert).not.toHaveBeenCalled();
    });

    it("rejects an incomplete answer set", async () => {
      const incompleteAnswers = { ...validAnswers };

      delete incompleteAnswers.q10;

      const response = await fetch(`${baseUrl}/api/v1/ownership-audits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...validPayload,
          answers: incompleteAnswers,
        }),
      });

      expect(response.status).toBe(400);

      expect(await response.json()).toEqual({
        error: {
          code: "VALIDATION_ERROR",
          message: "All ten audit answers are required.",
        },
      });

      expect(mocks.db.insert).not.toHaveBeenCalled();
    });

    it("rejects an invalid answer option", async () => {
      const response = await fetch(`${baseUrl}/api/v1/ownership-audits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...validPayload,
          answers: {
            ...validAnswers,
            q5: "D",
          },
        }),
      });

      expect(response.status).toBe(400);

      expect(await response.json()).toEqual({
        error: {
          code: "VALIDATION_ERROR",
          message: "All ten audit answers are required.",
        },
      });

      expect(mocks.db.insert).not.toHaveBeenCalled();
    });

    it("returns a generic server error when persistence fails", async () => {
      mocks.insertReturning.mockRejectedValueOnce(
        new Error("database password: super-secret"),
      );

      const response = await fetch(`${baseUrl}/api/v1/ownership-audits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validPayload),
      });

      expect(response.status).toBe(500);

      expect(await response.json()).toEqual({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred.",
        },
      });
    });
  });

  describe("GET /api/v1/ownership-audits", () => {
    it("rejects an unauthenticated request", async () => {
      const response = await fetch(`${baseUrl}/api/v1/ownership-audits`);

      expect(response.status).toBe(401);

      expect(await response.json()).toEqual({
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication is required.",
        },
      });

      expect(mocks.db.select).not.toHaveBeenCalled();
    });

    it("rejects an authenticated request without admin permission", async () => {
      mocks.authenticateAccessToken.mockResolvedValue({
        id: "user-123",
        email: "user@example.com",
        isAdmin: false,
      });

      const response = await fetch(`${baseUrl}/api/v1/ownership-audits`, {
        headers: {
          Authorization: "Bearer valid-token",
        },
      });

      expect(response.status).toBe(403);

      expect(await response.json()).toEqual({
        error: {
          code: "FORBIDDEN",
          message: "You do not have permission to access this resource.",
        },
      });

      expect(mocks.db.select).not.toHaveBeenCalled();
    });

    it("returns Ownership Audit records for an administrator", async () => {
      mocks.authenticateAccessToken.mockResolvedValue({
        id: "admin-1",
        email: "admin@example.com",
        isAdmin: true,
      });

      const response = await fetch(`${baseUrl}/api/v1/ownership-audits`, {
        headers: {
          Authorization: "Bearer admin-token",
        },
      });

      expect(response.status).toBe(200);

      expect(await response.json()).toEqual({
        data: [
          {
            id: "77777777-7777-7777-7777-777777777777",
            fullName: "Ada Lovelace",
            visitorEmail: "ada@example.com",
            answers: validAnswers,
            score: 100,
            category: "Strong Ownership",
            diagnosticResult:
              "Highly mature, automated, and secure architecture.",
            redirectTarget: "Coffee With Me",
            createdAt: "2026-10-01T10:00:00.000Z",
          },
        ],
      });

      expect(mocks.db.select).toHaveBeenCalledOnce();
      expect(mocks.selectOrderBy).toHaveBeenCalledOnce();
    });
  });
});
