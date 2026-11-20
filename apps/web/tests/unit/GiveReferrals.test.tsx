// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import GiveReferrals from "../../src/components/Footer/GiveReferrals";

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

describe("GiveReferrals", () => {
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

  it("renders the Give Referrals heading and button", () => {
    render(<GiveReferrals />);

    expect(
      screen.getByRole("heading", { name: "Give Referrals" }),
    ).toBeTruthy();

    expect(screen.getByRole("button", { name: "Give Referrals" })).toBeTruthy();
  });

  it("fires give.referrals.viewed when rendered", () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<GiveReferrals />);

    expect(getAnalyticsEventNames(fetchMock)).toContain(
      "give.referrals.viewed",
    );
  });

  it("opens the referral dialog and fires give.referrals.clicked", () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<GiveReferrals />);

    fireEvent.click(screen.getByRole("button", { name: "Give Referrals" }));

    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "Give Referrals" }),
    ).toBeTruthy();
    expect(screen.getByText("Your Information")).toBeTruthy();

    expect(getAnalyticsEventNames(fetchMock)).toContain(
      "give.referrals.clicked",
    );
  });

  it("validates step one before continuing", () => {
    render(<GiveReferrals />);

    fireEvent.click(screen.getByRole("button", { name: "Give Referrals" }));

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Please enter your name.",
    );

    fireEvent.change(screen.getByPlaceholderText("Your name"), {
      target: { value: "Muhammad Sajid" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Please enter a valid email address.",
    );
  });

  it("completes step one and opens step two", () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<GiveReferrals />);

    fireEvent.click(screen.getByRole("button", { name: "Give Referrals" }));

    fireEvent.change(screen.getByPlaceholderText("Your name"), {
      target: { value: "Muhammad Sajid" },
    });

    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "sajid@example.com" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(screen.getByText("Friend, Family, or Colleague")).toBeTruthy();

    expect(getAnalyticsEventNames(fetchMock)).toContain(
      "give.referrals.step.one.completed",
    );
  });

  it("validates step two before continuing", () => {
    render(<GiveReferrals />);

    fireEvent.click(screen.getByRole("button", { name: "Give Referrals" }));

    fireEvent.change(screen.getByPlaceholderText("Your name"), {
      target: { value: "Muhammad Sajid" },
    });

    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "sajid@example.com" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Please enter your friend's, family member's, or colleague's name.",
    );
  });

  it("completes step two and opens confirmation", () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<GiveReferrals />);

    fireEvent.click(screen.getByRole("button", { name: "Give Referrals" }));

    fireEvent.change(screen.getByPlaceholderText("Your name"), {
      target: { value: "Muhammad Sajid" },
    });

    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "sajid@example.com" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    fireEvent.change(screen.getByPlaceholderText("Their name"), {
      target: { value: "Ali Khan" },
    });

    fireEvent.change(screen.getByPlaceholderText("their@example.com"), {
      target: { value: "ali@example.com" },
    });

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "friend" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(screen.getByText("Confirmation")).toBeTruthy();

    expect(getAnalyticsEventNames(fetchMock)).toContain(
      "give.referrals.step.two.completed",
    );
  });

  it("validates the referral reason before submission", () => {
    render(<GiveReferrals />);

    fireEvent.click(screen.getByRole("button", { name: "Give Referrals" }));

    fireEvent.change(screen.getByPlaceholderText("Your name"), {
      target: { value: "Muhammad Sajid" },
    });

    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "sajid@example.com" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    fireEvent.change(screen.getByPlaceholderText("Their name"), {
      target: { value: "Ali Khan" },
    });

    fireEvent.change(screen.getByPlaceholderText("their@example.com"), {
      target: { value: "ali@example.com" },
    });

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "friend" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    fireEvent.click(screen.getByRole("button", { name: "Submit Referral" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Please tell us why you are making this referral.",
    );
  });

  it("submits the referral and shows confirmation", () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<GiveReferrals />);

    fireEvent.click(screen.getByRole("button", { name: "Give Referrals" }));

    fireEvent.change(screen.getByPlaceholderText("Your name"), {
      target: { value: "Muhammad Sajid" },
    });

    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "sajid@example.com" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    fireEvent.change(screen.getByPlaceholderText("Their name"), {
      target: { value: "Ali Khan" },
    });

    fireEvent.change(screen.getByPlaceholderText("their@example.com"), {
      target: { value: "ali@example.com" },
    });

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "friend" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    fireEvent.change(
      screen.getByPlaceholderText("Tell us how we can help..."),
      {
        target: {
          value: "I believe this person would benefit from your services.",
        },
      },
    );

    fireEvent.click(screen.getByRole("button", { name: "Submit Referral" }));

    expect(screen.getByText("Referral Submitted")).toBeTruthy();

    expect(
      screen.getByText(
        "Thank you for the referral. Your referral details have been submitted successfully.",
      ),
    ).toBeTruthy();

    expect(getAnalyticsEventNames(fetchMock)).toContain(
      "give.referrals.completed",
    );
  });

  it("supports going back between steps", () => {
    render(<GiveReferrals />);

    fireEvent.click(screen.getByRole("button", { name: "Give Referrals" }));

    fireEvent.change(screen.getByPlaceholderText("Your name"), {
      target: { value: "Muhammad Sajid" },
    });

    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "sajid@example.com" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(screen.getByText("Friend, Family, or Colleague")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Back" }));

    expect(screen.getByText("Your Information")).toBeTruthy();
  });

  it("closes the referral dialog with the close button", () => {
    render(<GiveReferrals />);

    fireEvent.click(screen.getByRole("button", { name: "Give Referrals" }));

    expect(screen.getByRole("dialog")).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", { name: "Close referral dialog" }),
    );

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("closes the referral dialog when Escape is pressed", () => {
    render(<GiveReferrals />);

    fireEvent.click(screen.getByRole("button", { name: "Give Referrals" }));

    expect(screen.getByRole("dialog")).toBeTruthy();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
