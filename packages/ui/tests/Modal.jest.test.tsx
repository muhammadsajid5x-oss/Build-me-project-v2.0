import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { Modal, ModalFooter } from "../src/components/Modal";

const showModalDescriptor = Object.getOwnPropertyDescriptor(
  HTMLDialogElement.prototype,
  "showModal",
);
const closeDescriptor = Object.getOwnPropertyDescriptor(
  HTMLDialogElement.prototype,
  "close",
);
let previouslyFocusedElement: HTMLElement | null = null;

beforeAll(() => {
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
    configurable: true,
    value: function showModal(this: HTMLDialogElement) {
      previouslyFocusedElement =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      this.setAttribute("open", "");
      const initialFocus = this.querySelector<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      (initialFocus ?? this).focus();
    },
  });
  Object.defineProperty(HTMLDialogElement.prototype, "close", {
    configurable: true,
    value: function close(this: HTMLDialogElement) {
      this.removeAttribute("open");
      previouslyFocusedElement?.focus();
      previouslyFocusedElement = null;
    },
  });
});

afterAll(() => {
  if (showModalDescriptor) {
    Object.defineProperty(
      HTMLDialogElement.prototype,
      "showModal",
      showModalDescriptor,
    );
  } else {
    Reflect.deleteProperty(HTMLDialogElement.prototype, "showModal");
  }

  if (closeDescriptor) {
    Object.defineProperty(
      HTMLDialogElement.prototype,
      "close",
      closeDescriptor,
    );
  } else {
    Reflect.deleteProperty(HTMLDialogElement.prototype, "close");
  }
});

function ControlledModal({
  onCancel = () => undefined,
  onConfirm = () => undefined,
}: {
  onCancel?: () => void;
  onConfirm?: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open modal
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        aria-label="Dialog title"
      >
        <h2>Dialog title</h2>
        <ModalFooter>
          <button
            type="button"
            onClick={() => {
              onCancel();
              setOpen(false);
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              setOpen(false);
            }}
          >
            Confirm
          </button>
        </ModalFooter>
      </Modal>
    </>
  );
}

describe("Modal behavior", () => {
  it("opens from its controlled open action and closes with the close button", () => {
    render(<ControlledModal />);

    const opener = screen.getByRole("button", { name: "Open modal" });
    opener.focus();
    fireEvent.click(opener);
    const dialog = screen.getByRole("dialog", { name: "Dialog title" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByRole("heading", { name: "Dialog title" })).toBeVisible();
    expect(dialog).toContainElement(document.activeElement);

    fireEvent.click(screen.getByRole("button", { name: "Close modal" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it("provides an accessible fallback name when no label is supplied", () => {
    render(
      <Modal open onClose={() => undefined}>
        Content
      </Modal>,
    );

    expect(screen.getByRole("dialog", { name: "Dialog" })).toBeInTheDocument();
  });

  it("routes Escape cancellation through onClose", () => {
    render(<ControlledModal />);
    fireEvent.click(screen.getByRole("button", { name: "Open modal" }));

    fireEvent(
      screen.getByRole("dialog"),
      new Event("cancel", { cancelable: true }),
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes on backdrop activation", () => {
    const onClose = jest.fn();
    render(
      <Modal open onClose={onClose} aria-label="Backdrop test dialog">
        Content
      </Modal>,
    );

    fireEvent.click(
      screen.getByRole("dialog", { name: "Backdrop test dialog" }),
    );

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("supports composed Cancel and Confirm actions", () => {
    const onCancel = jest.fn();
    const onConfirm = jest.fn();

    render(<ControlledModal onCancel={onCancel} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByRole("button", { name: "Open modal" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Open modal" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it.each(["loading", "error", "success"] as const)(
    "renders the %s state",
    (state) => {
      render(
        <Modal open onClose={() => undefined} state={state}>
          State content
        </Modal>,
      );

      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveClass(`ui-modal--${state}`);
      expect(dialog).toHaveTextContent("State content");

      if (state === "loading") {
        expect(dialog).toHaveAttribute("aria-busy", "true");
      }
    },
  );
});
