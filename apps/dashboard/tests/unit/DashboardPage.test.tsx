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

describe("DashboardPage delivery project requests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows a loading state while the requests are being loaded", () => {
    mocks.get.mockReturnValue(new Promise(() => undefined));

    render(<DashboardPage />);

    expect(screen.getByText("Loading...")).toBeTruthy();
  });

  it("lists the delivery project requests returned by the API", async () => {
    mocks.get.mockResolvedValue({ data: [deliveryProjectRequest] });

    render(<DashboardPage />);

    expect(await screen.findByText("Ada Lovelace")).toBeTruthy();
    expect(screen.getByText("ada@example.com")).toBeTruthy();
    expect(screen.getByText("A delivery platform.")).toBeTruthy();
    expect(screen.getByText("A working platform.")).toBeTruthy();
    expect(screen.getByText("6 weeks")).toBeTruthy();
    expect(screen.getByText("$1,000")).toBeTruthy();
    expect(screen.getByText("new")).toBeTruthy();
    expect(mocks.get).toHaveBeenCalledWith("api/v1/delivery-project-requests");
  });

  it("shows an empty state when there are no delivery project requests", async () => {
    mocks.get.mockResolvedValue({ data: [] });

    render(<DashboardPage />);

    expect(
      await screen.findByText("No delivery project requests yet."),
    ).toBeTruthy();
  });

  it("shows a placeholder for requests without a timeline or budget", async () => {
    mocks.get.mockResolvedValue({
      data: [
        {
          ...deliveryProjectRequest,
          timeline: undefined,
          budget: undefined,
        },
      ],
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
        "Delivery project requests could not be loaded. Please try again.",
      ),
    ).toBeTruthy();
  });

  it("shows an authorisation error when the request is not permitted", async () => {
    mocks.get.mockRejectedValue({ code: "UNAUTHORIZED" });

    render(<DashboardPage />);

    expect(
      await screen.findByText(
        "You are not authorised to view delivery project requests.",
      ),
    ).toBeTruthy();
  });

  it("reloads the requests when the error is retried", async () => {
    mocks.get.mockRejectedValueOnce(new Error("network down"));
    mocks.get.mockResolvedValueOnce({ data: [deliveryProjectRequest] });

    render(<DashboardPage />);

    const retry = await screen.findByRole("button", { name: "Retry" });
    fireEvent.click(retry);

    await waitFor(() => {
      expect(screen.getByText("Ada Lovelace")).toBeTruthy();
    });
    expect(mocks.get).toHaveBeenCalledTimes(2);
  });
});
