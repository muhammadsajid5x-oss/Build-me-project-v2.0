import request from "supertest";
import app from "../../../services/api/src/app.js";

// Mock the database client used by createOwnershipLearningCircleRequest
jest.mock("../../../database/dist/drizzle/client.js", () => ({
  db: {
    insert: jest.fn(() => ({
      values: jest.fn(() => ({
        returning: jest.fn(() =>
          Promise.resolve([
            {
              id: "circle-test-id-123",
              name: "Ada Lovelace",
              email: "ada@example.com",
              source: "ownership-learning-circle",
              status: "new",
              createdAt: new Date(),
            },
          ]),
        ),
      })),
    })),
    select: jest.fn(() => ({
      from: jest.fn(() => ({
        where: jest.fn(() => ({
          orderBy: jest.fn(() =>
            Promise.resolve([
              {
                id: "circle-test-id-123",
                name: "Ada Lovelace",
                email: "ada@example.com",
                status: "new",
                createdAt: new Date(),
              },
            ]),
          ),
        })),
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
  },
}));

const path = "/api/v1/ownership-learning-circle-requests";

const validPayload = {
  name: "Ada Lovelace",
  email: "ada@example.com",
};

describe("POST /api/v1/ownership-learning-circle-requests", () => {
  it("accepts a valid Ownership Learning Circle request", async () => {
    const response = await request(app).post(path).send(validPayload);

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({
      name: "Ada Lovelace",
      email: "ada@example.com",
      status: "new",
    });
    expect(response.body.data.id).toBeDefined();
    expect(response.body.data.createdAt).toBeDefined();
  });

  it("rejects an invalid Ownership Learning Circle request", async () => {
    const response = await request(app).post(path).send({
      name: "",
      email: "invalid-email",
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

  it("normalizes the visitor email before persistence", async () => {
    const response = await request(app).post(path).send({
      name: "Ada Lovelace",
      email: "ADA@EXAMPLE.COM",
    });

    expect(response.status).toBe(201);
    expect(response.body.data.email).toBe("ada@example.com");
  });
});

describe("GET /api/v1/ownership-learning-circle-requests", () => {
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
