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

describe("Ownership Learning Circle analytics events", () => {
  it("stores the ownership.learning.circle.clicked event", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      body: new URLSearchParams({
        name: "ownership.learning.circle.clicked",
        eventType: "click",
        path: "/",
      }),
    });

    expect(response.status).toBe(202);

    const json = await response.json();

    expect(json).toEqual({
      data: { accepted: true },
    });

    expect(insertMock).toHaveBeenCalledTimes(1);

    expect(valuesMock).toHaveBeenCalledWith({
      name: "ownership.learning.circle.clicked",
      eventType: "click",
      properties: {
        feature: "ownership-learning-circle",
        data: {
          action: "open",
        },
      },
    });
  });

  it("stores the circle.view event", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      body: new URLSearchParams({
        name: "circle.view",
        eventType: "view",
        path: "/",
      }),
    });

    expect(response.status).toBe(202);

    expect(valuesMock).toHaveBeenCalledWith({
      name: "circle.view",
      eventType: "view",
      properties: {
        feature: "page",
        data: {
          path: "/",
        },
      },
    });
  });

  it("stores the circle.join.click event", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      body: new URLSearchParams({
        name: "circle.join.click",
        eventType: "click",
        path: "/",
      }),
    });

    expect(response.status).toBe(202);

    expect(valuesMock).toHaveBeenCalledWith({
      name: "circle.join.click",
      eventType: "click",
      properties: {
        feature: "ownership-learning-circle",
        data: {
          action: "join",
        },
      },
    });
  });

  it("stores the circle.telegram.redirect event", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      body: new URLSearchParams({
        name: "circle.telegram.redirect",
        eventType: "click",
        path: "/",
      }),
    });

    expect(response.status).toBe(202);

    expect(valuesMock).toHaveBeenCalledWith({
      name: "circle.telegram.redirect",
      eventType: "click",
      properties: {
        feature: "ownership-learning-circle",
        data: {
          action: "telegram-redirect",
        },
      },
    });
  });

  it("rejects ownership.learning.circle.clicked with the wrong event type", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      body: new URLSearchParams({
        name: "ownership.learning.circle.clicked",
        eventType: "view",
        path: "/",
      }),
    });

    expect(response.status).toBe(400);
    expect(valuesMock).not.toHaveBeenCalled();
  });

  it("rejects circle.view with the wrong event type", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      body: new URLSearchParams({
        name: "circle.view",
        eventType: "click",
        path: "/",
      }),
    });

    expect(response.status).toBe(400);
    expect(valuesMock).not.toHaveBeenCalled();
  });

  it("rejects circle.view when the route is missing", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      body: new URLSearchParams({
        name: "circle.view",
        eventType: "view",
      }),
    });

    expect(response.status).toBe(400);
    expect(valuesMock).not.toHaveBeenCalled();
  });

  it("rejects circle.join.click with the wrong event type", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      body: new URLSearchParams({
        name: "circle.join.click",
        eventType: "view",
        path: "/",
      }),
    });

    expect(response.status).toBe(400);
    expect(valuesMock).not.toHaveBeenCalled();
  });

  it("rejects circle.telegram.redirect with the wrong event type", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      body: new URLSearchParams({
        name: "circle.telegram.redirect",
        eventType: "view",
        path: "/",
      }),
    });

    expect(response.status).toBe(400);
    expect(valuesMock).not.toHaveBeenCalled();
  });
});
