import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard", icon: "grid" },
  { to: "/analytics", label: "Analytics", icon: "chart" },
  { to: "/requests", label: "Requests", icon: "inbox" },
  { to: "/bookings", label: "Bookings", icon: "calendar" },
  { to: "/invoices", label: "Invoices", icon: "invoice" },
  { to: "/settings", label: "Settings", icon: "gear" },
] as const;

function NavIcon({ name }: { name: string }) {
  switch (name) {
    case "grid":
      return (
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M3 3h6v6H3V3zm8 0h6v6h-6V3zM3 11h6v6H3v-6zm8 0h6v6h-6v-6z" />
        </svg>
      );

    case "chart":
      return (
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M3 17V7h3v10H3zm5.5 0V3h3v14h-3zM14 17v-7h3v7h-3z" />
        </svg>
      );

    case "inbox":
      return (
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M3 4h14v12H3V4zm2 2v8h10V6H5z" />
          <path d="M5 7h10l-5 4-5-4z" />
        </svg>
      );

    case "calendar":
      return (
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M5 2h2v2h6V2h2v2h2v14H3V4h2V2zm0 6v8h10V8H5z" />
        </svg>
      );

    case "invoice":
      return (
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M5 2h10v16l-2-1-2 1-2-1-2 1-2-1-2 1V2h2zm2 4v2h6V6H7zm0 4v2h6v-2H7zm0 4v2h4v-2H7z" />
        </svg>
      );

    case "gear":
      return (
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M10 2l1.5 3h3l1.5 2-2 2.5 2 2.5-1.5 2h-3L10 17l-1.5-3h-3L4 12l2-2.5L4 7l1.5-2h3L10 2z" />
        </svg>
      );

    default:
      return null;
  }
}

export default function Sidebar() {
  return (
    <aside className="flex h-screen w-64 flex-col bg-gray-900 text-gray-300">
      <nav
        className="flex-1 overflow-y-auto px-3 py-4"
        aria-label="Dashboard navigation"
      >
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-gray-800 text-white"
                      : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
                  }`
                }
              >
                <NavIcon name={item.icon} />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-gray-800 p-4">
        <p className="text-xs text-gray-500">Build Me Admin</p>
        <p className="text-xs text-gray-600">v0.1.0</p>
      </div>
    </aside>
  );
}
