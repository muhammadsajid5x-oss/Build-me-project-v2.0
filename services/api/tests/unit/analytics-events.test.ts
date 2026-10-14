import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { insertMock, valuesMock } = vi.hoisted(() => ({
  insertMock: vi.fn(),
  valuesMock: vi.fn(),
}));

vi.mock("@build-me/database/drizzle/client", () => ({
  db: { insert: insertMock },
}));

vi.mock("@build-me/database/schema/analytics-events", () => ({
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
      body: new URLSearchParams({ name: "navbar.home.clicked" }),
    });

    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({ data: { accepted: true } });
    expect(insertMock).toHaveBeenCalledOnce();
    expect(valuesMock).toHaveBeenCalledWith({
      name: "navbar.home.clicked",
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
        userId: "untrusted-user-id",
      }),
    });

    expect(response.status).toBe(202);
    expect(valuesMock).toHaveBeenCalledWith({
      name: "navbar.home.clicked",
      properties: {
        feature: "navbar",
        data: { destination: "/" },
      },
    });
  });

  it("rejects event names outside the allowlist", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "arbitrary.event" }),
    });

    expect(response.status).toBe(400);
    expect(valuesMock).not.toHaveBeenCalled();
  });

  it("returns a generic server error when persistence fails", async () => {
    valuesMock.mockRejectedValueOnce(new Error("database secret"));

    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "navbar.home.clicked" }),
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
