import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import TechnologyOwnershipAudit from "../../src/components/TechnologyOwnershipAudit";

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

function getOwnershipAuditCalls(fetchMock: ReturnType<typeof vi.fn>) {
  return fetchMock.mock.calls.filter((call) =>
    String(call[0]).includes("/api/v1/ownership-audits"),
  );
}

function selectAnswer(value: "A" | "B" | "C") {
  fireEvent.click(
    screen.getByRole("radio", {
      name: new RegExp(`^${value}`),
    }),
  );
}

function clickNext() {
  fireEvent.click(screen.getByRole("button", { name: "Next" }));
}

function clickPrevious() {
  fireEvent.click(screen.getByRole("button", { name: "Previous" }));
}

function selectAllCAnswers() {
  selectAnswer("C");
  clickNext();

  selectAnswer("C");
  clickNext();

  selectAnswer("C");
}

describe("TechnologyOwnershipAudit", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the first audit question", () => {
    render(<TechnologyOwnershipAudit />);

    expect(
      screen.getByRole("heading", { name: "Project Scope & Current Stage" }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "What stage is your current technology initiative or software project in right now?",
        { selector: "p" },
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Just exploring ideas / Early concept stage (Low immediate urgency)",
        { selector: "span" },
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("radio", {
        name: /^A/,
      }),
    ).toBeInTheDocument();
  });

  it("fires the ownership.audit.viewed event when rendered", () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    render(<TechnologyOwnershipAudit />);

    expect(getAnalyticsEventNames(fetchMock)).toContain(
      "ownership.audit.viewed",
    );
  });

  it("shows validation when Next is clicked without selecting an answer", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    render(<TechnologyOwnershipAudit />);

    clickNext();

    expect(
      screen.getByText("Please select an answer before continuing."),
    ).toBeInTheDocument();

    expect(getOwnershipAuditCalls(fetchMock)).toHaveLength(0);
  });

  it("moves forward and backward between audit questions", () => {
    render(<TechnologyOwnershipAudit />);

    selectAnswer("B");
    clickNext();

    expect(
      screen.getByRole("heading", { name: "Tech Stack & Architecture" }),
    ).toBeInTheDocument();

    selectAnswer("B");
    clickNext();

    expect(
      screen.getByRole("heading", { name: "Primary Bottleneck / Pain Point" }),
    ).toBeInTheDocument();

    clickPrevious();

    expect(
      screen.getByRole("heading", { name: "Tech Stack & Architecture" }),
    ).toBeInTheDocument();

    clickPrevious();

    expect(
      screen.getByRole("heading", { name: "Project Scope & Current Stage" }),
    ).toBeInTheDocument();
  });

  it("fires ownership.audit.started when the first answer is selected", () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    render(<TechnologyOwnershipAudit />);

    selectAnswer("B");

    expect(getAnalyticsEventNames(fetchMock)).toContain(
      "ownership.audit.started",
    );
  });

  it("submits all answers and displays the calculated result", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/api/v1/ownership-audits")) {
        return Promise.resolve({
          status: 201,
          ok: true,
          json: async () => ({
            data: {
              id: "audit-1",
              step1: "C",
              step2: "C",
              step3: "C",
              score: 15,
              category: "Strong Ownership",
              createdAt: "2026-10-30T00:00:00.000Z",
            },
          }),
        });
      }

      return Promise.resolve({ ok: true });
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<TechnologyOwnershipAudit />);

    selectAllCAnswers();

    fireEvent.click(screen.getByRole("button", { name: "Complete Audit" }));

    expect(
      await screen.findByRole("heading", { name: "Optimized & Secure" }),
    ).toBeInTheDocument();

    expect(screen.getByText("Strong Ownership")).toBeInTheDocument();
    expect(screen.getByText("Your Audit Score")).toBeInTheDocument();

    expect(
      screen.getByText("15", { selector: "p.text-4xl" }),
    ).toBeInTheDocument();

    expect(screen.getByText("/ 15")).toBeInTheDocument();

    const ownershipAuditCalls = getOwnershipAuditCalls(fetchMock);

    expect(ownershipAuditCalls).toHaveLength(1);

    const [, requestOptions] = ownershipAuditCalls[0] as [
      string,
      { body?: string },
    ];

    expect(JSON.parse(requestOptions.body ?? "{}")).toEqual({
      step1: "C",
      step2: "C",
      step3: "C",
    });

    const analyticsEvents = getAnalyticsEventNames(fetchMock);

    expect(analyticsEvents).toContain("ownership.audit.completed");
  });

  it("shows a safe message when the audit cannot be saved", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/api/v1/ownership-audits")) {
        return Promise.resolve({
          status: 500,
          ok: false,
          json: async () => ({
            error: {
              code: "INTERNAL_SERVER_ERROR",
              message: "Database failure",
            },
          }),
        });
      }

      return Promise.resolve({ ok: true });
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<TechnologyOwnershipAudit />);

    selectAllCAnswers();

    fireEvent.click(screen.getByRole("button", { name: "Complete Audit" }));

    const alert = await screen.findByRole("alert");

    expect(alert.textContent).toBe(
      "We could not save your audit right now. Please try again in a moment.",
    );

    expect(alert.textContent).not.toContain("Database failure");

    expect(getAnalyticsEventNames(fetchMock)).not.toContain(
      "ownership.audit.completed",
    );
  });

  it("allows the user to retake the audit after seeing the result", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/api/v1/ownership-audits")) {
        return Promise.resolve({
          status: 201,
          ok: true,
          json: async () => ({
            data: {
              id: "audit-1",
              step1: "C",
              step2: "C",
              step3: "C",
              score: 15,
              category: "Strong Ownership",
              createdAt: "2026-10-30T00:00:00.000Z",
            },
          }),
        });
      }

      return Promise.resolve({ ok: true });
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<TechnologyOwnershipAudit />);

    selectAllCAnswers();

    fireEvent.click(screen.getByRole("button", { name: "Complete Audit" }));

    await screen.findByRole("heading", { name: "Optimized & Secure" });

    fireEvent.click(screen.getByRole("button", { name: "Retake Audit" }));

    expect(
      screen.getByRole("heading", { name: "Project Scope & Current Stage" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("radio", {
        name: /^C/,
      }),
    ).not.toBeChecked();
  });

  it("disables Complete Audit while the request is being saved", async () => {
    let resolveRequest!: (value: unknown) => void;

    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/api/v1/ownership-audits")) {
        return new Promise((resolve) => {
          resolveRequest = resolve;
        });
      }

      return Promise.resolve({ ok: true });
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<TechnologyOwnershipAudit />);

    selectAllCAnswers();

    fireEvent.click(screen.getByRole("button", { name: "Complete Audit" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Saving..." })).toBeDisabled();
    });

    resolveRequest({
      status: 201,
      ok: true,
      json: async () => ({
        data: {
          id: "audit-1",
          step1: "C",
          step2: "C",
          step3: "C",
          score: 15,
          category: "Strong Ownership",
          createdAt: "2026-10-30T00:00:00.000Z",
        },
      }),
    });

    await screen.findByRole("heading", { name: "Optimized & Secure" });
  });
});
