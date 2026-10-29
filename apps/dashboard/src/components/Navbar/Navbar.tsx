import { useState } from "react";
import { Link } from "react-router-dom";
import { SearchBar } from "./SearchBar";
import { NotificationBell } from "./NotificationBell";
import { ProfileMenu } from "../ProfileMenu";

export interface NavbarProps {
  readonly onSearch?: (query: string) => void;
  readonly searchValue?: string;
  readonly notificationEndpoint?: string;
  readonly notificationPollInterval?: number;
}

export function Navbar({
  onSearch,
  searchValue = "",
  notificationEndpoint = "api/v1/notifications",
  notificationPollInterval = 30000,
}: NavbarProps) {
  const [internalSearch, setInternalSearch] = useState(searchValue);

  const handleSearch = (query: string) => {
    setInternalSearch(query);
    onSearch?.(query);
  };

  return (
    <header className="relative z-0 bg-gray-900 border-b border-gray-800">
      <nav
        aria-label="Primary navigation"
        className="mx-auto flex min-h-16 w-full max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8"
      >
        <Link
          to="/"
          aria-label="Go to dashboard home"
          className="inline-flex items-center gap-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
        >
          <img
            src="/Logo.png"
            alt="Cup&Commit"
            className="h-8 w-auto"
            width={32}
            height={32}
          />
          <span className="text-lg font-bold tracking-tight text-white">
            Cup&Commit
          </span>
        </Link>

        <div className="hidden flex-1 items-center justify-center sm:flex">
          <div className="w-full max-w-md">
            <SearchBar
              value={internalSearch}
              onChange={handleSearch}
              placeholder="Search dashboard..."
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="sm:hidden">
            <SearchBar
              value={internalSearch}
              onChange={handleSearch}
              placeholder="Search..."
              className="w-40"
            />
          </div>

          <NotificationBell
            endpoint={notificationEndpoint}
            pollInterval={notificationPollInterval}
          />

          <ProfileMenu />
        </div>
      </nav>
    </header>
  );
}