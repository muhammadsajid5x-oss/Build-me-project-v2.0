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

describe("POST /api/v1/analytics/events — Share This Page", () => {
  it("accepts the Share This Page viewed event", async () => {
    const response = await request(app).post(path).type("form").send({
      name: "share.this.page.viewed",
      eventType: "view",
      path: "/",
    });

    expect(response.status).toBe(202);

    expect(valuesMock).toHaveBeenCalledWith({
      name: "share.this.page.viewed",
      eventType: "view",
      properties: {
        feature: "share-this-page",
        data: {
          action: "viewed",
          path: "/",
        },
      },
    });
  });

  it("accepts the Share This Page clicked event", async () => {
    const response = await request(app).post(path).type("form").send({
      name: "share.this.page.clicked",
      eventType: "click",
    });

    expect(response.status).toBe(202);

    expect(valuesMock).toHaveBeenCalledWith({
      name: "share.this.page.clicked",
      eventType: "click",
      properties: {
        feature: "share-this-page",
        data: {
          action: "clicked",
        },
      },
    });
  });

  const channelEvents = [
    ["facebook", "share.this.page.facebook.clicked"],
    ["instagram", "share.this.page.instagram.clicked"],
    ["twitter", "share.this.page.twitter.clicked"],
    ["linkedin", "share.this.page.linkedin.clicked"],
    ["pinterest", "share.this.page.pinterest.clicked"],
    ["tiktok", "share.this.page.tiktok.clicked"],
    ["telegram", "share.this.page.telegram.clicked"],
    ["whatsapp", "share.this.page.whatsapp.clicked"],
    ["youtube", "share.this.page.youtube.clicked"],
    ["snapchat", "share.this.page.snapchat.clicked"],
    ["email", "share.this.page.email.clicked"],
    ["app", "share.this.page.app.clicked"],
    ["copy-link", "share.this.page.copy.link.clicked"],
  ] as const;

  it.each(channelEvents)(
    "accepts the Share This Page %s channel click event",
    async (channel, eventName) => {
      const response = await request(app).post(path).type("form").send({
        name: eventName,
        eventType: "click",
      });

      expect(response.status).toBe(202);

      expect(valuesMock).toHaveBeenCalledWith({
        name: eventName,
        eventType: "click",
        properties: {
          feature: "share-this-page",
          data: {
            action: `${channel}-clicked`,
          },
        },
      });
    },
  );

  it("rejects a Share This Page viewed event with the wrong event type", async () => {
    const response = await request(app).post(path).type("form").send({
      name: "share.this.page.viewed",
      eventType: "click",
      path: "/",
    });

    expect(response.status).toBe(400);
    expect(valuesMock).not.toHaveBeenCalled();
  });

  it("rejects a Share This Page viewed event without a valid path", async () => {
    const response = await request(app).post(path).type("form").send({
      name: "share.this.page.viewed",
      eventType: "view",
    });

    expect(response.status).toBe(400);
    expect(valuesMock).not.toHaveBeenCalled();
  });

  it("rejects an unknown Share This Page event", async () => {
    const response = await request(app).post(path).type("form").send({
      name: "share.this.page.invalid",
      eventType: "click",
    });

    expect(response.status).toBe(400);
    expect(valuesMock).not.toHaveBeenCalled();
  });
});
