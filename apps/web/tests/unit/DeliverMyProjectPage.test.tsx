import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import AppLayout from "../../src/layouts/AppLayout";
import DeliverMyProjectPage from "../../src/pages/DeliverMyProjectPage";

const deliveryEndpoint =
  "http://localhost:3000/api/v1/delivery-project-requests";

function getAnalyticsCalls(fetchMock: ReturnType<typeof vi.fn>) {
  return fetchMock.mock.calls.filter((call) =>
    String(call[0]).includes("/api/v1/analytics/events"),
  );
}

function getAnalyticsEventNames(fetchMock: ReturnType<typeof vi.fn>) {
  return getAnalyticsCalls(fetchMock).map((call) => {
    const options = call[1] as { body?: URLSearchParams } | undefined;

    return options?.body instanceof URLSearchParams
      ? options.body.get("name")
      : undefined;
  });
}

function getDeliveryRequestCalls(fetchMock: ReturnType<typeof vi.fn>) {
  return fetchMock.mock.calls.filter((call) =>
    String(call[0]).includes("/api/v1/delivery-project-requests"),
  );
}

function fillValidForm() {
  fireEvent.change(screen.getByLabelText("Name"), {
    target: { value: "Ada Lovelace" },
  });
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "ada@example.com" },
  });
  fireEvent.change(screen.getByLabelText("What do you want to build?"), {
    target: { value: "A delivery platform." },
  });
  fireEvent.change(screen.getByLabelText("What outcome are you looking for?"), {
    target: { value: "A working platform." },
  });
}

function submit() {
  fireEvent.click(
    screen.getByRole("button", { name: /Submit Project Request/i }),
  );
}

describe("DeliverMyProjectPage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the delivery project form", () => {
    render(<DeliverMyProjectPage />);

    expect(
      screen.getByRole("heading", { name: "Deliver My Project" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Timeline")).toBeInTheDocument();
    expect(screen.getByLabelText("Budget")).toBeInTheDocument();
  });

  it("shows client side validation errors without calling the API", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    render(<DeliverMyProjectPage />);
    submit();

    expect(screen.getByText("Name is required.")).toBeInTheDocument();
    expect(screen.getByText("Email is required.")).toBeInTheDocument();
    expect(
      screen.getByText("Project description is required."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Expected outcome is required."),
    ).toBeInTheDocument();
    expect(getDeliveryRequestCalls(fetchMock)).toHaveLength(0);
  });

  it("fires the deliver.my.project.viewed event when the journey becomes visible", () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    render(<DeliverMyProjectPage />);

    expect(getAnalyticsEventNames(fetchMock)).toEqual([
      "deliver.my.project.viewed",
    ]);

    const analyticsCall = getAnalyticsCalls(fetchMock)[0];
    const options = analyticsCall[1] as { body?: URLSearchParams };

    expect(options.body?.get("eventType")).toBe("view");
    expect(options.body?.get("path")).toBe("/deliver-my-project");
  });

  it("does not fire the deliver.my.project.viewed event twice", () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    render(<DeliverMyProjectPage />);

    expect(
      getAnalyticsEventNames(fetchMock).filter(
        (name) => name === "deliver.my.project.viewed",
      ),
    ).toHaveLength(1);
  });

  it("fires the deliver.my.project.viewed event once when opened through the layout", () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <MemoryRouter initialEntries={["/deliver-my-project"]}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route
              path="/deliver-my-project"
              element={<DeliverMyProjectPage />}
            />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(
      getAnalyticsEventNames(fetchMock).filter(
        (name) => name === "deliver.my.project.viewed",
      ),
    ).toHaveLength(1);
  });

  it("submits the form and confirms a persisted request", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 201,
      ok: true,
      json: async () => ({
        data: {
          id: "11111111-1111-1111-1111-111111111111",
          name: "Ada Lovelace",
          email: "ada@example.com",
          status: "new",
          createdAt: "2026-10-01T10:00:00.000Z",
        },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<DeliverMyProjectPage />);
    fillValidForm();
    submit();

    expect(
      await screen.findByRole("heading", { name: "Request received" }),
    ).toBeInTheDocument();

    expect(fetchMock).toHaveBeenCalledWith(deliveryEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Ada Lovelace",
        email: "ada@example.com",
        projectDescription: "A delivery platform.",
        expectedOutcome: "A working platform.",
        timeline: "",
        budget: "",
      }),
    });
  });

  it("tracks the completed analytics event only after a successful request", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 201,
      ok: true,
      json: async () => ({ data: { id: "request-1" } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<DeliverMyProjectPage />);
    fillValidForm();
    submit();

    await screen.findByRole("heading", { name: "Request received" });

    const analyticsCall = fetchMock.mock.calls.find(
      (call) =>
        String(call[0]).includes("/api/v1/analytics/events") &&
        (call[1] as { body?: URLSearchParams })?.body?.get("name") ===
          "deliver.my.project.completed",
    );

    expect(analyticsCall).toBeDefined();
    expect(analyticsCall?.[1]).toEqual({
      method: "POST",
      body: new URLSearchParams({
        name: "deliver.my.project.completed",
        eventType: "click",
      }),
      keepalive: true,
    });
  });

  it("fires the completed event only after the request has been persisted", async () => {
    let resolveRequest: (value: unknown) => void = () => undefined;
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (String(url).includes("/api/v1/analytics/events")) {
        return Promise.resolve({ ok: true });
      }

      return new Promise((resolve) => {
        resolveRequest = resolve;
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<DeliverMyProjectPage />);
    fillValidForm();
    submit();

    await waitFor(() => {
      expect(getDeliveryRequestCalls(fetchMock)).toHaveLength(1);
    });

    expect(
      getAnalyticsEventNames(fetchMock),
    ).not.toContain("deliver.my.project.completed");

    resolveRequest({
      status: 201,
      ok: true,
      json: async () => ({ data: { id: "request-1" } }),
    });

    await screen.findByRole("heading", { name: "Request received" });

    expect(getAnalyticsEventNames(fetchMock)).toContain(
      "deliver.my.project.completed",
    );
  });

  it("shows the confirmation even when the analytics request fails", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (String(url).includes("/api/v1/analytics/events")) {
        return Promise.reject(new Error("analytics unavailable"));
      }

      return Promise.resolve({
        status: 201,
        ok: true,
        json: async () => ({ data: { id: "request-1" } }),
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<DeliverMyProjectPage />);
    fillValidForm();
    submit();

    expect(
      await screen.findByRole("heading", { name: "Request received" }),
    ).toBeInTheDocument();
    expect(getDeliveryRequestCalls(fetchMock)).toHaveLength(1);
  });

  it("does not track the completed event when the request is rejected", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 400,
      ok: false,
      json: async () => ({
        error: {
          code: "VALIDATION_ERROR",
          message: "The request contains invalid fields.",
          details: [
            {
              field: "name",
              message: "Name must be between 1 and 100 characters.",
            },
          ],
        },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<DeliverMyProjectPage />);
    fillValidForm();
    submit();

    expect(
      await screen.findByText("Name must be between 1 and 100 characters."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Please review the highlighted fields and try again."),
    ).toBeInTheDocument();

    const analyticsCall = fetchMock.mock.calls.find(
      (call) =>
        String(call[0]).includes("/api/v1/analytics/events") &&
        (call[1] as { body?: URLSearchParams })?.body?.get("name") ===
          "deliver.my.project.completed",
    );

    expect(analyticsCall).toBeUndefined();
  });

  it("shows a safe message when the API fails unexpectedly", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 500,
      ok: false,
      json: async () => ({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred.",
        },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<DeliverMyProjectPage />);
    fillValidForm();
    submit();

    const alert = await screen.findByRole("alert");

    expect(alert.textContent).toBe(
      "We could not submit your request right now. Please try again in a moment.",
    );
    expect(alert.textContent).not.toContain("INTERNAL_SERVER_ERROR");
  });

  it("shows a safe message when the request cannot be sent", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("network down"));
    vi.stubGlobal("fetch", fetchMock);

    render(<DeliverMyProjectPage />);
    fillValidForm();
    submit();

    expect((await screen.findByRole("alert")).textContent).toBe(
      "We could not submit your request right now. Please try again in a moment.",
    );
  });

  it("disables the submit button while the request is in flight", async () => {
    let resolveRequest: (value: unknown) => void = () => undefined;
    const fetchMock = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        }),
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<DeliverMyProjectPage />);
    fillValidForm();
    submit();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Submitting/i })).toBeDisabled();
    });

    resolveRequest({
      status: 201,
      ok: true,
      json: async () => ({ data: { id: "request-1" } }),
    });

    await screen.findByRole("heading", { name: "Request received" });
  });
});
