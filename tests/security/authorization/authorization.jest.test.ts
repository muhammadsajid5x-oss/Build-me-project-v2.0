import request from "supertest";
const API_URL = "http://localhost:3000";
describe("Authorization Security", () => {
  it("rejects access to protected resources without authentication", async () => {
    const response = await request(API_URL).get("/api/v1/auth/me");
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });
});
