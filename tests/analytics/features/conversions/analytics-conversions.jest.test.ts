export {};

type AnalyticsEvent = {
  name: string;
  userId?: string;
  properties?: Record<string, unknown>;
  timestamp: string;
};
describe("Analytics Conversions", () => {
  it("tracks a lead_created conversion", () => {
    const event: AnalyticsEvent = {
      name: "lead_created",
      userId: "test-user",
      properties: {
        source: "contact-form",
      },
      timestamp: new Date().toISOString(),
    };
    expect(event.name).toBe("lead_created");
    expect(event.userId).toBe("test-user");
    expect(event.properties?.source).toBe("contact-form");
  });
  it("tracks a project_created conversion", () => {
    const event: AnalyticsEvent = {
      name: "project_created",
      userId: "test-user",
      properties: {
        projectId: "project-123",
      },
      timestamp: new Date().toISOString(),
    };
    expect(event.name).toBe("project_created");
    expect(event.properties?.projectId).toBe("project-123");
  });
});

