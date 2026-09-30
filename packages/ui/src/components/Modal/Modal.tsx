import { useEffect, useRef, type ReactNode, type SyntheticEvent } from "react";

import "./Modal.css";

export type ModalSize = "sm" | "md" | "lg" | "xl";
export type ModalState = "default" | "loading" | "error" | "success";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: ModalSize;
  state?: ModalState;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
  "aria-label"?: string;
}

export interface ModalSectionProps {
  children?: ReactNode;
  className?: string;
}

export interface ModalActionsProps extends ModalSectionProps {
  align?: "start" | "center" | "end" | "between";
}

export function Modal(props: Readonly<ModalProps>) {
  const {
    open,
    onClose,
    children,
    size = "md",
    state = "default",
    closeOnBackdrop = true,
    closeOnEscape = true,
    showCloseButton = true,
    className = "",
    "aria-label": ariaLabel,
  } = props;

  const modalRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = modalRef.current;

    if (!open || !dialog) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleBackdropClick = (event: Event) => {
      if (closeOnBackdrop && event.target === dialog) {
        onClose();
      }
    };

    dialog.addEventListener("click", handleBackdropClick);

    if (!dialog.open) {
      dialog.showModal();
    }

    return () => {
      dialog.removeEventListener("click", handleBackdropClick);

      if (dialog.open) {
        dialog.close();
      }

      document.body.style.overflow = originalOverflow;
    };
  }, [open, closeOnBackdrop, onClose]);

  if (!open) {
    return null;
  }

  const classes = [
    "ui-modal",
    `ui-modal--${size}`,
    `ui-modal--${state}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const handleCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();

    if (closeOnEscape) {
      onClose();
    }
  };

  return (
    <dialog
      ref={modalRef}
      className={classes}
      onCancel={handleCancel}
      aria-modal={true}
      aria-busy={state === "loading" || undefined}
      aria-label={ariaLabel ?? "Dialog"}
      tabIndex={-1}
    >
      {showCloseButton && (
        <button
          type="button"
          className="ui-modal__close"
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>
      )}
      <div className="ui-modal__content">{children}</div>
    </dialog>
  );
}

export function ModalHeader(props: Readonly<ModalSectionProps>) {
  const { children, className = "" } = props;
  return (
    <header className={`ui-modal__header ${className}`.trim()}>
      {children}
    </header>
  );
}

export function ModalBody(props: Readonly<ModalSectionProps>) {
  const { children, className = "" } = props;
  return <div className={`ui-modal__body ${className}`.trim()}>{children}</div>;
}

export function ModalFooter(props: Readonly<ModalSectionProps>) {
  const { children, className = "" } = props;
  return (
    <footer className={`ui-modal__footer ${className}`.trim()}>
      {children}
    </footer>
  );
}

export function ModalActions(props: Readonly<ModalActionsProps>) {
  const { children, align = "end", className = "" } = props;
  return (
    <div
      className={`ui-modal__actions ui-modal__actions--${align} ${className}`.trim()}
    >
      {children}
    </div>
  );
}

export function ModalStep(
  props: Readonly<ModalSectionProps & { active?: boolean }>,
) {
  const { children, active = true, className = "" } = props;
  if (!active) {
    return null;
  }
  return <div className={`ui-modal__step ${className}`.trim()}>{children}</div>;
}
