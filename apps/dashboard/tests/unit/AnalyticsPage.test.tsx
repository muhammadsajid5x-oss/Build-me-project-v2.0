import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
}));

vi.mock("../../src/services/apiClient", () => ({
  apiClient: {
    get: mocks.get,
  },
}));

import AnalyticsPage from "../../src/pages/AnalyticsPage";

const mockSummary = {
  totalEvents: 150,
  eventTypeCounts: {
    view: 100,
    click: 50,
  },
  eventCounts: {
    "navbar.home.clicked": 45,
    "page.view": 35,
    "button.submit.clicked": 25,
    "form.submitted": 20,
    "link.footer.clicked": 15,
    "modal.opened": 10,
  },
  dailyTotals: [
    { date: "2026-09-28", count: 5 },
    { date: "2026-09-29", count: 8 },
    { date: "2026-09-30", count: 12 },
    { date: "2026-10-01", count: 15 },
    { date: "2026-10-02", count: 10 },
    { date: "2026-10-03", count: 7 },
    { date: "2026-10-04", count: 3 },
  ],
  recentEvents: [
    {
      name: "button.submit.clicked",
      eventType: "click",
      createdAt: "2026-10-04T14:30:00.000Z",
    },
    {
      name: "page.view",
      eventType: "view",
      createdAt: "2026-10-04T14:25:00.000Z",
    },
    {
      name: "navbar.home.clicked",
      eventType: "click",
      createdAt: "2026-10-04T14:20:00.000Z",
    },
    {
      name: "form.submitted",
      eventType: "click",
      createdAt: "2026-10-04T14:15:00.000Z",
    },
    {
      name: "link.footer.clicked",
      eventType: "click",
      createdAt: "2026-10-04T14:10:00.000Z",
    },
  ],
};

describe("AnalyticsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows a loading state while the analytics summary is being loaded", () => {
    mocks.get.mockReturnValue(new Promise(() => undefined));

    render(<AnalyticsPage />);

    expect(screen.getByText("Loading...")).toBeTruthy();
  });

  it("renders the analytics summary with stats, chart, event breakdown, and recent events", async () => {
    mocks.get.mockResolvedValue({ data: mockSummary });

    render(<AnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText("Analytics")).toBeTruthy();
      expect(screen.getByText("Real-time event summary for the Build Me platform.")).toBeTruthy();
    });

    // Stat cards
    expect(screen.getByText("Total events")).toBeTruthy();
    expect(screen.getByText("150")).toBeTruthy();
    expect(screen.getByText("Views")).toBeTruthy();
    expect(screen.getByText("100")).toBeTruthy();
    expect(screen.getByText("Clicks")).toBeTruthy();
    expect(screen.getByText("50")).toBeTruthy();
    expect(screen.getByText("Unique events")).toBeTruthy();
    expect(screen.getByText("6")).toBeTruthy();

    // Bar chart
    expect(screen.getByText("Daily events (30d)")).toBeTruthy();

    // Event breakdown - Navbar Home Clicked and Page View appear in both event breakdown and recent events
    expect(screen.getByText("Event breakdown")).toBeTruthy();
    const navbarItems = screen.getAllByText("Navbar Home Clicked");
    expect(navbarItems).toHaveLength(2);
    expect(screen.getByText("45")).toBeTruthy();
    const pageViewItems = screen.getAllByText("Page View");
    expect(pageViewItems).toHaveLength(2);
    expect(screen.getByText("35")).toBeTruthy();

    // Recent events
    expect(screen.getByText("Recent events")).toBeTruthy();
    const buttonSubmitItems = screen.getAllByText("Button Submit Clicked");
    expect(buttonSubmitItems).toHaveLength(2);
    // eventType is rendered as "click · <date>" so we match with regex
    const clickEvents = screen.getAllByText(/click \u00b7/);
    expect(clickEvents.length).toBeGreaterThan(0);

    expect(mocks.get).toHaveBeenCalledWith("api/v1/analytics/summary");
  });
it("shows zero-event states when summary has no data", async () => {
    const emptySummary = {
      totalEvents: 0,
      eventTypeCounts: {},
      eventCounts: {},
      dailyTotals: [],
      recentEvents: [],
    };

    mocks.get.mockResolvedValue({ data: emptySummary });

    render(<AnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText("Total events")).toBeTruthy();
      const zeroValues = screen.getAllByText("0");
      // Four stat cards show 0: Total events, Views, Clicks, Unique events
      expect(zeroValues).toHaveLength(4);
    });

    // Empty chart state
    expect(screen.getByText("No events recorded in the trailing 30 days.")).toBeTruthy();

    // Empty event breakdown
    expect(screen.getByText("No events recorded yet.")).toBeTruthy();

    // Empty recent events
    expect(screen.getByText("No recent events recorded.")).toBeTruthy();
  });

  it("shows a safe error when the analytics cannot be loaded", async () => {
    mocks.get.mockRejectedValue(new Error("network down"));

    render(<AnalyticsPage />);

    expect(
      await screen.findByText("Analytics could not be loaded. Please try again."),
    ).toBeTruthy();
  });

  it("shows an authorisation error when the request is not permitted", async () => {
    mocks.get.mockRejectedValue({ code: "UNAUTHORIZED" });

    render(<AnalyticsPage />);

    expect(
      await screen.findByText("You are not authorised to view analytics."),
    ).toBeTruthy();
  });

  it("reloads the analytics when the error is retried", async () => {
    mocks.get.mockRejectedValueOnce(new Error("network down"));
    mocks.get.mockResolvedValueOnce({ data: mockSummary });

    render(<AnalyticsPage />);

    const retry = await screen.findByRole("button", { name: "Retry" });
    fireEvent.click(retry);

    await waitFor(() => {
      expect(screen.getByText("Analytics")).toBeTruthy();
      expect(screen.getByText("150")).toBeTruthy();
    });
    expect(mocks.get).toHaveBeenCalledTimes(2);
  });

  it("handles missing eventTypeCounts gracefully", async () => {
    const summaryWithoutEventTypes = {
      ...mockSummary,
      eventTypeCounts: undefined as any,
    };

    mocks.get.mockResolvedValue({ data: summaryWithoutEventTypes });

    render(<AnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText("Views")).toBeTruthy();
      expect(screen.getByText("Clicks")).toBeTruthy();
      const zeroValues = screen.getAllByText("0");
      // Views and Clicks both show 0 when eventTypeCounts is missing
      expect(zeroValues).toHaveLength(2);
    });
  });
});