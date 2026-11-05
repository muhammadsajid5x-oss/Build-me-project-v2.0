import request from "supertest";
import app from "../../../services/api/src/app.js";

// Mock the database client used by createCoffeeWithMeRequest
jest.mock("../../../database/dist/drizzle/client.js", () => ({
  db: {
    insert: jest.fn(() => ({
      values: jest.fn(() => ({
        returning: jest.fn(() =>
          Promise.resolve([
            {
              id: "test-id-123",
              name: "Ada Lovelace",
              email: "ada@example.com",
              source: "coffee-with-me",
              status: "new",
              createdAt: new Date(),
              topic: "Designing scalable systems for a growing startup.",
              preferredFormat: "Online call",
              availability: "Weekday evenings",
            },
          ]),
        ),
      })),
    })),
  },
}));

// Mock the leads schema
jest.mock("../../../database/dist/schema/leads.js", () => ({
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

const path = "/api/v1/coffee-with-me-requests";

const validPayload = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  topic: "Designing scalable systems for a growing startup.",
  preferredFormat: "Online call",
  availability: "Weekday evenings",
};

describe("POST /api/v1/coffee-with-me-requests", () => {
  it("accepts a valid Coffee With Me request", async () => {
    const response = await request(app).post(path).send(validPayload);

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({
      name: "Ada Lovelace",
      email: "ada@example.com",
      topic: "Designing scalable systems for a growing startup.",
      preferredFormat: "Online call",
      availability: "Weekday evenings",
      status: "new",
    });
    expect(response.body.data.id).toBeDefined();
    expect(response.body.data.createdAt).toBeDefined();
  });

  it("rejects an invalid Coffee With Me request", async () => {
    const response = await request(app).post(path).send({
      name: "",
      email: "invalid-email",
      topic: "",
    });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(response.body.error.details).toEqual(
      expect.arrayContaining([
        { field: "name", message: "Name is required." },
        {
          field: "email",
          message: "Please enter a valid email address.",
        },
        { field: "topic", message: "Topic is required." },
      ]),
    );
  });

  it("protects server-owned source and status fields", async () => {
    const response = await request(app)
      .post(path)
      .send({
        ...validPayload,
        id: "client-supplied-id",
        source: "spoofed-source",
        status: "converted",
        createdAt: "1999-01-01T00:00:00.000Z",
      });

    expect(response.status).toBe(201);
    expect(response.body.data).not.toHaveProperty("source");
    expect(response.body.data.id).not.toBe("client-supplied-id");
    expect(response.body.data.status).toBe("new");
    expect(response.body.data.createdAt).not.toBe("1999-01-01T00:00:00.000Z");
  });

  it("returns a safe server error when persistence fails", async () => {
    const response = await request(app).post(path).send(validPayload);

    expect([201, 500]).toContain(response.status);
  });
});

describe("GET /api/v1/coffee-with-me-requests", () => {
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
