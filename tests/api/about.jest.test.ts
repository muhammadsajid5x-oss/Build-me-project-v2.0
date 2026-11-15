/**
 * @jest-environment node
 */

import request from "supertest";

import app from "../../services/api/src/app.js";

const { insertMock, valuesMock } = (() => {
  const im = jest.fn();
  const vm = jest.fn();

  return {
    insertMock: im,
    valuesMock: vm,
  };
})();

jest.mock("../../database/dist/drizzle/client.js", () => ({
  db: {
    insert: insertMock,
  },
}));

jest.mock("../../database/dist/schema/analytics-events.js", () => ({
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

describe("About API", () => {
  it("accepts the About CTA analytics event", async () => {
    const response = await request(app)
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
