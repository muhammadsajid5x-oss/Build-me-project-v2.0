import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const insertedRows: Record<string, unknown>[] = [
    {
      id: "11111111-1111-1111-1111-111111111111",
      name: "Ada Lovelace",
      email: "ada@example.com",
      source: "deliver-my-project",
      status: "new",
      createdAt: new Date("2026-10-01T10:00:00.000Z"),
      projectDescription: "A delivery platform.",
      expectedOutcome: "A working platform.",
      timeline: "6 weeks",
      budget: "$1,000",
    },
  ];

  const selectedRows: Record<string, unknown>[] = [
    {
      id: "11111111-1111-1111-1111-111111111111",
      name: "Ada Lovelace",
      email: "ada@example.com",
      projectDescription: "A delivery platform.",
      expectedOutcome: "A working platform.",
      timeline: "6 weeks",
      budget: "$1,000",
      status: "new",
      createdAt: new Date("2026-10-01T10:00:00.000Z"),
    },
  ];

  const insertValues = vi.fn();
  const insertReturning = vi.fn(() => Promise.resolve(insertedRows));
  const selectWhere = vi.fn();
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
      where: vi.fn((condition: unknown) => {
        selectWhere(condition);
        return { orderBy: selectOrderBy };
      }),
    })),
  };

  const authenticateAccessToken = vi.fn();

  return {
    insertedRows,
    selectedRows,
    insertValues,
    insertReturning,
    selectWhere,
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

vi.mock("../../../../database/dist/schema/leads.js", () => ({
  leads: {
    id: "id",
    name: "name",
    email: "email",
    source: "source",
    status: "status",
    createdAt: "created_at",
    projectDescription: "project_description",
    expectedOutcome: "expected_outcome",
    timeline: "timeline",
    budget: "budget",
  },
}));

vi.mock("../../src/auth/auth.service.js", () => ({
  authenticateAccessToken: mocks.authenticateAccessToken,
}));

import app from "../../src/app.js";

let server: ReturnType<typeof app.listen>;
let baseUrl: string;

const validPayload = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  projectDescription: "A delivery platform.",
  expectedOutcome: "A working platform.",
  timeline: "6 weeks",
  budget: "$1,000",
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

describe("Delivery project request routes", () => {
  describe("POST /api/v1/delivery-project-requests", () => {
    it("stores a validated request and returns the persisted record", async () => {
      const response = await fetch(
        `${baseUrl}/api/v1/delivery-project-requests`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(validPayload),
        },
      );

      expect(response.status).toBe(201);
      expect(await response.json()).toEqual({
        data: {
          id: "11111111-1111-1111-1111-111111111111",
          name: "Ada Lovelace",
          email: "ada@example.com",
          projectDescription: "A delivery platform.",
          expectedOutcome: "A working platform.",
          timeline: "6 weeks",
          budget: "$1,000",
          status: "new",
          createdAt: "2026-10-01T10:00:00.000Z",
        },
      });

      expect(mocks.insertValues).toHaveBeenCalledWith({
        name: "Ada Lovelace",
        email: "ada@example.com",
        source: "deliver-my-project",
        status: "new",
        projectDescription: "A delivery platform.",
        expectedOutcome: "A working platform.",
        timeline: "6 weeks",
        budget: "$1,000",
      });
    });

    it("never accepts a client supplied source, status or identifier", async () => {
      await fetch(`${baseUrl}/api/v1/delivery-project-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...validPayload,
          id: "client-supplied-id",
          source: "spoofed-source",
          status: "converted",
          createdAt: "1999-01-01T00:00:00.000Z",
        }),
      });

      const inserted = mocks.insertValues.mock.calls[0]?.[0] as Record<
        string,
        unknown
      >;

      expect(inserted.source).toBe("deliver-my-project");
      expect(inserted.status).toBe("new");
      expect(inserted.id).toBeUndefined();
      expect(inserted.createdAt).toBeUndefined();
    });

    it("rejects an invalid request with the field details", async () => {
      const response = await fetch(
        `${baseUrl}/api/v1/delivery-project-requests`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "",
            email: "not-an-email",
            projectDescription: "",
            expectedOutcome: "",
          }),
        },
      );

      expect(response.status).toBe(400);

      const body = (await response.json()) as {
        error: {
          code: string;
          details: { field: string; message: string }[];
        };
      };

      expect(body.error.code).toBe("VALIDATION_ERROR");
      expect(body.error.details).toEqual(
        expect.arrayContaining([
          { field: "name", message: "Name is required." },
          { field: "email", message: "Please enter a valid email address." },
          {
            field: "projectDescription",
            message: "Project description is required.",
          },
          {
            field: "expectedOutcome",
            message: "Expected outcome is required.",
          },
        ]),
      );
      expect(mocks.db.insert).not.toHaveBeenCalled();
    });

    it("returns a generic server error when persistence fails", async () => {
      mocks.insertReturning.mockRejectedValueOnce(
        new Error("database password: super-secret"),
      );

      const response = await fetch(
        `${baseUrl}/api/v1/delivery-project-requests`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(validPayload),
        },
      );

      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred.",
        },
      });
    });
  });

  describe("GET /api/v1/delivery-project-requests", () => {
    it("rejects an unauthenticated request", async () => {
      const response = await fetch(
        `${baseUrl}/api/v1/delivery-project-requests`,
      );

      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication is required.",
        },
      });
      expect(mocks.db.select).not.toHaveBeenCalled();
    });

    it("rejects an authenticated request without the admin permission", async () => {
      mocks.authenticateAccessToken.mockResolvedValue({
        id: "user-123",
        email: "user@example.com",
        isAdmin: false,
      });

      const response = await fetch(
        `${baseUrl}/api/v1/delivery-project-requests`,
        { headers: { Authorization: "Bearer valid-token" } },
      );

      expect(response.status).toBe(403);
      expect(await response.json()).toEqual({
        error: {
          code: "FORBIDDEN",
          message: "You do not have permission to access this resource.",
        },
      });
      expect(mocks.db.select).not.toHaveBeenCalled();
    });

    it("returns the delivery project requests for an administrator", async () => {
      mocks.authenticateAccessToken.mockResolvedValue({
        id: "admin-1",
        email: "admin@example.com",
        isAdmin: true,
      });

      const response = await fetch(
        `${baseUrl}/api/v1/delivery-project-requests`,
        { headers: { Authorization: "Bearer admin-token" } },
      );

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        data: [
          {
            id: "11111111-1111-1111-1111-111111111111",
            name: "Ada Lovelace",
            email: "ada@example.com",
            projectDescription: "A delivery platform.",
            expectedOutcome: "A working platform.",
            timeline: "6 weeks",
            budget: "$1,000",
            status: "new",
            createdAt: "2026-10-01T10:00:00.000Z",
          },
        ],
      });
      expect(mocks.db.select).toHaveBeenCalledOnce();
      expect(mocks.selectWhere).toHaveBeenCalledOnce();
      expect(mocks.selectOrderBy).toHaveBeenCalledOnce();
    });
  });
});
