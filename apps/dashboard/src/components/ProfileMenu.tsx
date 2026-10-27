import { useEffect, useRef, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { signOut } from "@build-me/services/integrations";

export function ProfileMenu() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const email = user?.email ?? "Admin";
  const initials = email
    .split("@")[0]
    .split(".")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700"
        aria-label="Profile menu"
        aria-expanded={open}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold">
          {initials}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg border border-gray-700 bg-gray-800 shadow-xl">
          <div className="border-b border-gray-700 px-4 py-3">
            <p className="text-sm font-semibold text-white truncate">
              {email}
            </p>
            <p className="text-xs text-gray-400">Administrator</p>
          </div>
          <button
            type="button"
            onClick={() => {
              void signOut();
              setOpen(false);
            }}
            className="block w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-gray-700"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}