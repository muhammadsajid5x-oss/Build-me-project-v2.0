import request from "supertest";

const API_URL = process.env.API_URL || "http://localhost:3000";

describe("About API", () => {
  it("accepts the About CTA analytics event", async () => {
    const response = await request(API_URL)
      .post("/api/v1/analytics/events")
      .type("form")
      .send({
        name: "about.cta.clicked",
        eventType: "click",
        path: "/",
      });

    expect(response.status).toBe(202);
  });
});
