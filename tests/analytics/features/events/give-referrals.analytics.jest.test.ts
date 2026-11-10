/**
 * @jest-environment node
 */
import app from "../../../../services/api/src/app.js";

const { insertMock, valuesMock } = (() => {
  const im = jest.fn();
  const vm = jest.fn();

  return {
    insertMock: im,
    valuesMock: vm,
  };
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
  insertMock.mockReturnValue({
    values: valuesMock,
  });

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

describe("Give Referrals analytics events", () => {
  test("accepts give.referrals.viewed as a view event", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        name: "give.referrals.viewed",
        eventType: "view",
        path: "/",
      }),
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

  test("accepts give.referrals.clicked as a click event", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        name: "give.referrals.clicked",
        eventType: "click",
        properties: JSON.stringify({
          feature: "give-referrals",
          data: {
            action: "clicked",
          },
        }),
      }),
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

  test("accepts give.referrals.step.one.completed as a click event", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        name: "give.referrals.step.one.completed",
        eventType: "click",
        properties: JSON.stringify({
          feature: "give-referrals",
          data: {
            action: "step-one-completed",
          },
        }),
      }),
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

  test("accepts give.referrals.step.two.completed as a click event", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        name: "give.referrals.step.two.completed",
        eventType: "click",
        properties: JSON.stringify({
          feature: "give-referrals",
          data: {
            action: "step-two-completed",
          },
        }),
      }),
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

  test("accepts give.referrals.completed as a click event", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        name: "give.referrals.completed",
        eventType: "click",
        properties: JSON.stringify({
          feature: "give-referrals",
          data: {
            action: "completed",
          },
        }),
      }),
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

  test("rejects give.referrals.viewed when sent as a click event", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        name: "give.referrals.viewed",
        eventType: "click",
        properties: JSON.stringify({
          feature: "give-referrals",
          data: {
            action: "viewed",
            path: "/",
          },
        }),
      }),
    });

    expect(response.status).toBe(400);
    expect(valuesMock).not.toHaveBeenCalled();
  });

  test("rejects give.referrals.completed when sent as a view event", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        name: "give.referrals.completed",
        eventType: "view",
        properties: JSON.stringify({
          feature: "give-referrals",
          data: {
            action: "completed",
          },
        }),
      }),
    });

    expect(response.status).toBe(400);
    expect(valuesMock).not.toHaveBeenCalled();
  });
});
