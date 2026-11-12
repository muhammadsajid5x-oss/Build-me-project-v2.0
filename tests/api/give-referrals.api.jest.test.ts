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

describe("POST /api/v1/analytics/events — Give Referrals", () => {
  it("accepts the Give Referrals viewed event", async () => {
    const response = await request(app).post(path).type("form").send({
      name: "give.referrals.viewed",
      eventType: "view",
      path: "/",
    });

    expect(response.status).toBe(202);

    expect(valuesMock).toHaveBeenCalledWith({
      name: "give.referrals.viewed",
      eventType: "view",
      properties: {
        feature: "give-referrals",
        data: {
          action: "viewed",
          path: "/",
        },
      },
    });
  });

  it("accepts the Give Referrals clicked event", async () => {
    const response = await request(app).post(path).type("form").send({
      name: "give.referrals.clicked",
      eventType: "click",
    });

    expect(response.status).toBe(202);

    expect(valuesMock).toHaveBeenCalledWith({
      name: "give.referrals.clicked",
      eventType: "click",
      properties: {
        feature: "give-referrals",
        data: {
          action: "clicked",
        },
      },
    });
  });

  it("accepts the Give Referrals step one completed event", async () => {
    const response = await request(app).post(path).type("form").send({
      name: "give.referrals.step.one.completed",
      eventType: "click",
    });

    expect(response.status).toBe(202);

    expect(valuesMock).toHaveBeenCalledWith({
      name: "give.referrals.step.one.completed",
      eventType: "click",
      properties: {
        feature: "give-referrals",
        data: {
          action: "step-one-completed",
        },
      },
    });
  });

  it("accepts the Give Referrals step two completed event", async () => {
    const response = await request(app).post(path).type("form").send({
      name: "give.referrals.step.two.completed",
      eventType: "click",
    });

    expect(response.status).toBe(202);

    expect(valuesMock).toHaveBeenCalledWith({
      name: "give.referrals.step.two.completed",
      eventType: "click",
      properties: {
        feature: "give-referrals",
        data: {
          action: "step-two-completed",
        },
      },
    });
  });

  it("accepts the Give Referrals completed event", async () => {
    const response = await request(app).post(path).type("form").send({
      name: "give.referrals.completed",
      eventType: "click",
    });

    expect(response.status).toBe(202);

    expect(valuesMock).toHaveBeenCalledWith({
      name: "give.referrals.completed",
      eventType: "click",
      properties: {
        feature: "give-referrals",
        data: {
          action: "completed",
        },
      },
    });
  });

  it("rejects the Give Referrals viewed event with the wrong event type", async () => {
    const response = await request(app).post(path).type("form").send({
      name: "give.referrals.viewed",
      eventType: "click",
      path: "/",
    });

    expect(response.status).toBe(400);
    expect(valuesMock).not.toHaveBeenCalled();
  });

  it("rejects the Give Referrals viewed event without a valid path", async () => {
    const response = await request(app).post(path).type("form").send({
      name: "give.referrals.viewed",
      eventType: "view",
    });

    expect(response.status).toBe(400);
    expect(valuesMock).not.toHaveBeenCalled();
  });

  it("rejects an unknown Give Referrals event", async () => {
    const response = await request(app).post(path).type("form").send({
      name: "give.referrals.invalid",
      eventType: "click",
    });

    expect(response.status).toBe(400);
    expect(valuesMock).not.toHaveBeenCalled();
  });
});
