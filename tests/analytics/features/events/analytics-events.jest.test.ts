export {};

type AnalyticsEvent =
  | {
      name: "page_view" | "button_click" | "form_submit" | "lead_created" | "project_created";
      userId?: string;
      properties?: Record<string, unknown>;
      timestamp: string;
    };
describe("Analytics Events", () => {
  it("creates a valid page_view event", () => {
    const event: AnalyticsEvent = {
      name: "page_view",
      timestamp: new Date().toISOString(),
      properties: {
        page: "/",
      },
    };
    expect(event.name).toBe("page_view");
    expect(event.timestamp).toBeDefined();
    expect(event.properties?.page).toBe("/");
  });
  it("creates a valid button_click event", () => {
    const event: AnalyticsEvent = {
      name: "button_click",
      userId: "test-user",
      timestamp: new Date().toISOString(),
      properties: {
        button: "get-started",
      },
    };
    expect(event.name).toBe("button_click");
    expect(event.userId).toBe("test-user");
    expect(event.properties?.button).toBe("get-started");
  });
});

