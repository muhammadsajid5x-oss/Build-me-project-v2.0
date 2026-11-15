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

describe("Give Feedback analytics events", () => {
  it("accepts the Give Feedback viewed event", async () => {
    const response = await request(app)
      .post("/api/v1/analytics/events")
      .type("form")
      .send({
        name: "give.feedback.viewed",
        eventType: "view",
        path: "/",
      });

    expect(response.status).toBe(202);

    expect(valuesMock).toHaveBeenCalledWith({
      name: "give.feedback.viewed",
      eventType: "view",
      properties: {
        feature: "give-feedback",
        data: {
          action: "viewed",
          path: "/",
        },
      },
    });
  });

  it("accepts the Give Feedback clicked event", async () => {
    const response = await request(app)
      .post("/api/v1/analytics/events")
      .type("form")
      .send({
        name: "give.feedback.clicked",
        eventType: "click",
      });

    expect(response.status).toBe(202);

    expect(valuesMock).toHaveBeenCalledWith({
      name: "give.feedback.clicked",
      eventType: "click",
      properties: {
        feature: "give-feedback",
        data: {
          action: "clicked",
        },
      },
    });
  });

  it("accepts the Give Feedback completed event", async () => {
    const response = await request(app)
      .post("/api/v1/analytics/events")
      .type("form")
      .send({
        name: "give.feedback.completed",
        eventType: "click",
      });

    expect(response.status).toBe(202);

    expect(valuesMock).toHaveBeenCalledWith({
      name: "give.feedback.completed",
      eventType: "click",
      properties: {
        feature: "give-feedback",
        data: {
          action: "completed",
        },
      },
    });
  });

  it("rejects the viewed event with the wrong event type", async () => {
    const response = await request(app)
      .post("/api/v1/analytics/events")
      .type("form")
      .send({
        name: "give.feedback.viewed",
        eventType: "click",
        path: "/",
      });

    expect(response.status).toBe(400);
    expect(valuesMock).not.toHaveBeenCalled();
  });
});
