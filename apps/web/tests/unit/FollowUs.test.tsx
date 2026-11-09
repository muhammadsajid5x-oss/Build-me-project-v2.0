// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import FollowUs from "../../src/components/Footer/FollowUs";

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

describe("FollowUs", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("renders the Follow Us heading and all social links", () => {
    render(<FollowUs />);

    expect(
      screen.getByRole("heading", { name: "Follow Us" }),
    ).toBeTruthy();

    const linkedIn = screen.getByRole("link", {
      name: "Connect with me on LinkedIn",
    });
    expect(linkedIn.getAttribute("href")).toBe(
      "https://www.linkedin.com/in/muhammad-sajid-softwaredeveloper/",
    );

    const facebook = screen.getByRole("link", {
      name: "Connect with me on Facebook",
    });
    expect(facebook.getAttribute("href")).toBe(
      "https://web.facebook.com/rao.sajid.1232",
    );

    const youtube = screen.getByRole("link", {
      name: "Visit my YouTube channel",
    });
    expect(youtube.getAttribute("href")).toBe(
      "https://www.youtube.com/channel/UCX80pgVBcXTgawdM3hAQzBg",
    );

    const whatsapp = screen.getByRole("link", {
      name: "Contact me on WhatsApp",
    });
    expect(whatsapp.getAttribute("href")).toBe(
      "https://wa.me/923009164602",
    );

    const telegram = screen.getByRole("link", {
      name: "Contact me on Telegram",
    });
    expect(telegram.getAttribute("href")).toBe(
      "https://t.me/+923009164602",
    );
  });

  it("opens all social links safely in a new tab", () => {
    render(<FollowUs />);

    const links = screen.getAllByRole("link");

    expect(links).toHaveLength(5);

    links.forEach((link) => {
      expect(link.getAttribute("target")).toBe("_blank");
      expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    });
  });

  it("fires follow.us.viewed when rendered", () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<FollowUs />);

    expect(getAnalyticsEventNames(fetchMock)).toContain("follow.us.viewed");
  });

  it("fires the correct analytics event when a social link is clicked", () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<FollowUs />);

    fireEvent.click(
      screen.getByRole("link", {
        name: "Connect with me on LinkedIn",
      }),
    );

    fireEvent.click(
      screen.getByRole("link", {
        name: "Connect with me on Facebook",
      }),
    );

    fireEvent.click(
      screen.getByRole("link", {
        name: "Visit my YouTube channel",
      }),
    );

    fireEvent.click(
      screen.getByRole("link", {
        name: "Contact me on WhatsApp",
      }),
    );

    fireEvent.click(
      screen.getByRole("link", {
        name: "Contact me on Telegram",
      }),
    );

    const analyticsEvents = getAnalyticsEventNames(fetchMock);

    expect(analyticsEvents).toContain("follow.us.linkedin.clicked");
    expect(analyticsEvents).toContain("follow.us.facebook.clicked");
    expect(analyticsEvents).toContain("follow.us.youtube.clicked");
    expect(analyticsEvents).toContain("follow.us.whatsapp.clicked");
    expect(analyticsEvents).toContain("follow.us.telegram.clicked");
  });
});