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

describe("Mentor Me analytics events", () => {
  it("stores the mentor.me.clicked event", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      body: new URLSearchParams({
        name: "mentor.me.clicked",
        eventType: "click",
      }),
    });

    expect(response.status).toBe(202);
    const json = await response.json();
    expect(json).toEqual({ data: { accepted: true } });
    expect(insertMock).toHaveBeenCalledTimes(1);
    expect(valuesMock).toHaveBeenCalledWith({
      name: "mentor.me.clicked",
      eventType: "click",
      properties: {
        feature: "mentor-me",
        data: { action: "clicked" },
      },
    });
  });

  it("stores the mentor.me.viewed event with its route", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      body: new URLSearchParams({
        name: "mentor.me.viewed",
        eventType: "view",
        path: "/mentor-me",
      }),
    });

    expect(response.status).toBe(202);
    expect(insertMock).toHaveBeenCalledTimes(1);
    expect(valuesMock).toHaveBeenCalledWith({
      name: "mentor.me.viewed",
      eventType: "view",
      properties: {
        feature: "page",
        data: { path: "/mentor-me" },
      },
    });
  });

  it("stores the mentor.me.submitted event", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      body: new URLSearchParams({
        name: "mentor.me.submitted",
        eventType: "click",
      }),
    });

    expect(response.status).toBe(202);
    expect(insertMock).toHaveBeenCalledTimes(1);
    expect(valuesMock).toHaveBeenCalledWith({
      name: "mentor.me.submitted",
      eventType: "click",
      properties: {
        feature: "mentor-me",
        data: { action: "submitted" },
      },
    });
  });

  it("stores the mentor.me.completed event", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      body: new URLSearchParams({
        name: "mentor.me.completed",
        eventType: "click",
      }),
    });

    expect(response.status).toBe(202);
    expect(insertMock).toHaveBeenCalledTimes(1);
    expect(valuesMock).toHaveBeenCalledWith({
      name: "mentor.me.completed",
      eventType: "click",
      properties: {
        feature: "mentor-me",
        data: { action: "completed" },
      },
    });
  });

  it("rejects mentor.me.clicked when event type does not match", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      body: new URLSearchParams({
        name: "mentor.me.clicked",
        eventType: "view",
      }),
    });

    expect(response.status).toBe(400);
    expect(valuesMock).not.toHaveBeenCalled();
  });

  it("rejects mentor.me.viewed when route is missing", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      body: new URLSearchParams({
        name: "mentor.me.viewed",
        eventType: "view",
      }),
    });

    expect(response.status).toBe(400);
    expect(valuesMock).not.toHaveBeenCalled();
  });
});
