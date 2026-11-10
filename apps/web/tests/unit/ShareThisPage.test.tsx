// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ShareThisPage from "../../src/components/Footer/ShareThisPage";

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

describe("ShareThisPage", () => {
  beforeEach(() => {
    if (!HTMLDialogElement.prototype.showModal) {
      HTMLDialogElement.prototype.showModal = function () {
        this.open = true;
      };
    }

    if (!HTMLDialogElement.prototype.close) {
      HTMLDialogElement.prototype.close = function () {
        this.open = false;
      };
    }
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("renders the Share This Page heading and share button", () => {
    render(<ShareThisPage />);

    expect(
      screen.getByRole("heading", { name: "Share This Page" }),
    ).toBeTruthy();

    expect(
      screen.getByRole("button", { name: "Share this page" }),
    ).toBeTruthy();
  });

  it("fires share.this.page.viewed when rendered", () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<ShareThisPage />);

    expect(getAnalyticsEventNames(fetchMock)).toContain(
      "share.this.page.viewed",
    );
  });

  it("opens the share dialog and fires share.this.page.clicked", () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<ShareThisPage />);

    fireEvent.click(screen.getByRole("button", { name: "Share this page" }));

    expect(screen.getByRole("dialog")).toBeTruthy();

    expect(screen.getByText("Share Cup&Cummit with your network")).toBeTruthy();

    expect(getAnalyticsEventNames(fetchMock)).toContain(
      "share.this.page.clicked",
    );
  });

  it("renders all supported share channels", () => {
    render(<ShareThisPage />);

    fireEvent.click(screen.getByRole("button", { name: "Share this page" }));

    const channels = [
      "Facebook",
      "Instagram",
      "Twitter",
      "LinkedIn",
      "Pinterest",
      "TikTok",
      "Telegram",
      "WhatsApp",
      "YouTube",
      "Snapchat",
      "Email",
    ];

    channels.forEach((channel) => {
      expect(screen.getByRole("button", { name: channel })).toBeTruthy();
    });

    expect(screen.getByRole("button", { name: "Copy Link" })).toBeTruthy();
  });

  it("fires the correct analytics event for every share channel", () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
    });

    const openMock = vi.fn();

    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("open", openMock);

    render(<ShareThisPage />);

    fireEvent.click(screen.getByRole("button", { name: "Share this page" }));

    const channels = [
      ["Facebook", "share.this.page.facebook.clicked"],
      ["Instagram", "share.this.page.instagram.clicked"],
      ["Twitter", "share.this.page.twitter.clicked"],
      ["LinkedIn", "share.this.page.linkedin.clicked"],
      ["Pinterest", "share.this.page.pinterest.clicked"],
      ["TikTok", "share.this.page.tiktok.clicked"],
      ["Telegram", "share.this.page.telegram.clicked"],
      ["WhatsApp", "share.this.page.whatsapp.clicked"],
      ["YouTube", "share.this.page.youtube.clicked"],
      ["Snapchat", "share.this.page.snapchat.clicked"],
      ["Email", "share.this.page.email.clicked"],
    ] as const;

    channels.forEach(([label]) => {
      fireEvent.click(screen.getByRole("button", { name: label }));
    });

    const analyticsEvents = getAnalyticsEventNames(fetchMock);

    channels.forEach(([, eventName]) => {
      expect(analyticsEvents).toContain(eventName);
    });

    expect(openMock).toHaveBeenCalledTimes(channels.length);
  });

  it("fires the copy link analytics event when the link is copied", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
    });

    const clipboardMock = {
      writeText: vi.fn().mockResolvedValue(undefined),
    };

    vi.stubGlobal("fetch", fetchMock);

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: clipboardMock,
    });

    render(<ShareThisPage />);

    fireEvent.click(screen.getByRole("button", { name: "Share this page" }));

    fireEvent.click(screen.getByRole("button", { name: "Copy Link" }));

    expect(clipboardMock.writeText).toHaveBeenCalledWith(window.location.href);

    await waitFor(() => {
      expect(getAnalyticsEventNames(fetchMock)).toContain(
        "share.this.page.copy.link.clicked",
      );
    });
  });

  it("closes the share dialog with the close button", () => {
    render(<ShareThisPage />);

    fireEvent.click(screen.getByRole("button", { name: "Share this page" }));

    expect(screen.getByRole("dialog")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Close share dialog" }));

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("closes the share dialog when Escape is pressed", () => {
    render(<ShareThisPage />);

    fireEvent.click(screen.getByRole("button", { name: "Share this page" }));

    expect(screen.getByRole("dialog")).toBeTruthy();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
