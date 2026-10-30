import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

  const selectedRows = [
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
    step1: "step1",
    step2: "step2",
    step3: "step3",
    score: "score",
    category: "category",
    visitorEmail: "visitor_email",
    createdAt: "created_at",
  },
}));

vi.mock("../../src/auth/auth.service.js", () => ({
  authenticateAccessToken: mocks.authenticateAccessToken,
}));

import app from "../../src/app.js";

let server: ReturnType<typeof app.listen>;
let baseUrl: string;

const validPayload = {
  step1: "A",
  step2: "B",
  step3: "C",
  visitorEmail: "ada@example.com",
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
    it("stores valid audit answers and returns the persisted record", async () => {
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
          step1: "A",
          step2: "B",
          step3: "C",
          score: 9,
          category: "Moderate Control",
          visitorEmail: "ada@example.com",
          createdAt: "2026-10-01T10:00:00.000Z",
        },
      });

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
    });

    it("accepts a valid audit without visitor email", async () => {
      mocks.insertReturning.mockResolvedValueOnce([
        {
          ...mocks.insertedRows[0],
          visitorEmail: null,
        },
      ]);

      const response = await fetch(`${baseUrl}/api/v1/ownership-audits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          step1: "A",
          step2: "A",
          step3: "A",
        }),
      });

      expect(response.status).toBe(201);

      expect(mocks.insertValues).toHaveBeenCalledWith(
        expect.objectContaining({
          visitorEmail: null,
        }),
      );
    });

    it("rejects an invalid step1 answer", async () => {
      const response = await fetch(`${baseUrl}/api/v1/ownership-audits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...validPayload,
          step1: "D",
        }),
      });

      expect(response.status).toBe(400);

      expect(await response.json()).toEqual({
        error: {
          code: "VALIDATION_ERROR",
          message: "All three audit answers are required.",
        },
      });

      expect(mocks.db.insert).not.toHaveBeenCalled();
    });

    it("rejects an invalid step2 answer", async () => {
      const response = await fetch(`${baseUrl}/api/v1/ownership-audits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...validPayload,
          step2: "D",
        }),
      });

      expect(response.status).toBe(400);

      expect(await response.json()).toEqual({
        error: {
          code: "VALIDATION_ERROR",
          message: "All three audit answers are required.",
        },
      });

      expect(mocks.db.insert).not.toHaveBeenCalled();
    });

    it("rejects an invalid step3 answer", async () => {
      const response = await fetch(`${baseUrl}/api/v1/ownership-audits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...validPayload,
          step3: "D",
        }),
      });

      expect(response.status).toBe(400);

      expect(await response.json()).toEqual({
        error: {
          code: "VALIDATION_ERROR",
          message: "All three audit answers are required.",
        },
      });

      expect(mocks.db.insert).not.toHaveBeenCalled();
    });

    it("rejects a request when an audit answer is missing", async () => {
      const response = await fetch(`${baseUrl}/api/v1/ownership-audits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          step1: "A",
          step2: "B",
        }),
      });

      expect(response.status).toBe(400);

      expect(await response.json()).toEqual({
        error: {
          code: "VALIDATION_ERROR",
          message: "All three audit answers are required.",
        },
      });

      expect(mocks.db.insert).not.toHaveBeenCalled();
    });

    it("rejects a non-string visitor email", async () => {
      const response = await fetch(`${baseUrl}/api/v1/ownership-audits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...validPayload,
          visitorEmail: 12345,
        }),
      });

      expect(response.status).toBe(400);

      expect(await response.json()).toEqual({
        error: {
          code: "VALIDATION_ERROR",
          message: "Visitor email must be a string.",
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
            step1: "A",
            step2: "B",
            step3: "C",
            score: 9,
            category: "Moderate Control",
            visitorEmail: "ada@example.com",
            createdAt: "2026-10-01T10:00:00.000Z",
          },
        ],
      });

      expect(mocks.db.select).toHaveBeenCalledOnce();
      expect(mocks.selectOrderBy).toHaveBeenCalledOnce();
    });
  });
});
