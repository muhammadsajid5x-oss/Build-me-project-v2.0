import { Link } from "react-router-dom";
import { trackAnalyticsEvent } from "../../analytics";

export default function Navbar() {
  const trackHomeNavigation = () => {
    trackAnalyticsEvent({
      name: "navbar.home.clicked",
      eventType: "click",
    });
  };

  return (
    <header className="sticky top-0 z-50 bg-white">
      <nav
        aria-label="Primary navigation"
        className="mx-auto flex min-h-16 w-full max-w-7xl items-center px-4 sm:px-6 lg:px-8"
      >
        <Link
          to="/"
          aria-label="Go to Home"
          className="inline-flex items-center gap-3 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
          onClick={trackHomeNavigation}
        >
          <img
            src="/Logo.png"
            alt="Cup&Commit"
            className="h-10 w-auto max-w-50 object-contain sm:h-16"
          />
          <span className="text-xxl font-bold tracking-tight text-gray-900 sm:text-2xl">
            Cup&Commit
          </span>
        </Link>
      </nav>
    </header>
  );
}
