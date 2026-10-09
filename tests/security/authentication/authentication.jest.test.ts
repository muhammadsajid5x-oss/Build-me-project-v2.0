import request from "supertest";
const API_URL = "http://localhost:3000";
describe("Authentication Security", () => {
  it("rejects requests without an authorization header", async () => {
    const response = await request(API_URL).get("/api/v1/auth/me");
    expect(response.status).toBe(401);
  });
  it("rejects an invalid bearer token", async () => {
    const response = await request(API_URL)
      .get("/api/v1/auth/me")
      .set("Authorization", "Bearer invalid-token");
    expect(response.status).toBe(401);
  });
  it("rejects an unsupported authorization scheme", async () => {
    const response = await request(API_URL)
      .get("/api/v1/auth/me")
      .set("Authorization", "Basic invalid-token");
    expect(response.status).toBe(401);
  });
});
