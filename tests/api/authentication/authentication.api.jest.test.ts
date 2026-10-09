import request from "supertest";
import app from "../../../services/api/src/app";
describe("Authentication API", () => {
  describe("GET /api/v1/auth/me", () => {
    it("returns 401 when no authentication token is provided", async () => {
      const response = await request(app).get("/api/v1/auth/me");
      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication is required.",
        },
      });
    });
    it("returns 401 when the authorization header is malformed", async () => {
      const response = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", "InvalidToken");
      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication is required.",
        },
      });
    });
    it("returns 401 when a bearer token is invalid", async () => {
      const response = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", "Bearer invalid-token");
      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication is required.",
        },
      });
    });
    it("does not allow POST on the authentication endpoint", async () => {
      const response = await request(app).post("/api/v1/auth/me");
      expect(response.status).toBe(404);
    });
  });
});
