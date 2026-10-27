import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import MentorMePage from "../../src/pages/MentorMePage";

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

function getMentorMeCalls(fetchMock: ReturnType<typeof vi.fn>) {
  return fetchMock.mock.calls.filter((call) =>
    String(call[0]).includes("/api/v1/mentor-me-requests"),
  );
}

function fillValidForm() {
  fireEvent.change(screen.getByLabelText("Name"), {
    target: { value: "Ada Lovelace" },
  });
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "ada@example.com" },
  });
  fireEvent.change(screen.getByLabelText("Mentoring Area"), {
    target: { value: "Software Architecture" },
  });
  fireEvent.change(screen.getByLabelText("What would you like help with?"), {
    target: { value: "Designing scalable systems." },
  });
  fireEvent.change(screen.getByLabelText("Current experience or context"), {
    target: { value: "5 years backend experience." },
  });
  fireEvent.change(
    screen.getByLabelText("Preferred Mentoring Format (optional)"),
    {
      target: { value: "Online call" },
    },
  );
  fireEvent.change(
    screen.getByLabelText("Availability / Preferred Time (optional)"),
    {
      target: { value: "Weekday evenings" },
    },
  );
}

function submit() {
  fireEvent.click(
    screen.getByRole("button", { name: /Request Mentoring Support/i }),
  );
}

describe("MentorMePage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the mentor me form", () => {
    render(<MentorMePage />);

    expect(
      screen.getByRole("heading", { name: "Mentor Me" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Mentoring Area")).toBeInTheDocument();
    expect(
      screen.getByLabelText("What would you like help with?"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Current experience or context"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Preferred Mentoring Format (optional)"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Availability / Preferred Time (optional)"),
    ).toBeInTheDocument();
  });

  it("fires the mentor.me.viewed event when the journey becomes visible", () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    render(<MentorMePage />);

    expect(getAnalyticsEventNames(fetchMock)).toEqual(["mentor.me.viewed"]);
  });

  it("shows client side validation errors without calling the API", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    render(<MentorMePage />);
    submit();

    expect(screen.getByText("Name is required.")).toBeInTheDocument();
    expect(screen.getByText("Email is required.")).toBeInTheDocument();
    expect(screen.getByText("Mentoring area is required.")).toBeInTheDocument();
    expect(
      screen.getByText("Please tell us what you would like help with."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Current experience or context is required."),
    ).toBeInTheDocument();
    expect(getMentorMeCalls(fetchMock)).toHaveLength(0);
  });

  it("fires the mentor.me.submitted and mentor.me.completed events on success", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 201,
      ok: true,
      json: async () => ({ data: { id: "request-1" } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<MentorMePage />);
    fillValidForm();
    submit();

    await screen.findByRole("heading", { name: "Request received" });

    const analyticsEvents = getAnalyticsEventNames(fetchMock);
    expect(analyticsEvents).toContain("mentor.me.submitted");
    expect(analyticsEvents).toContain("mentor.me.completed");
  });

  it("does not track completed event when request is rejected", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
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
    vi.stubGlobal("fetch", fetchMock);

    render(<MentorMePage />);
    fillValidForm();
    submit();

    await screen.findByText("Please enter a valid email address.");

    const analyticsEvents = getAnalyticsEventNames(fetchMock);
    expect(analyticsEvents).not.toContain("mentor.me.completed");
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

    render(<MentorMePage />);
    fillValidForm();
    submit();

    const alert = await screen.findByRole("alert");

    expect(alert.textContent).toBe(
      "We could not submit your mentoring request right now. Please try again in a moment.",
    );
    expect(alert.textContent).not.toContain("INTERNAL_SERVER_ERROR");
  });

  it("shows a safe message when the request cannot be sent", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("network down"));
    vi.stubGlobal("fetch", fetchMock);

    render(<MentorMePage />);
    fillValidForm();
    submit();

    expect((await screen.findByRole("alert")).textContent).toBe(
      "We could not submit your mentoring request right now. Please try again in a moment.",
    );
  });

  it("disables the submit button while the request is in flight", async () => {
    let resolveRequest!: (value: unknown) => void;
    const fetchMock = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        }),
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<MentorMePage />);
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
    const fetchMock = vi.fn().mockResolvedValue({
      status: 201,
      ok: true,
      json: async () => ({ data: { id: "request-1" } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<MentorMePage />);
    fillValidForm();
    submit();

    expect(
      await screen.findByRole("heading", { name: "Request received" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Thank you. Your mentoring request has been received and will be reviewed.",
      ),
    ).toBeInTheDocument();
  });
});
