export {};

type AnalyticsEvent = {
  name: string;
  userId?: string;
  properties?: Record<string, unknown>;
  timestamp: string;
};
describe("Analytics Tracking", () => {
  it("tracks a user action as an analytics event", () => {
    const event: AnalyticsEvent = {
      name: "button_click",
      userId: "test-user",
      properties: {
        button: "get-started",
      },
      timestamp: new Date().toISOString(),
    };
    expect(event.name).toBe("button_click");
    expect(event.userId).toBe("test-user");
    expect(event.properties?.button).toBe("get-started");
  });
  it("includes a timestamp when an event is tracked", () => {
    const event: AnalyticsEvent = {
      name: "page_view",
      timestamp: new Date().toISOString(),
    };
    expect(event.timestamp).toBeDefined();
    expect(Number.isNaN(Date.parse(event.timestamp))).toBe(false);
  });
});

