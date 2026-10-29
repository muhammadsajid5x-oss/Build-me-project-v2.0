import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
}));

vi.mock("../../src/services/apiClient", () => ({
  apiClient: {
    get: mocks.get,
  },
}));

import DashboardPage from "../../src/pages/DashboardPage";

const deliveryProjectRequest = {
  id: "11111111-1111-1111-1111-111111111111",
  name: "Ada Lovelace",
  email: "ada@example.com",
  projectDescription: "A delivery platform.",
  expectedOutcome: "A working platform.",
  timeline: "6 weeks",
  budget: "$1,000",
  status: "new",
  createdAt: "2026-10-01T10:00:00.000Z",
};

const mentorMeRequest = {
  id: "22222222-2222-2222-2222-222222222222",
  name: "Grace Hopper",
  email: "grace@example.com",
  mentoringArea: "Architecture",
  helpWith: "System design",
  experienceContext: "10 years",
  status: "pending",
  createdAt: "2026-10-01T10:00:00.000Z",
};

const coffeeWithMeRequest = {
  id: "33333333-3333-3333-3333-333333333333",
  name: "Alan Turing",
  email: "alan@example.com",
  topic: "Computer Science",
  preferredFormat: "Virtual",
  availability: "Weekends",
  status: "new",
  createdAt: "2026-10-01T10:00:00.000Z",
};

describe("DashboardPage delivery project requests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.get.mockImplementation((url: string) => {
      if (url.includes("mentor-me-requests")) {
        return Promise.resolve({ data: [mentorMeRequest] });
      }
      if (url.includes("coffee-with-me-requests")) {
        return Promise.resolve({ data: [coffeeWithMeRequest] });
      }
      return Promise.resolve({ data: [deliveryProjectRequest] });
    });
  });

  it("shows a loading state while the requests are being loaded", () => {
    mocks.get.mockImplementation(() => new Promise(() => undefined));

    render(<DashboardPage />);

    expect(screen.getByText("Loading...")).toBeTruthy();
  });

  it("lists the delivery project requests returned by the API", async () => {
    render(<DashboardPage />);

    expect(await screen.findByText("Ada Lovelace")).toBeTruthy();
    expect(screen.getByText("ada@example.com")).toBeTruthy();
    expect(screen.getByText("A delivery platform.")).toBeTruthy();
    expect(screen.getByText("A working platform.")).toBeTruthy();
    expect(screen.getByText("6 weeks")).toBeTruthy();
    expect(screen.getByText("$1,000")).toBeTruthy();
    // Both delivery and coffee requests have "new" status
    expect(screen.getAllByText("new")).toHaveLength(2);
    expect(mocks.get).toHaveBeenCalledWith("api/v1/delivery-project-requests");
  });

  it("shows an empty state when there are no delivery project requests", async () => {
    mocks.get.mockImplementation((url: string) => {
      if (url.includes("mentor-me-requests")) {
        return Promise.resolve({ data: [mentorMeRequest] });
      }
      return Promise.resolve({ data: [] });
    });

    render(<DashboardPage />);

    expect(
      await screen.findByText("No delivery project requests yet."),
    ).toBeTruthy();
  });

  it("shows a placeholder for requests without a timeline or budget", async () => {
    mocks.get.mockImplementation((url: string) => {
      if (url.includes("mentor-me-requests")) {
        return Promise.resolve({ data: [] });
      }
      if (url.includes("coffee-with-me-requests")) {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({
        data: [
          {
            ...deliveryProjectRequest,
            timeline: undefined,
            budget: undefined,
          },
        ],
      });
    });

    render(<DashboardPage />);

    expect(await screen.findByText("Ada Lovelace")).toBeTruthy();
    expect(screen.getAllByText("—")).toHaveLength(2);
  });

  it("shows a safe error when the requests cannot be loaded", async () => {
    mocks.get.mockRejectedValue(new Error("network down"));

    render(<DashboardPage />);

    expect(
      await screen.findByText(
        "Requests could not be loaded. Please try again.",
      ),
    ).toBeTruthy();
  });

  it("shows an authorisation error when the request is not permitted", async () => {
    mocks.get.mockRejectedValue({ code: "UNAUTHORIZED" });

    render(<DashboardPage />);

    expect(
      await screen.findByText("You are not authorised to view requests."),
    ).toBeTruthy();
  });

  it("reloads the requests when the error is retried", async () => {
    mocks.get.mockRejectedValueOnce(new Error("network down"));
    mocks.get.mockImplementation((url: string) => {
      if (url.includes("mentor-me-requests")) {
        return Promise.resolve({ data: [mentorMeRequest] });
      }
      if (url.includes("coffee-with-me-requests")) {
        return Promise.resolve({ data: [coffeeWithMeRequest] });
      }
      return Promise.resolve({ data: [deliveryProjectRequest] });
    });

    render(<DashboardPage />);

    const retry = await screen.findByRole("button", { name: "Retry" });
    fireEvent.click(retry);

    await waitFor(() => {
      expect(screen.getByText("Ada Lovelace")).toBeTruthy();
    });
    // 3 initial calls (one fails) + 3 retry calls = 6 total
    expect(mocks.get).toHaveBeenCalledTimes(6);
  });
});
