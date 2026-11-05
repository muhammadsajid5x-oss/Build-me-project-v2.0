import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const insertedRows = [
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

  const db = {
    insert: vi.fn(() => insertChain),
  };

  return {
    insertedRows,
    insertValues,
    insertReturning,
    db,
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

  server = app.listen(0);

  const address = server.address();

  if (!address || typeof address === "string") {
    throw new Error("API server did not bind to a TCP port.");
  }

  baseUrl = `http://127.0.0.1:${address.port}`;
});

afterEach(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
});

describe("Deliver My Project integration", () => {
  it("creates a valid delivery project request end to end", async () => {
    const response = await fetch(
      `${baseUrl}/api/v1/delivery-project-requests`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

  it("rejects an invalid delivery project request", async () => {
    const response = await fetch(
      `${baseUrl}/api/v1/delivery-project-requests`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "",
          email: "invalid-email",
          projectDescription: "",
          expectedOutcome: "",
        }),
      },
    );

    expect(response.status).toBe(400);

    const body = (await response.json()) as {
      error: {
        code: string;
        details: {
          field: string;
          message: string;
        }[];
      };
    };

    expect(body.error.code).toBe("VALIDATION_ERROR");

    expect(body.error.details).toEqual(
      expect.arrayContaining([
        {
          field: "name",
          message: "Name is required.",
        },
        {
          field: "email",
          message: "Please enter a valid email address.",
        },
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

  it("protects server-owned source and status fields", async () => {
    const response = await fetch(
      `${baseUrl}/api/v1/delivery-project-requests`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...validPayload,
          id: "client-supplied-id",
          source: "spoofed-source",
          status: "converted",
          createdAt: "1999-01-01T00:00:00.000Z",
        }),
      },
    );

    expect(response.status).toBe(201);

    const inserted = mocks.insertValues.mock.calls[0]?.[0] as Record<
      string,
      unknown
    >;

    expect(inserted.source).toBe("deliver-my-project");
    expect(inserted.status).toBe("new");
    expect(inserted.id).toBeUndefined();
    expect(inserted.createdAt).toBeUndefined();
  });

  it("returns a safe server error when persistence fails", async () => {
    mocks.insertReturning.mockRejectedValueOnce(
      new Error("database password: super-secret"),
    );

    const response = await fetch(
      `${baseUrl}/api/v1/delivery-project-requests`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
