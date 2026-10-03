import request from "supertest";
import app from "../../../services/api/src/app.js";

const path = "/api/v1/foundation-checkins";

describe("POST /api/v1/foundation-checkins", () => {
  it("creates a check-in for a valid name", async () => {
    const response = await request(app)
      .post(path)
      .send({ name: "  Ada Lovelace  ", ignored: "not stored" });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      data: {
        id: expect.any(String),
        name: "Ada Lovelace",
        createdAt: expect.any(String),
      },
    });
    expect(Number.isNaN(Date.parse(response.body.data.createdAt))).toBe(false);
  });

  it.each([
    ["missing", {}],
    ["empty", { name: "   " }],
    ["not a string", { name: 42 }],
    ["too long", { name: "a".repeat(81) }],
  ])("rejects a name that is %s", async (_label, body) => {
    const response = await request(app).post(path).send(body);

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(response.body.error.details[0].field).toBe("name");
  });
});
