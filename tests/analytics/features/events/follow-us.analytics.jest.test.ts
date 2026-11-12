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

describe("Follow Us analytics events", () => {
  it("stores the follow.us.viewed event", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      body: new URLSearchParams({
        name: "follow.us.viewed",
        eventType: "view",
        path: "/",
      }),
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

  it("stores the follow.us.clicked event", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      body: new URLSearchParams({
        name: "follow.us.clicked",
        eventType: "click",
        path: "/",
      }),
    });

    expect(response.status).toBe(202);

    expect(valuesMock).toHaveBeenCalledWith({
      name: "follow.us.clicked",
      eventType: "click",
      properties: {
        feature: "follow-us",
        data: {
          action: "clicked",
        },
      },
    });
  });

  it("stores the follow.us.whatsapp.clicked event", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      body: new URLSearchParams({
        name: "follow.us.whatsapp.clicked",
        eventType: "click",
        path: "/",
      }),
    });

    expect(response.status).toBe(202);

    expect(valuesMock).toHaveBeenCalledWith({
      name: "follow.us.whatsapp.clicked",
      eventType: "click",
      properties: {
        feature: "follow-us",
        data: {
          action: "whatsapp-clicked",
        },
      },
    });
  });

  it("stores the follow.us.telegram.clicked event", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      body: new URLSearchParams({
        name: "follow.us.telegram.clicked",
        eventType: "click",
        path: "/",
      }),
    });

    expect(response.status).toBe(202);

    expect(valuesMock).toHaveBeenCalledWith({
      name: "follow.us.telegram.clicked",
      eventType: "click",
      properties: {
        feature: "follow-us",
        data: {
          action: "telegram-clicked",
        },
      },
    });
  });

  it("stores the follow.us.linkedin.clicked event", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      body: new URLSearchParams({
        name: "follow.us.linkedin.clicked",
        eventType: "click",
        path: "/",
      }),
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

  it("stores the follow.us.facebook.clicked event", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      body: new URLSearchParams({
        name: "follow.us.facebook.clicked",
        eventType: "click",
        path: "/",
      }),
    });

    expect(response.status).toBe(202);

    expect(valuesMock).toHaveBeenCalledWith({
      name: "follow.us.facebook.clicked",
      eventType: "click",
      properties: {
        feature: "follow-us",
        data: {
          action: "facebook-clicked",
        },
      },
    });
  });

  it("stores the follow.us.youtube.clicked event", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      body: new URLSearchParams({
        name: "follow.us.youtube.clicked",
        eventType: "click",
        path: "/",
      }),
    });

    expect(response.status).toBe(202);

    expect(valuesMock).toHaveBeenCalledWith({
      name: "follow.us.youtube.clicked",
      eventType: "click",
      properties: {
        feature: "follow-us",
        data: {
          action: "youtube-clicked",
        },
      },
    });
  });

  it("rejects follow.us.viewed with the wrong event type", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      body: new URLSearchParams({
        name: "follow.us.viewed",
        eventType: "click",
        path: "/",
      }),
    });

    expect(response.status).toBe(400);
    expect(valuesMock).not.toHaveBeenCalled();
  });

  it("rejects follow.us.whatsapp.clicked with the wrong event type", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      body: new URLSearchParams({
        name: "follow.us.whatsapp.clicked",
        eventType: "view",
        path: "/",
      }),
    });

    expect(response.status).toBe(400);
    expect(valuesMock).not.toHaveBeenCalled();
  });
});
