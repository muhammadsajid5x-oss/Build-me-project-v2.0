import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type DropdownAlign = "start" | "center" | "end";

export interface DropdownProps {
  readonly trigger: ReactNode;
  readonly children: ReactNode;
  readonly open?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly align?: DropdownAlign;
  readonly closeOnBackdrop?: boolean;
  readonly closeOnEscape?: boolean;
  readonly className?: string;
  readonly menuClassName?: string;
  readonly "aria-label"?: string;
}

export function Dropdown({
  trigger,
  children,
  open: controlledOpen,
  onOpenChange,
  align = "end",
  closeOnBackdrop = true,
  closeOnEscape = true,
  className = "",
  menuClassName = "",
  "aria-label": ariaLabel,
}: DropdownProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const setOpen = (nextOpen: boolean) => {
    if (isControlled) {
      onOpenChange?.(nextOpen);
    } else {
      setInternalOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  const toggle = () => setOpen(!open);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        triggerRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        if (closeOnBackdrop) {
          setOpen(false);
        }
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && closeOnEscape) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, closeOnBackdrop, closeOnEscape]);

  const alignClasses: Record<DropdownAlign, string> = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  };

  return (
    <div className={`relative ${className}`.trim()}>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        aria-label={ariaLabel ?? "Toggle dropdown"}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {trigger}
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-orientation="vertical"
          className={`absolute z-50 mt-2 w-56 origin-top-right rounded-lg border border-gray-700 bg-gray-800 shadow-xl ${alignClasses[align]} ${menuClassName}`.trim()}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export interface DropdownSectionProps {
  readonly children?: ReactNode;
  readonly className?: string;
}

export function DropdownHeader({ children, className = "" }: DropdownSectionProps) {
  return (
    <div className={`border-b border-gray-700 px-4 py-3 ${className}`.trim()}>
      {children}
    </div>
  );
}

export function DropdownBody({ children, className = "" }: DropdownSectionProps) {
  return <div className={`py-1 ${className}`.trim()}>{children}</div>;
}

export function DropdownFooter({ children, className = "" }: DropdownSectionProps) {
  return (
    <div className={`border-t border-gray-700 px-4 py-2 ${className}`.trim()}>
      {children}
    </div>
  );
}

export function DropdownItem({
  children,
  onClick,
  className = "",
  disabled = false,
  ...props
}: {
  readonly children?: ReactNode;
  readonly onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  readonly className?: string;
  readonly disabled?: boolean;
  readonly role?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className={`block w-full px-4 py-2 text-left text-sm text-gray-300 transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50 ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}