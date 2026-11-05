import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { insertMock, valuesMock } = vi.hoisted(() => ({
  insertMock: vi.fn(),
  valuesMock: vi.fn(),
}));

vi.mock("../../../../database/dist/drizzle/client.js", () => ({
  db: { insert: insertMock },
}));

vi.mock("../../../../database/dist/schema/analytics-events.js", () => ({
  analyticsEvents: { name: "analytics_events" },
}));

import app from "../../src/app.js";

let server: ReturnType<typeof app.listen>;
let baseUrl: string;

beforeEach(() => {
  vi.clearAllMocks();

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
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

describe("Ownership Toolkit analytics events", () => {
  const endpoint = "/api/v1/analytics/events";

  it("accepts and stores the Ownership Toolkit clicked event", async () => {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: "POST",
      body: new URLSearchParams({
        name: "ownership.toolkit.clicked",
        eventType: "click",
      }),
    });

    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({
      data: { accepted: true },
    });

    expect(insertMock).toHaveBeenCalledOnce();

    expect(valuesMock).toHaveBeenCalledWith({
      name: "ownership.toolkit.clicked",
      eventType: "click",
      properties: {
        feature: "ownership-toolkit",
        data: { action: "clicked" },
      },
    });
  });

  it("accepts and stores the Ownership Toolkit viewed event with its route", async () => {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: "POST",
      body: new URLSearchParams({
        name: "ownership.toolkit.viewed",
        eventType: "view",
        path: "/ownership-toolkit",
      }),
    });

    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({
      data: { accepted: true },
    });

    expect(insertMock).toHaveBeenCalledOnce();

    expect(valuesMock).toHaveBeenCalledWith({
      name: "ownership.toolkit.viewed",
      eventType: "view",
      properties: {
        feature: "page",
        data: { path: "/ownership-toolkit" },
      },
    });
  });

  it("accepts and stores the Ownership Toolkit completed event", async () => {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: "POST",
      body: new URLSearchParams({
        name: "ownership.toolkit.completed",
        eventType: "click",
      }),
    });

    expect(response.status).toBe(202);

    expect(valuesMock).toHaveBeenCalledWith({
      name: "ownership.toolkit.completed",
      eventType: "click",
      properties: {
        feature: "ownership-toolkit",
        data: { action: "completed" },
      },
    });
  });

  it("accepts and stores the Ownership Toolkit downloaded event", async () => {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: "POST",
      body: new URLSearchParams({
        name: "ownership.toolkit.downloaded",
        eventType: "click",
      }),
    });

    expect(response.status).toBe(202);

    expect(valuesMock).toHaveBeenCalledWith({
      name: "ownership.toolkit.downloaded",
      eventType: "click",
      properties: {
        feature: "ownership-toolkit",
        data: { action: "downloaded" },
      },
    });
  });

  it("rejects the clicked event when the event type is incorrect", async () => {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: "POST",
      body: new URLSearchParams({
        name: "ownership.toolkit.clicked",
        eventType: "view",
      }),
    });

    expect(response.status).toBe(400);
    expect(valuesMock).not.toHaveBeenCalled();
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rejects the viewed event when its route is missing", async () => {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: "POST",
      body: new URLSearchParams({
        name: "ownership.toolkit.viewed",
        eventType: "view",
      }),
    });

    expect(response.status).toBe(400);
    expect(valuesMock).not.toHaveBeenCalled();
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rejects an invalid external route for the viewed event", async () => {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: "POST",
      body: new URLSearchParams({
        name: "ownership.toolkit.viewed",
        eventType: "view",
        path: "//example.com",
      }),
    });

    expect(response.status).toBe(400);
    expect(valuesMock).not.toHaveBeenCalled();
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rejects an event name outside the analytics allowlist", async () => {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: "POST",
      body: new URLSearchParams({
        name: "ownership.toolkit.deleted",
        eventType: "click",
      }),
    });

    expect(response.status).toBe(400);
    expect(valuesMock).not.toHaveBeenCalled();
    expect(insertMock).not.toHaveBeenCalled();
  });
});
