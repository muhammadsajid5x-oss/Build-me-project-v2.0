/**
 * @vitest-environment jsdom
 */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import TechnologyOwnershipToolkit from "../../src/components/TechnologyOwnershipToolkit";

const navigateMock = vi.fn();
const downloadPdfMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("../../src/utils/download-technology-ownership-toolkit", () => ({
  downloadTechnologyOwnershipToolkitPdf: () => downloadPdfMock(),
}));

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

function getToolkitAccessCalls(fetchMock: ReturnType<typeof vi.fn>) {
  return fetchMock.mock.calls.filter((call) =>
    String(call[0]).includes("/api/v1/ownership-toolkit-accesses"),
  );
}

function renderToolkit() {
  return render(
    <MemoryRouter>
      <TechnologyOwnershipToolkit />
    </MemoryRouter>,
  );
}

function goToVisitorDetails() {
  fireEvent.click(
    screen.getByRole("button", {
      name: "Continue Next Step",
    }),
  );
}

function enterVisitorDetails(
  fullName = "Ada Lovelace",
  email = "ada@example.com",
) {
  fireEvent.change(screen.getByLabelText(/full name/i), {
    target: { value: fullName },
  });

  fireEvent.change(screen.getByLabelText(/email address/i), {
    target: { value: email },
  });
}

function mockSuccessfulAccess(fetchMock: ReturnType<typeof vi.fn>) {
  fetchMock.mockImplementation((url: string) => {
    if (url.includes("/api/v1/ownership-toolkit-accesses")) {
      return Promise.resolve({
        status: 201,
        ok: true,
        json: async () => ({
          data: {
            id: "ownership-toolkit-access-1",
            userId: null,
            fullName: "Ada Lovelace",
            visitorEmail: "ada@example.com",
            createdAt: "2026-11-01T00:00:00.000Z",
          },
        }),
      });
    }

    return Promise.resolve({
      status: 202,
      ok: true,
      json: async () => ({
        data: {
          accepted: true,
        },
      }),
    });
  });
}

describe("TechnologyOwnershipToolkit", () => {
  beforeEach(() => {
    navigateMock.mockReset();
    downloadPdfMock.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("renders the Ownership Toolkit introduction", () => {
    renderToolkit();

    expect(screen.getByText("Technology Ownership Toolkit")).toBeTruthy();

    expect(screen.getByText("Step 1 of 3")).toBeTruthy();

    expect(
      screen.getByRole("heading", {
        name: "Why use the Technology Ownership Toolkit?",
      }),
    ).toBeTruthy();

    expect(screen.getByText(/complete technology lifecycle/i)).toBeTruthy();

    expect(
      screen.getByRole("button", {
        name: "Continue Next Step",
      }),
    ).toBeTruthy();
  });

  it("moves to visitor details when Continue Next Step is clicked", () => {
    renderToolkit();

    goToVisitorDetails();

    expect(screen.getByText("Step 2 of 3")).toBeTruthy();

    expect(
      screen.getByRole("heading", {
        name: "Access the Toolkit",
      }),
    ).toBeTruthy();

    expect(screen.getByLabelText(/full name/i)).toBeTruthy();

    expect(screen.getByLabelText(/email address/i)).toBeTruthy();
  });

  it("validates the required full name", () => {
    renderToolkit();

    goToVisitorDetails();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Access Toolkit",
      }),
    );

    const alert = screen.getByRole("alert");

    expect(alert).toBeTruthy();
    expect(alert.textContent).toContain("Please enter your full name.");

    expect(screen.getByText("Step 2 of 3")).toBeTruthy();
  });

  it("validates the visitor email address", () => {
    renderToolkit();

    goToVisitorDetails();

    enterVisitorDetails("Ada Lovelace", "invalid-email");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Access Toolkit",
      }),
    );

    const alert = screen.getByRole("alert");

    expect(alert).toBeTruthy();
    expect(alert.textContent).toContain("Please enter a valid email address.");

    expect(screen.getByText("Step 2 of 3")).toBeTruthy();
  });

  it("submits visitor details to the Ownership Toolkit API", async () => {
    const fetchMock = vi.fn();

    mockSuccessfulAccess(fetchMock);
    vi.stubGlobal("fetch", fetchMock);

    renderToolkit();

    goToVisitorDetails();

    enterVisitorDetails("Ada Lovelace", "ada@example.com");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Access Toolkit",
      }),
    );

    await screen.findByText("Step 3 of 3");

    const toolkitCalls = getToolkitAccessCalls(fetchMock);

    expect(toolkitCalls).toHaveLength(1);

    const [, requestOptions] = toolkitCalls[0] as [
      string,
      {
        method?: string;
        headers?: Record<string, string>;
        body?: string;
      },
    ];

    expect(requestOptions.method).toBe("POST");

    expect(requestOptions.headers).toMatchObject({
      "Content-Type": "application/json",
    });

    expect(JSON.parse(requestOptions.body ?? "{}")).toEqual({
      fullName: "Ada Lovelace",
      visitorEmail: "ada@example.com",
    });
  });

  it("normalizes the visitor email before submitting", async () => {
    const fetchMock = vi.fn();

    mockSuccessfulAccess(fetchMock);
    vi.stubGlobal("fetch", fetchMock);

    renderToolkit();

    goToVisitorDetails();

    enterVisitorDetails("Ada Lovelace", "ADA@EXAMPLE.COM");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Access Toolkit",
      }),
    );

    await screen.findByText("Step 3 of 3");

    const toolkitCalls = getToolkitAccessCalls(fetchMock);

    expect(toolkitCalls).toHaveLength(1);

    const [, requestOptions] = toolkitCalls[0] as [
      string,
      {
        body?: string;
      },
    ];

    expect(JSON.parse(requestOptions.body ?? "{}")).toEqual({
      fullName: "Ada Lovelace",
      visitorEmail: "ada@example.com",
    });
  });

  it("fires ownership.toolkit.completed only after a successful save", async () => {
    const fetchMock = vi.fn();

    mockSuccessfulAccess(fetchMock);
    vi.stubGlobal("fetch", fetchMock);

    renderToolkit();

    goToVisitorDetails();

    enterVisitorDetails();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Access Toolkit",
      }),
    );

    await screen.findByText("Step 3 of 3");

    expect(getAnalyticsEventNames(fetchMock)).toContain(
      "ownership.toolkit.completed",
    );
  });

  it("does not complete the journey when the API save fails", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/api/v1/ownership-toolkit-accesses")) {
        return Promise.resolve({
          status: 500,
          ok: false,
          json: async () => ({
            error: "Database failure",
          }),
        });
      }

      return Promise.resolve({
        status: 202,
        ok: true,
      });
    });

    vi.stubGlobal("fetch", fetchMock);

    renderToolkit();

    goToVisitorDetails();

    enterVisitorDetails();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Access Toolkit",
      }),
    );

    const alert = await screen.findByRole("alert");

    expect(alert.textContent).toContain(
      "We could not save your details. Please try again.",
    );

    expect(screen.getByText("Step 2 of 3")).toBeTruthy();

    expect(screen.queryByText("Step 3 of 3")).toBeNull();

    expect(getAnalyticsEventNames(fetchMock)).not.toContain(
      "ownership.toolkit.completed",
    );
  });

  it("allows the visitor to return from details to the introduction", () => {
    renderToolkit();

    goToVisitorDetails();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Back",
      }),
    );

    expect(screen.getByText("Step 1 of 3")).toBeTruthy();

    expect(
      screen.getByRole("heading", {
        name: "Why use the Technology Ownership Toolkit?",
      }),
    ).toBeTruthy();
  });

  it("shows exactly the two final Toolkit actions after successful access", async () => {
    const fetchMock = vi.fn();

    mockSuccessfulAccess(fetchMock);
    vi.stubGlobal("fetch", fetchMock);

    renderToolkit();

    goToVisitorDetails();

    enterVisitorDetails();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Access Toolkit",
      }),
    );

    await screen.findByText("Step 3 of 3");

    expect(
      screen.getByRole("button", {
        name: /View Online/,
      }),
    ).toBeTruthy();

    expect(
      screen.getByRole("button", {
        name: /Download PDF/,
      }),
    ).toBeTruthy();

    expect(screen.getAllByRole("button")).toHaveLength(2);
  });

  it("navigates to the online Ownership Toolkit", async () => {
    const fetchMock = vi.fn();

    mockSuccessfulAccess(fetchMock);
    vi.stubGlobal("fetch", fetchMock);

    renderToolkit();

    goToVisitorDetails();

    enterVisitorDetails();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Access Toolkit",
      }),
    );

    await screen.findByText("Step 3 of 3");

    fireEvent.click(
      screen.getByRole("button", {
        name: /View Online/,
      }),
    );

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith("/ownership-toolkit");
  });

  it("downloads the Toolkit PDF and fires ownership.toolkit.downloaded", async () => {
    const fetchMock = vi.fn();

    mockSuccessfulAccess(fetchMock);
    vi.stubGlobal("fetch", fetchMock);

    renderToolkit();

    goToVisitorDetails();

    enterVisitorDetails();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Access Toolkit",
      }),
    );

    await screen.findByText("Step 3 of 3");

    fireEvent.click(
      screen.getByRole("button", {
        name: /Download PDF/,
      }),
    );

    expect(downloadPdfMock).toHaveBeenCalledTimes(1);

    expect(getAnalyticsEventNames(fetchMock)).toContain(
      "ownership.toolkit.downloaded",
    );
  });

  it("shows the download error when PDF generation fails", async () => {
    const fetchMock = vi.fn();

    mockSuccessfulAccess(fetchMock);
    vi.stubGlobal("fetch", fetchMock);

    downloadPdfMock.mockImplementation(() => {
      throw new Error("PDF generation failed");
    });

    renderToolkit();

    goToVisitorDetails();

    enterVisitorDetails();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Access Toolkit",
      }),
    );

    await screen.findByText("Step 3 of 3");

    fireEvent.click(
      screen.getByRole("button", {
        name: /Download PDF/,
      }),
    );

    const alert = screen.getByRole("alert");

    expect(alert.textContent).toContain(
      "The Toolkit PDF could not be downloaded. Please try again.",
    );

    expect(getAnalyticsEventNames(fetchMock)).not.toContain(
      "ownership.toolkit.downloaded",
    );
  });

  it("disables Access Toolkit while the request is saving", async () => {
    let resolveSave!: (value: unknown) => void;

    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/api/v1/ownership-toolkit-accesses")) {
        return new Promise((resolve) => {
          resolveSave = resolve;
        });
      }

      return Promise.resolve({
        status: 202,
        ok: true,
      });
    });

    vi.stubGlobal("fetch", fetchMock);

    renderToolkit();

    goToVisitorDetails();

    enterVisitorDetails();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Access Toolkit",
      }),
    );

    await waitFor(() => {
      const savingButton = screen.getByRole("button", {
        name: "Saving...",
      });

      expect(savingButton).toBeTruthy();
      expect((savingButton as HTMLButtonElement).disabled).toBe(true);
    });

    expect(getToolkitAccessCalls(fetchMock)).toHaveLength(1);

    resolveSave({
      status: 201,
      ok: true,
      json: async () => ({
        data: {
          id: "ownership-toolkit-access-1",
          userId: null,
          fullName: "Ada Lovelace",
          visitorEmail: "ada@example.com",
          createdAt: "2026-11-01T00:00:00.000Z",
        },
      }),
    });

    await screen.findByText("Step 3 of 3");
  });
});
