import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import TechnologyOwnershipAudit from "../../src/components/TechnologyOwnershipAudit";

function analyticsNames(fetchMock: ReturnType<typeof vi.fn>) {
  return fetchMock.mock.calls
    .filter((call) => String(call[0]).includes("/api/v1/analytics/events"))
    .map((call) => {
      const options = call[1] as { body?: URLSearchParams } | undefined;
      return options?.body instanceof URLSearchParams
        ? options.body.get("name")
        : undefined;
    });
}

function selectFirst(option: "A" | "B" | "C") {
  fireEvent.click(screen.getAllByRole("radio", { name: new RegExp(`^${option}`) })[0]);
}

function selectSecond(option: "A" | "B" | "C") {
  fireEvent.click(screen.getAllByRole("radio", { name: new RegExp(`^${option}`) })[1]);
}

function completeDetails() {
  fireEvent.click(screen.getByRole("button", { name: "Start Ownership Audit" }));
  fireEvent.change(screen.getByRole("textbox", { name: "Full Name" }), {
    target: { value: "Test Visitor" },
  });
  fireEvent.change(screen.getByRole("textbox", { name: "Email" }), {
    target: { value: "test@example.com" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Begin Questions" }));
}

async function completeAllC() {
  for (let page = 0; page < 5; page += 1) {
    selectFirst("C");
    selectSecond("C");
    if (page < 4) fireEvent.click(screen.getByRole("button", { name: "Next" }));
  }
  fireEvent.click(screen.getByRole("button", { name: "Calculate Score" }));
}

describe("TechnologyOwnershipAudit", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("renders the About Audit first screen and viewed analytics", () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    render(<TechnologyOwnershipAudit />);

    expect(screen.getByText("About the Audit")).toBeInTheDocument();
    expect(screen.getByText(/10 questions/)).toBeInTheDocument();
    expect(analyticsNames(fetchMock)).toContain("ownership.audit.viewed");
  });

  it("requires visitor details before starting questions", () => {
    render(<TechnologyOwnershipAudit />);

    fireEvent.click(screen.getByRole("button", { name: "Start Ownership Audit" }));
    fireEvent.click(screen.getByRole("button", { name: "Begin Questions" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Please enter your full name.");
  });

  it("starts only after valid visitor details", () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    render(<TechnologyOwnershipAudit />);
    completeDetails();

    expect(screen.getByText(/Audit Questions \(1 of 5\)/)).toBeInTheDocument();
    expect(analyticsNames(fetchMock)).toContain("ownership.audit.started");
  });

  it("validates both questions on each question screen", () => {
    render(<TechnologyOwnershipAudit />);
    completeDetails();

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Please answer both questions");
  });

  it("submits all ten answers and renders score, results and analytics screens", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/api/v1/ownership-audits")) {
        return Promise.resolve({
          ok: true,
          status: 201,
          json: async () => ({
            data: {
              id: "audit-1",
              fullName: "Test Visitor",
              visitorEmail: "test@example.com",
              score: 100,
              category: "Strong Ownership",
              diagnosticResult: "Highly mature, automated, and secure architecture.",
              redirectTarget: "Coffee With Me",
              createdAt: "2026-11-01T00:00:00.000Z",
            },
          }),
        });
      }
      return Promise.resolve({ ok: true });
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<TechnologyOwnershipAudit />);
    completeDetails();
    await completeAllC();

    expect(await screen.findByText("100")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "View Results" }));
    expect(screen.getByText("Strong Ownership")).toBeInTheDocument();
    expect(screen.getByText("Coffee With Me")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByText("Analytics Recorded")).toBeInTheDocument();

    const auditCall = fetchMock.mock.calls.find((call) =>
      String(call[0]).includes("/api/v1/ownership-audits"),
    );
    expect(JSON.parse((auditCall?.[1] as { body: string }).body)).toMatchObject({
      fullName: "Test Visitor",
      visitorEmail: "test@example.com",
      q1: "C", q2: "C", q3: "C", q4: "C", q5: "C",
      q6: "C", q7: "C", q8: "C", q9: "C", q10: "C",
    });
    expect(analyticsNames(fetchMock)).toContain("ownership.audit.completed");
  });

  it("does not emit completed when persistence fails", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/api/v1/ownership-audits")) {
        return Promise.resolve({
          ok: false,
          status: 500,
          json: async () => ({ error: { message: "Database failure" } }),
        });
      }
      return Promise.resolve({ ok: true });
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<TechnologyOwnershipAudit />);
    completeDetails();
    await completeAllC();

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Database failure"));
    expect(analyticsNames(fetchMock)).not.toContain("ownership.audit.completed");
  });
});
