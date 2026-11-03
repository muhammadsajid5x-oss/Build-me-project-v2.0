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
function selectAnswer(value: "A" | "B" | "C", index = 0) {
  const radios = screen
    .getAllByRole("radio")
    .filter((radio) => radio.getAttribute("value") === value);
  fireEvent.click(radios[index]);
}
function clickButton(name: RegExp | string) {
  fireEvent.click(screen.getByRole("button", { name }));
}
function enterAuditDetails() {
  fireEvent.change(screen.getByLabelText(/full name/i), {
    target: { value: "Ada Lovelace" },
  });
  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: "ada@example.com" },
  });
  clickButton(/continue/i);
}
function startAudit() {
  clickButton(/start.*audit|begin.*audit/i);
}
function selectCurrentPageAnswers(value: "A" | "B" | "C") {
  selectAnswer(value, 0);
  selectAnswer(value, 1);
}
function completeAllQuestions(value: "A" | "B" | "C") {
  for (let page = 1; page <= 5; page += 1) {
    selectCurrentPageAnswers(value);
    if (page < 5) {
      clickButton(/^Next$/i);
    }
  }
}
function mockSuccessfulSave(fetchMock: ReturnType<typeof vi.fn>) {
  fetchMock.mockImplementation((url: string) => {
    if (url.includes("/api/v1/ownership-audits")) {
      return Promise.resolve({
        status: 201,
        ok: true,
        json: async () => ({
          data: {
            id: "audit-1",
            fullName: "Ada Lovelace",
            visitorEmail: "ada@example.com",
            score: 100,
            category: "Strong Ownership",
            answers: {
              q1: "C",
              q2: "C",
              q3: "C",
              q4: "C",
              q5: "C",
              q6: "C",
              q7: "C",
              q8: "C",
              q9: "C",
              q10: "C",
            },
            createdAt: "2026-10-30T00:00:00.000Z",
          },
        }),
      });
    }
    return Promise.resolve({ ok: true });
  });
}
describe("TechnologyOwnershipAudit", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });
  it("renders the Ownership Audit introduction", () => {
    render(<TechnologyOwnershipAudit />);
    expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Assess your technology ownership across architecture, source code/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Answer 10 questions to receive a score out of 100/i),
    ).toBeInTheDocument();
  });
  it("fires ownership.audit.viewed when rendered", () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    render(<TechnologyOwnershipAudit />);
    expect(getAnalyticsEventNames(fetchMock)).toContain(
      "ownership.audit.viewed",
    );
  });
  it("shows visitor details after starting the audit", () => {
    render(<TechnologyOwnershipAudit />);
    startAudit();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
  });
  it("validates required visitor details", () => {
    render(<TechnologyOwnershipAudit />);
    startAudit();
    clickButton(/continue/i);
    expect(
      screen.getByRole("alert", { name: "" }),
    ).toHaveTextContent("Please enter your full name.");
  });
  it("enters Step 2 after valid visitor details", () => {
    render(<TechnologyOwnershipAudit />);
    startAudit();
    enterAuditDetails();
    expect(screen.getByText("Step 2 of 3")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Project Readiness & Timelines",
      }),
    ).toBeInTheDocument();
  });
  it("fires ownership.audit.started when the first answer is selected", () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    render(<TechnologyOwnershipAudit />);
    startAudit();
    enterAuditDetails();
    selectAnswer("B");
    expect(getAnalyticsEventNames(fetchMock)).toContain(
      "ownership.audit.started",
    );
  });
  it("requires an answer before moving to the next question page", () => {
    render(<TechnologyOwnershipAudit />);
    startAudit();
    enterAuditDetails();
    clickButton(/^Next$/i);
    expect(
      screen.getByRole("alert", { name: "" }),
    ).toHaveTextContent("Please answer both questions before continuing.");
  });
  it("moves through all five question pages", () => {
    render(<TechnologyOwnershipAudit />);
    startAudit();
    enterAuditDetails();
    for (let page = 1; page <= 5; page += 1) {
      expect(screen.getByText("Step 2 of 3")).toBeInTheDocument();
      expect(
        screen.getAllByRole("heading", {
          name: new RegExp(
            [
              "Project Readiness & Timelines",
              "Core Technology Stack & Infrastructure",
              "Source Code & Repository Control",
              "Software Subscriptions & Infrastructure Accounts",
              "Quality Assurance & Automated Testing",
              "Data Protection & Database Management",
              "Technical Documentation & Knowledge Base",
              "Offboarding & Off-Board Access Revocation",
              "DevSecOps & Security Monitoring",
              "Engineering Budget & Scaling Capacity",
            ].join("|"),
          ),
        }).length,
      ).toBe(2);
      selectCurrentPageAnswers("B");
      if (page < 5) {
        clickButton(/^Next$/i);
      }
    }
  });
  it("saves all ten answers when Continue to Score is clicked", async () => {
    const fetchMock = vi.fn();
    mockSuccessfulSave(fetchMock);
    vi.stubGlobal("fetch", fetchMock);
    render(<TechnologyOwnershipAudit />);
    startAudit();
    enterAuditDetails();
    completeAllQuestions("C");
    fireEvent.click(
      screen.getByRole("button", { name: "Continue to Score" }),
    );
    await screen.findByText("Step 3 of 3");
    const ownershipAuditCalls = getOwnershipAuditCalls(fetchMock);
    expect(ownershipAuditCalls).toHaveLength(1);
    const [, requestOptions] = ownershipAuditCalls[0] as [
      string,
      { body?: string },
    ];
    expect(JSON.parse(requestOptions.body ?? "{}")).toEqual({
      fullName: "Ada Lovelace",
      visitorEmail: "ada@example.com",
      answers: {
        q1: "C",
        q2: "C",
        q3: "C",
        q4: "C",
        q5: "C",
        q6: "C",
        q7: "C",
        q8: "C",
        q9: "C",
        q10: "C",
      },
    });
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("Strong Ownership")).toBeInTheDocument();
    expect(getAnalyticsEventNames(fetchMock)).toContain(
      "ownership.audit.completed",
    );
  });
  it("does not open the score screen before the audit save succeeds", async () => {
    let resolveSave!: (value: unknown) => void;
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/api/v1/ownership-audits")) {
        return new Promise((resolve) => {
          resolveSave = resolve;
        });
      }
      return Promise.resolve({ ok: true });
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<TechnologyOwnershipAudit />);
    startAudit();
    enterAuditDetails();
    completeAllQuestions("C");
    fireEvent.click(
      screen.getByRole("button", { name: "Continue to Score" }),
    );
    expect(screen.getByText("Step 2 of 3")).toBeInTheDocument();
    expect(screen.queryByText("Step 3 of 3")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Saving..." }),
    ).toBeDisabled();
    resolveSave({
      status: 201,
      ok: true,
      json: async () => ({
        data: {
          id: "audit-1",
          fullName: "Ada Lovelace",
          visitorEmail: "ada@example.com",
          score: 100,
          category: "Strong Ownership",
          answers: {
            q1: "C",
            q2: "C",
            q3: "C",
            q4: "C",
            q5: "C",
            q6: "C",
            q7: "C",
            q8: "C",
            q9: "C",
            q10: "C",
          },
          createdAt: "2026-10-30T00:00:00.000Z",
        },
      }),
    });
    await screen.findByText("Step 3 of 3");
  });
  it("prevents duplicate audit submissions while saving", async () => {
    let resolveSave!: (value: unknown) => void;
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/api/v1/ownership-audits")) {
        return new Promise((resolve) => {
          resolveSave = resolve;
        });
      }
      return Promise.resolve({ ok: true });
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<TechnologyOwnershipAudit />);
    startAudit();
    enterAuditDetails();
    completeAllQuestions("C");
    const continueButton = screen.getByRole("button", {
      name: "Continue to Score",
    });
    fireEvent.click(continueButton);
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Saving..." }),
      ).toBeDisabled();
    });
    expect(getOwnershipAuditCalls(fetchMock)).toHaveLength(1);
    resolveSave({
      status: 201,
      ok: true,
      json: async () => ({
        data: {
          id: "audit-1",
          fullName: "Ada Lovelace",
          visitorEmail: "ada@example.com",
          score: 100,
          category: "Strong Ownership",
          answers: {
            q1: "C",
            q2: "C",
            q3: "C",
            q4: "C",
            q5: "C",
            q6: "C",
            q7: "C",
            q8: "C",
            q9: "C",
            q10: "C",
          },
          createdAt: "2026-10-30T00:00:00.000Z",
        },
      }),
    });
    await screen.findByText("Step 3 of 3");
  });
  it("keeps the user on the questions when the audit cannot be saved", async () => {
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
    startAudit();
    enterAuditDetails();
    completeAllQuestions("C");
    fireEvent.click(
      screen.getByRole("button", { name: "Continue to Score" }),
    );
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain(
      "We could not save your audit right now",
    );
    expect(screen.getByText("Step 2 of 3")).toBeInTheDocument();
    expect(screen.queryByText("Step 3 of 3")).not.toBeInTheDocument();
    expect(getAnalyticsEventNames(fetchMock)).not.toContain(
      "ownership.audit.completed",
    );
  });
  it("shows the Strong Ownership result for ten C answers", async () => {
    const fetchMock = vi.fn();
    mockSuccessfulSave(fetchMock);
    vi.stubGlobal("fetch", fetchMock);
    render(<TechnologyOwnershipAudit />);
    startAudit();
    enterAuditDetails();
    completeAllQuestions("C");
    clickButton(/continue to score/i);
    await screen.findByText("Step 3 of 3");
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("Strong Ownership")).toBeInTheDocument();
    expect(screen.getAllByText(/Coffee With Me/i)).toHaveLength(2);
  });
  it("allows the user to retake the audit after seeing results", async () => {
    const fetchMock = vi.fn();
    mockSuccessfulSave(fetchMock);
    vi.stubGlobal("fetch", fetchMock);
    render(<TechnologyOwnershipAudit />);
    startAudit();
    enterAuditDetails();
    completeAllQuestions("C");
    clickButton(/continue to score/i);
    await screen.findByText("Step 3 of 3");
    clickButton(/retake audit/i);
    expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
  });
});


