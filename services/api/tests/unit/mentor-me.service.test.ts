import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const insertedRows: Array<{
    id: string;
    name: string;
    email: string;
    source: string;
    status: string;
    createdAt: Date;
    mentoringArea: string;
    helpWith: string;
    experienceContext: string;
    preferredFormat: string | null;
    availability: string | null;
  }> = [
    {
      id: "22222222-2222-2222-2222-222222222222",
      name: "Grace Hopper",
      email: "grace@example.com",
      source: "mentor-me",
      status: "new",
      createdAt: new Date("2026-10-01T10:00:00.000Z"),
      mentoringArea: "Architecture",
      helpWith: "System design",
      experienceContext: "10 years",
      preferredFormat: "Online call",
      availability: "Weekday evenings",
    },
  ];

  const selectedRows: Array<{
    id: string;
    name: string;
    email: string;
    source?: string;
    status: string;
    createdAt: Date;
    mentoringArea: string;
    helpWith: string;
    experienceContext: string;
    preferredFormat: string | null;
    availability: string | null;
  }> = [
    {
      id: "22222222-2222-2222-2222-222222222222",
      name: "Grace Hopper",
      email: "grace@example.com",
      mentoringArea: "Architecture",
      helpWith: "System design",
      experienceContext: "10 years",
      preferredFormat: "Online call",
      availability: "Weekday evenings",
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
    mentoringArea: "mentoring_area",
    helpWith: "help_with",
    experienceContext: "experience_context",
    preferredFormat: "preferred_format",
    availability: "availability",
  },
}));

import {
  MENTOR_ME_REQUEST_SOURCE,
  MENTOR_ME_REQUEST_STATUS,
  createMentorMeRequest,
  listMentorMeRequests,
} from "../../src/services/mentor-me.js";

const validInput = {
  name: "Grace Hopper",
  email: "grace@example.com",
  mentoringArea: "Architecture",
  helpWith: "System design",
  experienceContext: "10 years",
  preferredFormat: "Online call",
  availability: "Weekday evenings",
};

describe("createMentorMeRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.insertReturning.mockResolvedValue(mocks.insertedRows);
  });

  it("persists a valid Mentor Me request with server-owned source and status", async () => {
    const result = await createMentorMeRequest(validInput);

    expect(mocks.db.insert).toHaveBeenCalledOnce();
    expect(mocks.insertValues).toHaveBeenCalledWith({
      name: "Grace Hopper",
      email: "grace@example.com",
      source: "mentor-me",
      status: "new",
      mentoringArea: "Architecture",
      helpWith: "System design",
      experienceContext: "10 years",
      preferredFormat: "Online call",
      availability: "Weekday evenings",
    });

    expect(result).toEqual({
      id: "22222222-2222-2222-2222-222222222222",
      name: "Grace Hopper",
      email: "grace@example.com",
      source: "mentor-me",
      status: "new",
      createdAt: "2026-10-01T10:00:00.000Z",
      mentoringArea: "Architecture",
      helpWith: "System design",
      experienceContext: "10 years",
      preferredFormat: "Online call",
      availability: "Weekday evenings",
    });
  });

  it("uses the server-owned source constant", () => {
    expect(MENTOR_ME_REQUEST_SOURCE).toBe("mentor-me");
  });

  it("uses the server-owned status constant", () => {
    expect(MENTOR_ME_REQUEST_STATUS).toBe("new");
  });

  it("persists null for missing optional fields", async () => {
    mocks.insertReturning.mockResolvedValueOnce([
      {
        ...mocks.insertedRows[0],
        preferredFormat: null,
        availability: null,
      },
    ]);

    const result = await createMentorMeRequest({
      name: "Grace Hopper",
      email: "grace@example.com",
      mentoringArea: "Architecture",
      helpWith: "System design",
      experienceContext: "10 years",
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

    await expect(createMentorMeRequest(validInput)).rejects.toThrow(
      "Failed to persist the Mentor Me request.",
    );
  });

  it("propagates persistence failures", async () => {
    mocks.insertReturning.mockRejectedValueOnce(new Error("database down"));

    await expect(createMentorMeRequest(validInput)).rejects.toThrow(
      "database down",
    );
  });
});

describe("listMentorMeRequests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns Mentor Me requests newest first", async () => {
    const result = await listMentorMeRequests();

    expect(mocks.db.select).toHaveBeenCalledOnce();
    expect(mocks.selectWhere).toHaveBeenCalledOnce();
    expect(mocks.selectOrderBy).toHaveBeenCalledOnce();
    expect(result).toEqual([
      {
        id: "22222222-2222-2222-2222-222222222222",
        name: "Grace Hopper",
        email: "grace@example.com",
        mentoringArea: "Architecture",
        helpWith: "System design",
        experienceContext: "10 years",
        preferredFormat: "Online call",
        availability: "Weekday evenings",
        status: "new",
        createdAt: "2026-10-01T10:00:00.000Z",
      },
    ]);
  });
});
