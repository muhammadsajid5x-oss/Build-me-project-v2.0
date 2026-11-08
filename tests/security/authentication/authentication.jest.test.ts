import request from "supertest";

const API_URL = process.env.API_URL || "http://localhost:3000";

describe("Authentication Security", () => {
  // Set default timeout for all tests in this suite to 10 seconds
  jest.setTimeout(10000);

  it("rejects requests without an authorization header", async () => {
    const response = await request(API_URL)
      .get("/api/v1/auth/me")
      .timeout({ response: 4000, deadline: 5000 });

    expect(response.status).toBe(401);
  });

  it("rejects an invalid bearer token", async () => {
    const response = await request(API_URL)
      .get("/api/v1/auth/me")
      .set("Authorization", "Bearer invalid-token")
      .timeout({ response: 4000, deadline: 5000 });

    expect(response.status).toBe(401);
  }, 10000);

  it("rejects an unsupported authorization scheme", async () => {
    const response = await request(API_URL)
      .get("/api/v1/auth/me")
      .set("Authorization", "Basic invalid-token")
      .timeout({ response: 4000, deadline: 5000 });

    expect(response.status).toBe(401);
  });
});
