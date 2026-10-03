import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import FoundationCheckinCard from "../../src/components/FoundationCheckinCard";

// jsdom does not implement the dialog methods the shared Modal calls.
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute("open");
  };
});

function submitCheckin(name: string) {
  render(<FoundationCheckinCard />);
  fireEvent.click(screen.getByRole("button", { name: "Record check-in" }));
  fireEvent.change(screen.getByLabelText("Name"), { target: { value: name } });
  fireEvent.click(screen.getByRole("button", { name: "Submit" }));
}

describe("FoundationCheckinCard", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("shows a confirmation after a successful check-in", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: { id: "abc", name: "Ada", createdAt: "2026-10-03T10:00:00Z" },
        }),
      }),
    );

    submitCheckin("Ada");

    expect(
      await screen.findByText(/Check-in recorded \(ID abc\)/),
    ).toBeTruthy();
  });

  it("shows a safe error when the API rejects the request", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          error: { details: [{ field: "name", message: "Name is required." }] },
        }),
      }),
    );

    submitCheckin("x");

    expect((await screen.findByRole("alert")).textContent).toBe(
      "Name is required.",
    );
  });
});
