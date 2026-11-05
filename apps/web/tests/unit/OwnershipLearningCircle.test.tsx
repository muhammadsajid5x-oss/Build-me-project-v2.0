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
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import OwnershipLearningCircle from "../../src/components/OwnershipLearningCircle";

const TELEGRAM_GROUP_URL = "https://t.me/+Q9KY1dL4c-BkMjg8";

function getAnalyticsEventNames(fetchMock: ReturnType<typeof vi.fn>) {
  return fetchMock.mock.calls
    .filter((call) => String(call[0]).includes("/api/v1/analytics/events"))
    .map((call) => {
      const options = call[1] as { body?: URLSearchParams } | undefined;

      return options?.body instanceof URLSearchParams
        ? options.body.get("name")
        : undefined;
    });
}

function getLearningCircleCalls(fetchMock: ReturnType<typeof vi.fn>) {
  return fetchMock.mock.calls.filter((call) =>
    String(call[0]).includes("/api/v1/ownership-learning-circle-requests"),
  );
}

function renderLearningCircle() {
  return render(<OwnershipLearningCircle />);
}

function goToVisitorDetails() {
  fireEvent.click(
    screen.getByRole("button", {
      name: "Continue",
    }),
  );
}

function enterVisitorDetails(name = "Ada Lovelace", email = "ada@example.com") {
  fireEvent.change(screen.getByLabelText("Name"), {
    target: { value: name },
  });

  fireEvent.change(screen.getByLabelText("Email address"), {
    target: { value: email },
  });
}

function mockSuccessfulSave(fetchMock: ReturnType<typeof vi.fn>) {
  fetchMock.mockImplementation((url: string) => {
    if (url.includes("/api/v1/ownership-learning-circle-requests")) {
      return Promise.resolve({
        status: 201,
        ok: true,
        json: async () => ({
          data: {
            id: "learning-circle-request-1",
            name: "Ada Lovelace",
            email: "ada@example.com",
            status: "new",
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

describe("OwnershipLearningCircle", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("renders the Learning Circle introduction", () => {
    renderLearningCircle();

    expect(
      screen.getByRole("heading", {
        name: "Join the Ownership Learning Circle",
      }),
    ).toBeTruthy();

    expect(screen.getByText("Step 1 of 3")).toBeTruthy();

    expect(screen.getByText("What is the Learning Circle?")).toBeTruthy();

    expect(screen.getByText("Who is it for?")).toBeTruthy();

    expect(screen.getByText("What do members get?")).toBeTruthy();

    expect(
      screen.getByRole("button", {
        name: "Continue",
      }),
    ).toBeTruthy();
  });

  it("moves to visitor details when Continue is clicked", () => {
    renderLearningCircle();

    goToVisitorDetails();

    expect(screen.getByText("Step 2 of 3")).toBeTruthy();

    expect(
      screen.getByRole("heading", {
        name: "Join the Learning Circle",
      }),
    ).toBeTruthy();

    expect(screen.getByLabelText("Name")).toBeTruthy();

    expect(screen.getByLabelText("Email address")).toBeTruthy();
  });

  it("updates the journey progress when moving between steps", () => {
    renderLearningCircle();

    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe(
      "1",
    );

    goToVisitorDetails();

    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe(
      "2",
    );
  });

  it("validates the required visitor name", () => {
    renderLearningCircle();

    goToVisitorDetails();

    enterVisitorDetails("", "ada@example.com");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Join the Learning Circle",
      }),
    );

    expect(screen.getByRole("alert").textContent).toContain(
      "Please enter your name.",
    );

    expect(screen.getByText("Step 2 of 3")).toBeTruthy();

    expect(
      getLearningCircleCalls(fetch as ReturnType<typeof vi.fn>),
    ).toHaveLength(0);
  });

  it("rejects visitor names shorter than two characters", () => {
    renderLearningCircle();

    goToVisitorDetails();

    enterVisitorDetails("A", "ada@example.com");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Join the Learning Circle",
      }),
    );

    expect(screen.getByRole("alert").textContent).toContain(
      "Please enter your name.",
    );
  });

  it("validates the visitor email address", () => {
    renderLearningCircle();

    goToVisitorDetails();

    enterVisitorDetails("Ada Lovelace", "invalid-email");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Join the Learning Circle",
      }),
    );

    expect(screen.getByRole("alert").textContent).toContain(
      "Please enter a valid email address.",
    );

    expect(screen.getByText("Step 2 of 3")).toBeTruthy();

    expect(
      getLearningCircleCalls(fetch as ReturnType<typeof vi.fn>),
    ).toHaveLength(0);
  });

  it("submits visitor details to the Learning Circle API", async () => {
    const fetchMock = vi.fn();

    mockSuccessfulSave(fetchMock);
    vi.stubGlobal("fetch", fetchMock);

    renderLearningCircle();

    goToVisitorDetails();

    enterVisitorDetails();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Join the Learning Circle",
      }),
    );

    await screen.findByText("Step 3 of 3");

    const calls = getLearningCircleCalls(fetchMock);

    expect(calls).toHaveLength(1);

    const [, requestOptions] = calls[0] as [
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
      name: "Ada Lovelace",
      email: "ada@example.com",
    });
  });

  it("trims the visitor name and normalizes the email before submission", async () => {
    const fetchMock = vi.fn();

    mockSuccessfulSave(fetchMock);
    vi.stubGlobal("fetch", fetchMock);

    renderLearningCircle();

    goToVisitorDetails();

    enterVisitorDetails("  Ada Lovelace  ", " ADA@EXAMPLE.COM ");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Join the Learning Circle",
      }),
    );

    await screen.findByText("Step 3 of 3");

    const calls = getLearningCircleCalls(fetchMock);

    const [, requestOptions] = calls[0] as [string, { body?: string }];

    expect(JSON.parse(requestOptions.body ?? "{}")).toEqual({
      name: "Ada Lovelace",
      email: "ada@example.com",
    });
  });

  it("fires circle.join.click only after a successful save", async () => {
    const fetchMock = vi.fn();

    mockSuccessfulSave(fetchMock);
    vi.stubGlobal("fetch", fetchMock);

    renderLearningCircle();

    goToVisitorDetails();

    enterVisitorDetails();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Join the Learning Circle",
      }),
    );

    await screen.findByText("Step 3 of 3");

    expect(getAnalyticsEventNames(fetchMock)).toContain("circle.join.click");
  });

  it("does not complete the journey when the API save fails", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/api/v1/ownership-learning-circle-requests")) {
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

    renderLearningCircle();

    goToVisitorDetails();

    enterVisitorDetails();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Join the Learning Circle",
      }),
    );

    expect(await screen.findByRole("alert")).toBeTruthy();

    expect(screen.getByRole("alert").textContent).toContain(
      "We could not save your details. Please try again.",
    );

    expect(screen.getByText("Step 2 of 3")).toBeTruthy();

    expect(screen.queryByText("Step 3 of 3")).toBeNull();

    expect(getAnalyticsEventNames(fetchMock)).not.toContain(
      "circle.join.click",
    );
  });

  it("disables the Join button while the request is saving", async () => {
    let resolveSave!: (value: unknown) => void;

    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/api/v1/ownership-learning-circle-requests")) {
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

    renderLearningCircle();

    goToVisitorDetails();

    enterVisitorDetails();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Join the Learning Circle",
      }),
    );

    await waitFor(() => {
      const joiningButton = screen.getByRole("button", {
        name: "Joining...",
      });

      expect((joiningButton as HTMLButtonElement).disabled).toBe(true);
    });

    expect(getLearningCircleCalls(fetchMock)).toHaveLength(1);

    resolveSave({
      status: 201,
      ok: true,
      json: async () => ({
        data: {
          id: "learning-circle-request-1",
          name: "Ada Lovelace",
          email: "ada@example.com",
          status: "new",
        },
      }),
    });

    await screen.findByText("Step 3 of 3");
  });

  it("shows the Telegram invitation after successful submission", async () => {
    const fetchMock = vi.fn();

    mockSuccessfulSave(fetchMock);
    vi.stubGlobal("fetch", fetchMock);

    renderLearningCircle();

    goToVisitorDetails();

    enterVisitorDetails();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Join the Learning Circle",
      }),
    );

    await screen.findByText("Step 3 of 3");

    expect(
      screen.getByRole("heading", {
        name: "You're ready to join",
      }),
    ).toBeTruthy();

    expect(
      screen.getByRole("button", {
        name: "Join on Telegram",
      }),
    ).toBeTruthy();

    expect(
      screen.getByRole("button", {
        name: "Copy Telegram Link",
      }),
    ).toBeTruthy();
  });

  it("opens the Telegram invitation in a new tab and tracks the redirect", async () => {
    const fetchMock = vi.fn();

    mockSuccessfulSave(fetchMock);
    vi.stubGlobal("fetch", fetchMock);

    const openMock = vi.fn();
    vi.stubGlobal("open", openMock);

    renderLearningCircle();

    goToVisitorDetails();

    enterVisitorDetails();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Join the Learning Circle",
      }),
    );

    await screen.findByText("Step 3 of 3");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Join on Telegram",
      }),
    );

    expect(openMock).toHaveBeenCalledWith(
      TELEGRAM_GROUP_URL,
      "_blank",
      "noopener,noreferrer",
    );

    expect(getAnalyticsEventNames(fetchMock)).toContain(
      "circle.telegram.redirect",
    );
  });

  it("copies the Telegram invitation link", async () => {
    const fetchMock = vi.fn();

    mockSuccessfulSave(fetchMock);
    vi.stubGlobal("fetch", fetchMock);

    const writeTextMock = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: writeTextMock,
      },
    });

    renderLearningCircle();

    goToVisitorDetails();

    enterVisitorDetails();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Join the Learning Circle",
      }),
    );

    await screen.findByText("Step 3 of 3");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Copy Telegram Link",
      }),
    );

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledWith(TELEGRAM_GROUP_URL);
    });

    expect(
      await screen.findByRole("button", {
        name: "Telegram Link Copied",
      }),
    ).toBeTruthy();
  });

  it("shows an error when copying the Telegram link fails", async () => {
    const fetchMock = vi.fn();

    mockSuccessfulSave(fetchMock);
    vi.stubGlobal("fetch", fetchMock);

    const writeTextMock = vi
      .fn()
      .mockRejectedValue(new Error("Clipboard unavailable"));

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: writeTextMock,
      },
    });

    renderLearningCircle();

    goToVisitorDetails();

    enterVisitorDetails();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Join the Learning Circle",
      }),
    );

    await screen.findByText("Step 3 of 3");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Copy Telegram Link",
      }),
    );

    expect(await screen.findByRole("alert")).toBeTruthy();

    expect(screen.getByRole("alert").textContent).toContain(
      "We could not copy the Telegram link.",
    );
  });
});
