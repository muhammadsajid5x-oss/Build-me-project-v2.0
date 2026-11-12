/**
 * @jest-environment node
 */
import app from "../../../../services/api/src/app.js";

const { insertMock, valuesMock } = (() => {
  const im = jest.fn();
  const vm = jest.fn();

  return { insertMock: im, valuesMock: vm };
})();

jest.mock("../../../../database/dist/drizzle/client.js", () => ({
  db: { insert: insertMock },
}));

jest.mock("../../../../database/dist/schema/analytics-events.js", () => ({
  analyticsEvents: { name: "analytics_events" },
}));

let server: ReturnType<typeof app.listen>;
let baseUrl: string;

beforeEach(() => {
  jest.clearAllMocks();

  valuesMock.mockResolvedValue(undefined);
  insertMock.mockReturnValue({ values: valuesMock });

  server = app.listen(0);

  const address = server.address();

  if (!address || typeof address === "string") {
    throw new Error("API server did not bind to a TCP port.");
  }

  baseUrl = `http://127.0.0.1:${address.port}`;
});

afterEach(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error?: Error) => (error ? reject(error) : resolve()));
  });
});

describe("Share This Page analytics events", () => {
  const clickEvents = [
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

  it("stores the share.this.page.viewed event", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      body: new URLSearchParams({
        name: "share.this.page.viewed",
        eventType: "view",
        path: "/",
      }),
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

  it("stores the share.this.page.clicked event", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      body: new URLSearchParams({
        name: "share.this.page.clicked",
        eventType: "click",
        path: "/",
      }),
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

  it.each(clickEvents)(
    "stores the %s channel analytics event",
    async (channel, eventName) => {
      const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
        method: "POST",
        body: new URLSearchParams({
          name: eventName,
          eventType: "click",
          path: "/",
        }),
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

  it("rejects share.this.page.viewed with the wrong event type", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      body: new URLSearchParams({
        name: "share.this.page.viewed",
        eventType: "click",
        path: "/",
      }),
    });

    expect(response.status).toBe(400);
    expect(valuesMock).not.toHaveBeenCalled();
  });

  it("rejects a share channel event with the wrong event type", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      body: new URLSearchParams({
        name: "share.this.page.facebook.clicked",
        eventType: "view",
        path: "/",
      }),
    });

    expect(response.status).toBe(400);
    expect(valuesMock).not.toHaveBeenCalled();
  });
});
