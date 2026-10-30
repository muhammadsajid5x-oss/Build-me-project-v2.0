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

describe("Ownership Audit analytics events", () => {
  it("stores the ownership.audit.clicked event", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      body: new URLSearchParams({
        name: "ownership.audit.clicked",
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
      name: "ownership.audit.clicked",
      eventType: "click",
      properties: {
        feature: "ownership-audit",
        data: {
          action: "clicked",
        },
      },
    });
  });

  it("stores the ownership.audit.viewed event", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      body: new URLSearchParams({
        name: "ownership.audit.viewed",
        eventType: "view",
        path: "/ownership-audits",
      }),
    });

    expect(response.status).toBe(202);

    expect(valuesMock).toHaveBeenCalledWith({
      name: "ownership.audit.viewed",
      eventType: "view",
      properties: {
        feature: "page",
        data: {
          path: "/ownership-audits",
        },
      },
    });
  });

  it("stores the ownership.audit.started event", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      body: new URLSearchParams({
        name: "ownership.audit.started",
        eventType: "click",
        path: "/ownership-audits",
      }),
    });

    expect(response.status).toBe(202);

    expect(valuesMock).toHaveBeenCalledWith({
      name: "ownership.audit.started",
      eventType: "click",
      properties: {
        feature: "ownership-audit",
        data: {
          action: "started",
        },
      },
    });
  });

  it("stores the ownership.audit.completed event", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      body: new URLSearchParams({
        name: "ownership.audit.completed",
        eventType: "click",
        path: "/ownership-audits",
      }),
    });

    expect(response.status).toBe(202);

    expect(valuesMock).toHaveBeenCalledWith({
      name: "ownership.audit.completed",
      eventType: "click",
      properties: {
        feature: "ownership-audit",
        data: {
          action: "completed",
        },
      },
    });
  });

  it("rejects ownership.audit.clicked with the wrong event type", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      body: new URLSearchParams({
        name: "ownership.audit.clicked",
        eventType: "view",
        path: "/",
      }),
    });

    expect(response.status).toBe(400);
    expect(valuesMock).not.toHaveBeenCalled();
  });

  it("rejects ownership.audit.viewed when the route is missing", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      body: new URLSearchParams({
        name: "ownership.audit.viewed",
        eventType: "view",
      }),
    });

    expect(response.status).toBe(400);
    expect(valuesMock).not.toHaveBeenCalled();
  });
});
