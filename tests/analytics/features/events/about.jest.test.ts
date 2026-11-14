import request from "supertest";

const API_URL = process.env.API_URL || "http://localhost:3000";

describe("About analytics", () => {
  it("accepts About analytics events", async () => {
    const events = [
      "about.cta.clicked",
      "about.terms.clicked",
      "about.privacy.clicked",
      "about.cookie.clicked",
    ];

    for (const name of events) {
      const response = await request(API_URL)
        .post("/api/v1/analytics/events")
        .type("form")
        .send({
          name,
          eventType: "click",
          path: "/about",
        });

      expect(response.status).toBe(202);
    }
  }, 15000);
});
