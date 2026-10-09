import request from "supertest";
import app from "../../services/api/src/app.js";

describe("API integration", () => {
  it("matches the documented GET /health contract", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "ok",
      service: "build-me-api",
    });
  });

  it("returns a consistent 404 error for an unknown route", async () => {
    const response = await request(app).get("/does-not-exist");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: {
        code: "NOT_FOUND",
        message: "The requested resource was not found.",
      },
    });
  });
});
