import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import CoffeeWithMePage from "../../src/pages/CoffeeWithMePage";

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

function getCoffeeWithMeCalls(fetchMock: ReturnType<typeof vi.fn>) {
  return fetchMock.mock.calls.filter((call) =>
    String(call[0]).includes("/api/v1/coffee-with-me-requests"),
  );
}

function fillValidForm() {
  fireEvent.change(screen.getByLabelText("Name"), {
    target: { value: "Ada Lovelace" },
  });

  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "ada@example.com" },
  });

  fireEvent.change(screen.getByLabelText("What would you like to discuss?"), {
    target: { value: "Career transition and software architecture." },
  });

  fireEvent.change(screen.getByLabelText("Preferred Format (optional)"), {
    target: { value: "Video call" },
  });

  fireEvent.change(
    screen.getByLabelText("Availability / Preferred Time (optional)"),
    {
      target: { value: "Weekday evenings" },
    },
  );
}

function submit() {
  fireEvent.click(screen.getByRole("button", { name: /Request Coffee Chat/i }));
}

describe("CoffeeWithMePage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the coffee with me form", () => {
    render(<CoffeeWithMePage />);

    expect(
      screen.getByRole("heading", { name: "Grab a virtual coffee" }),
    ).toBeInTheDocument();

    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();

    expect(
      screen.getByLabelText("What would you like to discuss?"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Preferred Format (optional)"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Availability / Preferred Time (optional)"),
    ).toBeInTheDocument();
  });

  it("fires the coffee.with.me.viewed event when the page is rendered", () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    render(<CoffeeWithMePage />);

    expect(getAnalyticsEventNames(fetchMock)).toEqual([
      "coffee.with.me.viewed",
    ]);
  });

  it("shows client side validation errors without calling the API", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    render(<CoffeeWithMePage />);
    submit();

    expect(screen.getByText("Name is required.")).toBeInTheDocument();

    expect(screen.getByText("Email is required.")).toBeInTheDocument();

    expect(
      screen.getByText("Please tell us what you would like to discuss."),
    ).toBeInTheDocument();

    expect(getCoffeeWithMeCalls(fetchMock)).toHaveLength(0);
  });

  it("fires submitted and completed analytics events on success", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/api/v1/coffee-with-me-requests")) {
        return Promise.resolve({
          status: 201,
          ok: true,
          json: async () => ({ data: { id: "request-1" } }),
        });
      }

      return Promise.resolve({
        status: 200,
        ok: true,
      });
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<CoffeeWithMePage />);
    fillValidForm();
    submit();

    await screen.findByRole("heading", { name: "Request received" });

    const analyticsEvents = getAnalyticsEventNames(fetchMock);

    expect(analyticsEvents).toContain("coffee.with.me.viewed");
    expect(analyticsEvents).toContain("coffee.with.me.submitted");
    expect(analyticsEvents).toContain("coffee.with.me.completed");
  });

  it("does not track completed event when the request is rejected", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/api/v1/coffee-with-me-requests")) {
        return Promise.resolve({
          status: 400,
          ok: false,
          json: async () => ({
            error: {
              code: "VALIDATION_ERROR",
              message: "The request contains invalid fields.",
              details: [
                {
                  field: "email",
                  message: "Please enter a valid email address.",
                },
              ],
            },
          }),
        });
      }

      return Promise.resolve({
        status: 200,
        ok: true,
      });
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<CoffeeWithMePage />);
    fillValidForm();
    submit();

    await screen.findByText("Please enter a valid email address.");

    const analyticsEvents = getAnalyticsEventNames(fetchMock);

    expect(analyticsEvents).toContain("coffee.with.me.viewed");
    expect(analyticsEvents).not.toContain("coffee.with.me.submitted");
    expect(analyticsEvents).not.toContain("coffee.with.me.completed");
  });

  it("shows a safe message when the API fails unexpectedly", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/api/v1/coffee-with-me-requests")) {
        return Promise.resolve({
          status: 500,
          ok: false,
          json: async () => ({
            error: {
              code: "INTERNAL_SERVER_ERROR",
              message: "An unexpected error occurred.",
            },
          }),
        });
      }

      return Promise.resolve({
        status: 200,
        ok: true,
      });
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<CoffeeWithMePage />);
    fillValidForm();
    submit();

    const alert = await screen.findByRole("alert");

    expect(alert.textContent).toBe(
      "We could not submit your request right now. Please try again in a moment.",
    );

    expect(alert.textContent).not.toContain("INTERNAL_SERVER_ERROR");
  });

  it("shows a safe message when the request cannot be sent", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/api/v1/coffee-with-me-requests")) {
        return Promise.reject(new Error("network down"));
      }

      return Promise.resolve({
        status: 200,
        ok: true,
      });
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<CoffeeWithMePage />);
    fillValidForm();
    submit();

    expect((await screen.findByRole("alert")).textContent).toBe(
      "We could not submit your request right now. Please try again in a moment.",
    );
  });

  it("disables the submit button while the request is in flight", async () => {
    let resolveRequest!: (value: unknown) => void;

    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/api/v1/coffee-with-me-requests")) {
        return new Promise((resolve) => {
          resolveRequest = resolve;
        });
      }

      return Promise.resolve({
        status: 200,
        ok: true,
      });
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<CoffeeWithMePage />);
    fillValidForm();
    submit();

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Submitting/i }),
      ).toBeDisabled();
    });

    resolveRequest({
      status: 201,
      ok: true,
      json: async () => ({ data: { id: "request-1" } }),
    });

    await screen.findByRole("heading", { name: "Request received" });
  });

  it("shows successful confirmation state", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/api/v1/coffee-with-me-requests")) {
        return Promise.resolve({
          status: 201,
          ok: true,
          json: async () => ({ data: { id: "request-1" } }),
        });
      }

      return Promise.resolve({
        status: 200,
        ok: true,
      });
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<CoffeeWithMePage />);
    fillValidForm();
    submit();

    expect(
      await screen.findByRole("heading", { name: "Request received" }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Thank you. Your coffee chat request has been received and we will be in touch soon to schedule a time.",
      ),
    ).toBeInTheDocument();
  });
});
