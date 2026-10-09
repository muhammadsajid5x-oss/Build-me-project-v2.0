import request from "supertest";
const API_URL = "http://localhost:3000";
describe("API Security", () => {
  it("rejects requests with an invalid authorization header", async () => {
    const response = await request(API_URL)
      .get("/api/v1/auth/me")
      .set("Authorization", "Bearer invalid-token");
    expect(response.status).toBe(401);
  });
  it("does not expose the Express x-powered-by header", async () => {
    const response = await request(API_URL).get("/health");
    expect(response.headers["x-powered-by"]).toBeUndefined();
  });
  it("returns security headers", async () => {
    const response = await request(API_URL).get("/health");
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
  });
});
