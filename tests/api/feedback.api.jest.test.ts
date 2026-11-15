/**
 * @jest-environment node
 */

import request from "supertest";

import app from "../../services/api/src/app.js";

describe("POST /api/v1/feedback", () => {
  it("rejects a feedback submission with an invalid email", async () => {
    const response = await request(app).post("/api/v1/feedback").send({
      type: "score",
      name: "Muhammad Sajid",
      email: "invalid-email",
      score: 8,
      content: "Test feedback",
    });

    expect(response.status).toBe(400);
  });

  it("rejects a feedback submission without required content", async () => {
    const response = await request(app).post("/api/v1/feedback").send({
      type: "score",
      name: "Muhammad Sajid",
      email: "sajid@example.com",
      score: 8,
    });

    expect(response.status).toBe(400);
  });
});
