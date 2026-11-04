import request from "supertest";
import app from "../../../services/api/src/app.js";

// Mock the database client used by createOwnershipToolkitAccess
jest.mock("../../../database/dist/drizzle/client.js", () => ({
  db: {
    insert: jest.fn(() => ({
      values: jest.fn(() => ({
        returning: jest.fn(() =>
          Promise.resolve([
            {
              id: "ownership-toolkit-test-id",
              userId: null,
              fullName: "Ada Lovelace",
              visitorEmail: "ada@example.com",
              createdAt: new Date(),
            },
          ]),
        ),
      })),
    })),
    select: jest.fn(),
  },
}));

// Mock the Ownership Toolkit access schema
jest.mock(
  "../../../database/dist/schema/ownership-toolkit-accesses.js",
  () => ({
    ownershipToolkitAccesses: {
      id: "id",
      userId: "user_id",
      fullName: "full_name",
      visitorEmail: "visitor_email",
      createdAt: "created_at",
    },
  }),
);

const path = "/api/v1/ownership-toolkit-accesses";

const validPayload = {
  fullName: "Ada Lovelace",
  visitorEmail: "ada@example.com",
};

describe("POST /api/v1/ownership-toolkit-accesses", () => {
  it("accepts a valid Ownership Toolkit access request", async () => {
    const response = await request(app).post(path).send(validPayload);

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({
      fullName: "Ada Lovelace",
      visitorEmail: "ada@example.com",
    });
    expect(response.body.data.id).toBeDefined();
    expect(response.body.data.createdAt).toBeDefined();
  });

  it("rejects an invalid Ownership Toolkit access request", async () => {
    const response = await request(app).post(path).send({
      fullName: "",
      visitorEmail: "invalid-email",
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Please provide a valid full name.",
    });
  });

  it("rejects a name shorter than two characters", async () => {
    const response = await request(app).post(path).send({
      fullName: "A",
      visitorEmail: "ada@example.com",
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Please provide a valid full name.",
    });
  });

  it("normalizes the visitor email before persistence", async () => {
    const response = await request(app).post(path).send({
      fullName: "Ada Lovelace",
      visitorEmail: "ADA@EXAMPLE.COM",
    });

    expect(response.status).toBe(201);
    expect(response.body.data.visitorEmail).toBe("ada@example.com");
  });
});

describe("GET /api/v1/ownership-toolkit-accesses", () => {
  it("rejects an unauthenticated request", async () => {
    const response = await request(app).get(path);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication is required.",
      },
    });
  });

  it("rejects an authenticated request without admin permission", async () => {
    const response = await request(app)
      .get(path)
      .set("Authorization", "Bearer valid-token");

    expect([401, 403]).toContain(response.status);
  });
});
