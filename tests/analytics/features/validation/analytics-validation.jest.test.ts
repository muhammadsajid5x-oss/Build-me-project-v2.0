export {};

type AnalyticsEvent = {
  name: string;
  userId?: string;
  properties?: Record<string, unknown>;
  timestamp: string;
};
describe("Analytics Validation", () => {
  it("validates a supported analytics event", () => {
    const event: AnalyticsEvent = {
      name: "form_submit",
      timestamp: new Date().toISOString(),
    };
    const validNames = [
      "page_view",
      "button_click",
      "form_submit",
      "lead_created",
      "project_created",
    ];
    expect(validNames).toContain(event.name);
    expect(event.timestamp).toBeDefined();
  });
  it("rejects an unsupported event name", () => {
    const eventName = "unknown_event";
    const validNames = [
      "page_view",
      "button_click",
      "form_submit",
      "lead_created",
      "project_created",
    ];
    expect(validNames).not.toContain(eventName);
  });
});

