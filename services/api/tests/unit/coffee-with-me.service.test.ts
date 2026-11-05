import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const insertedRows: Array<{
    id: string;
    name: string;
    email: string;
    source: string;
    status: string;
    createdAt: Date;
    topic: string;
    preferredFormat: string | null;
    availability: string | null;
  }> = [
    {
      id: "33333333-3333-3333-3333-333333333333",
      name: "Ada Lovelace",
      email: "ada@example.com",
      source: "coffee-with-me",
      status: "new",
      createdAt: new Date("2026-10-01T10:00:00.000Z"),
      topic: "Product strategy",
      preferredFormat: "Video call",
      availability: "Weekday mornings",
    },
  ];

  const selectedRows: Array<{
    id: string;
    name: string;
    email: string;
    source?: string;
    status: string;
    createdAt: Date;
    topic: string;
    preferredFormat: string | null;
    availability: string | null;
  }> = [
    {
      id: "33333333-3333-3333-3333-333333333333",
      name: "Ada Lovelace",
      email: "ada@example.com",
      topic: "Product strategy",
      preferredFormat: "Video call",
      availability: "Weekday mornings",
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

  return {
    insertedRows,
    selectedRows,
    insertValues,
    insertReturning,
    selectWhere,
    selectOrderBy,
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
    topic: "topic",
    preferredFormat: "preferred_format",
    availability: "availability",
  },
}));

import {
  COFFEE_WITH_ME_REQUEST_SOURCE,
  COFFEE_WITH_ME_REQUEST_STATUS,
  createCoffeeWithMeRequest,
  listCoffeeWithMeRequests,
} from "../../src/services/coffee-with-me.js";

const validInput = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  topic: "Product strategy",
  preferredFormat: "Video call",
  availability: "Weekday mornings",
};

describe("createCoffeeWithMeRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("persists a valid Coffee With Me request with server-owned source and status", async () => {
    const result = await createCoffeeWithMeRequest(validInput);

    expect(mocks.db.insert).toHaveBeenCalledOnce();
    expect(mocks.insertValues).toHaveBeenCalledWith({
      name: "Ada Lovelace",
      email: "ada@example.com",
      source: "coffee-with-me",
      status: "new",
      topic: "Product strategy",
      preferredFormat: "Video call",
      availability: "Weekday mornings",
    });

    expect(result).toEqual({
      id: "33333333-3333-3333-3333-333333333333",
      name: "Ada Lovelace",
      email: "ada@example.com",
      source: "coffee-with-me",
      status: "new",
      createdAt: "2026-10-01T10:00:00.000Z",
      topic: "Product strategy",
      preferredFormat: "Video call",
      availability: "Weekday mornings",
    });
  });

  it("uses the server-owned source constant", () => {
    expect(COFFEE_WITH_ME_REQUEST_SOURCE).toBe("coffee-with-me");
  });

  it("uses the server-owned status constant", () => {
    expect(COFFEE_WITH_ME_REQUEST_STATUS).toBe("new");
  });

  it("persists null for missing optional fields", async () => {
    mocks.insertReturning.mockResolvedValueOnce([
      {
        ...mocks.insertedRows[0],
        preferredFormat: null,
        availability: null,
      },
    ]);

    const result = await createCoffeeWithMeRequest({
      name: "Ada Lovelace",
      email: "ada@example.com",
      topic: "Product strategy",
    });

    expect(mocks.insertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        preferredFormat: null,
        availability: null,
      }),
    );

    expect(result.preferredFormat).toBeUndefined();
    expect(result.availability).toBeUndefined();
  });

  it("throws when persistence returns no row", async () => {
    mocks.insertReturning.mockResolvedValueOnce([]);

    await expect(createCoffeeWithMeRequest(validInput)).rejects.toThrow(
      "Failed to persist the Coffee With Me request.",
    );
  });

  it("propagates persistence failures", async () => {
    mocks.insertReturning.mockRejectedValueOnce(new Error("database down"));

    await expect(createCoffeeWithMeRequest(validInput)).rejects.toThrow(
      "database down",
    );
  });
});

describe("listCoffeeWithMeRequests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns Coffee With Me requests newest first", async () => {
    const result = await listCoffeeWithMeRequests();

    expect(mocks.db.select).toHaveBeenCalledOnce();
    expect(mocks.selectWhere).toHaveBeenCalledOnce();
    expect(mocks.selectOrderBy).toHaveBeenCalledOnce();
    expect(result).toEqual([
      {
        id: "33333333-3333-3333-3333-333333333333",
        name: "Ada Lovelace",
        email: "ada@example.com",
        topic: "Product strategy",
        preferredFormat: "Video call",
        availability: "Weekday mornings",
        status: "new",
        createdAt: "2026-10-01T10:00:00.000Z",
      },
    ]);
  });
});