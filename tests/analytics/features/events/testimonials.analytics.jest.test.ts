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
describe("Testimonials analytics events", () => {
  it("stores the testimonials.viewed event", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      body: new URLSearchParams({
        name: "testimonials.viewed",
        eventType: "view",
        path: "/",
      }),
    });
    expect(response.status).toBe(202);
    expect(valuesMock).toHaveBeenCalledWith({
      name: "testimonials.viewed",
      eventType: "view",
      properties: {
        feature: "testimonials",
        data: {
          action: "viewed",
          path: "/",
        },
      },
    });
  });
  it("stores the testimonials.pagination.clicked event", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      body: new URLSearchParams({
        name: "testimonials.pagination.clicked",
        eventType: "click",
        path: "/",
      }),
    });
    expect(response.status).toBe(202);
    expect(valuesMock).toHaveBeenCalledWith({
      name: "testimonials.pagination.clicked",
      eventType: "click",
      properties: {
        feature: "testimonials",
        data: {
          action: "pagination-clicked",
        },
      },
    });
  });
  it("stores the testimonial.helpful.clicked event", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      body: new URLSearchParams({
        name: "testimonial.helpful.clicked",
        eventType: "click",
        path: "/",
      }),
    });
    expect(response.status).toBe(202);
    expect(valuesMock).toHaveBeenCalledWith({
      name: "testimonial.helpful.clicked",
      eventType: "click",
      properties: {
        feature: "testimonial",
        data: {
          action: "helpful-clicked",
        },
      },
    });
  });
  it("stores the testimonial.story.clicked event", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      body: new URLSearchParams({
        name: "testimonial.story.clicked",
        eventType: "click",
        path: "/",
      }),
    });
    expect(response.status).toBe(202);
    expect(valuesMock).toHaveBeenCalledWith({
      name: "testimonial.story.clicked",
      eventType: "click",
      properties: {
        feature: "testimonial",
        data: {
          action: "story-clicked",
        },
      },
    });
  });
  it("rejects testimonials.viewed with the wrong event type", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      body: new URLSearchParams({
        name: "testimonials.viewed",
        eventType: "click",
        path: "/",
      }),
    });
    expect(response.status).toBe(400);
    expect(valuesMock).not.toHaveBeenCalled();
  });
  it("rejects testimonials.pagination.clicked with the wrong event type", async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/events`, {
      method: "POST",
      body: new URLSearchParams({
        name: "testimonials.pagination.clicked",
        eventType: "view",
        path: "/",
      }),
    });
    expect(response.status).toBe(400);
    expect(valuesMock).not.toHaveBeenCalled();
  });
});
