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

describe("Navbar analytics event endpoint", () => {
  it("stores only the allowlisted anonymous Home event", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      body: new URLSearchParams({
        name: "navbar.home.clicked",
        eventType: "click",
      }),
    });

    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({ data: { accepted: true } });
    expect(insertMock).toHaveBeenCalledOnce();
    expect(valuesMock).toHaveBeenCalledWith({
      name: "navbar.home.clicked",
      eventType: "click",
      properties: {
        feature: "navbar",
        data: { destination: "/" },
      },
    });
  });

  it("ignores untrusted properties", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      body: new URLSearchParams({
        name: "navbar.home.clicked",
        eventType: "click",
        userId: "untrusted-user-id",
      }),
    });

    expect(response.status).toBe(202);
    expect(valuesMock).toHaveBeenCalledWith({
      name: "navbar.home.clicked",
      eventType: "click",
      properties: {
        feature: "navbar",
        data: { destination: "/" },
      },
    });
  });

  it("infers the allowlisted click type for older clients", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      body: new URLSearchParams({ name: "navbar.home.clicked" }),
    });

    expect(response.status).toBe(202);
    expect(valuesMock).toHaveBeenCalledWith({
      name: "navbar.home.clicked",
      eventType: "click",
      properties: {
        feature: "navbar",
        data: { destination: "/" },
      },
    });
  });

  it("stores anonymous page views with their route", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      body: new URLSearchParams({
        name: "page.viewed",
        eventType: "view",
        path: "/route-test",
      }),
    });

    expect(response.status).toBe(202);
    expect(valuesMock).toHaveBeenCalledWith({
      name: "page.viewed",
      eventType: "view",
      properties: {
        feature: "page",
        data: { path: "/route-test" },
      },
    });
  });

  it("rejects event names outside the allowlist", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "arbitrary.event", eventType: "view" }),
    });

    expect(response.status).toBe(400);
    expect(valuesMock).not.toHaveBeenCalled();
  });

  it("returns a generic server error when persistence fails", async () => {
    valuesMock.mockRejectedValueOnce(new Error("database secret"));

    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "navbar.home.clicked",
        eventType: "click",
      }),
    });

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred.",
      },
    });
  });
});

describe("Deliver My Project analytics events", () => {
  it("stores the Work With Me click event with the delivery project properties", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      body: new URLSearchParams({
        name: "work.with.me.clicked",
        eventType: "click",
      }),
    });

    expect(response.status).toBe(202);
    expect(insertMock).toHaveBeenCalledOnce();
    expect(valuesMock).toHaveBeenCalledWith({
      name: "work.with.me.clicked",
      eventType: "click",
      properties: {
        feature: "deliver-my-project",
        data: { destination: "/deliver-my-project" },
      },
    });
  });

  it("stores the Deliver My Project click event with the delivery project properties", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      body: new URLSearchParams({
        name: "deliver.my.project.clicked",
        eventType: "click",
      }),
    });

    expect(response.status).toBe(202);
    expect(insertMock).toHaveBeenCalledOnce();
    expect(valuesMock).toHaveBeenCalledWith({
      name: "deliver.my.project.clicked",
      eventType: "click",
      properties: {
        feature: "deliver-my-project",
        data: { destination: "/deliver-my-project" },
      },
    });
  });

  it("stores the Deliver My Project view event with its route", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      body: new URLSearchParams({
        name: "deliver.my.project.viewed",
        eventType: "view",
        path: "/deliver-my-project",
      }),
    });

    expect(response.status).toBe(202);
    expect(insertMock).toHaveBeenCalledOnce();
    expect(valuesMock).toHaveBeenCalledWith({
      name: "deliver.my.project.viewed",
      eventType: "view",
      properties: {
        feature: "page",
        data: { path: "/deliver-my-project" },
      },
    });
  });

  it("stores the completed click event with the delivery project properties", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      body: new URLSearchParams({
        name: "deliver.my.project.completed",
        eventType: "click",
      }),
    });

    expect(response.status).toBe(202);
    expect(insertMock).toHaveBeenCalledOnce();
    expect(valuesMock).toHaveBeenCalledWith({
      name: "deliver.my.project.completed",
      eventType: "click",
      properties: {
        feature: "deliver-my-project",
        data: { destination: "/deliver-my-project" },
      },
    });
  });

  it("rejects the Work With Me event when the event type does not match", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      body: new URLSearchParams({
        name: "work.with.me.clicked",
        eventType: "view",
      }),
    });

    expect(response.status).toBe(400);
    expect(valuesMock).not.toHaveBeenCalled();
  });

  it("rejects the Deliver My Project view event when the route is missing", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      body: new URLSearchParams({
        name: "deliver.my.project.viewed",
        eventType: "view",
      }),
    });

    expect(response.status).toBe(400);
    expect(valuesMock).not.toHaveBeenCalled();
  });

  it("rejects the removed delivery journey started event", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      body: new URLSearchParams({
        name: "deliver-my-project.started",
        eventType: "click",
      }),
    });

    expect(response.status).toBe(400);
    expect(valuesMock).not.toHaveBeenCalled();
  });
});
