/**
 * @jest-environment node
 */
import request from "supertest";
import app from "../../services/api/src/app.js";
const { insertMock, valuesMock } = (() => {
  const im = jest.fn();
  const vm = jest.fn();
  return { insertMock: im, valuesMock: vm };
})();
jest.mock("../../database/dist/drizzle/client.js", () => ({
  db: { insert: insertMock },
}));
jest.mock("../../database/dist/schema/analytics-events.js", () => ({
  analyticsEvents: { name: "analytics_events" },
}));
const path = "/api/v1/analytics/events";
beforeEach(() => {
  jest.clearAllMocks();
  valuesMock.mockResolvedValue(undefined);
  insertMock.mockReturnValue({ values: valuesMock });
});
describe("POST /api/v1/analytics/events — Follow Us", () => {
  it("accepts a Follow Us LinkedIn click event", async () => {
    const response = await request(app)
      .post(path)
      .type("form")
      .send({
        name: "follow.us.linkedin.clicked",
        eventType: "click",
        path: "/",
      });
    expect(response.status).toBe(202);
    expect(valuesMock).toHaveBeenCalledWith({
      name: "follow.us.linkedin.clicked",
      eventType: "click",
      properties: {
        feature: "follow-us",
        data: {
          action: "linkedin-clicked",
        },
      },
    });
  });
  it("accepts the Follow Us viewed event", async () => {
    const response = await request(app)
      .post(path)
      .type("form")
      .send({
        name: "follow.us.viewed",
        eventType: "view",
        path: "/",
      });
    expect(response.status).toBe(202);
    expect(valuesMock).toHaveBeenCalledWith({
      name: "follow.us.viewed",
      eventType: "view",
      properties: {
        feature: "follow-us",
        data: {
          action: "viewed",
          path: "/",
        },
      },
    });
  });
  it("rejects a Follow Us viewed event with the wrong event type", async () => {
    const response = await request(app)
      .post(path)
      .type("form")
      .send({
        name: "follow.us.viewed",
        eventType: "click",
        path: "/",
      });
    expect(response.status).toBe(400);
    expect(valuesMock).not.toHaveBeenCalled();
  });
});
