/**
 * @jest-environment node
 */

import request from "supertest";

import app from "../../../../services/api/src/app.js";

const { insertMock, valuesMock } = (() => {
  const im = jest.fn();
  const vm = jest.fn();

  return {
    insertMock: im,
    valuesMock: vm,
  };
})();

jest.mock("../../../../database/dist/drizzle/client.js", () => ({
  db: {
    insert: insertMock,
  },
}));

jest.mock("../../../../database/dist/schema/analytics-events.js", () => ({
  analyticsEvents: {
    name: "analytics_events",
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
  valuesMock.mockResolvedValue(undefined);
  insertMock.mockReturnValue({
    values: valuesMock,
  });
});

describe("About analytics", () => {
  it("accepts About analytics events", async () => {
    const events = [
      "about.cta.clicked",
      "about.terms.clicked",
      "about.privacy.clicked",
      "about.cookie.clicked",
    ];

    for (const name of events) {
      const response = await request(app)
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
