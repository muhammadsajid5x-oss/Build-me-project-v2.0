import { Link, useNavigate } from "react-router-dom";

import { ANALYTICS_EVENTS, trackAnalyticsEvent } from "../../analytics";

export default function AboutMe() {
  const navigate = useNavigate();

  const handleAboutClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    trackAnalyticsEvent({
      name: ANALYTICS_EVENTS.ABOUT_CTA_CLICKED,
      eventType: "click",
      path: window.location.pathname,
    });

    navigate("/about");
  };

  return (
    <div className="flex items-center gap-3 px-6 border-l-2 border-r-2 border-gray-200">
      {/* Clickable Area: Icon */}
      <Link
        to="/about"
        onClick={handleAboutClick}
        className="flex items-center justify-center w-7 h-7 rounded-full bg-[#0052FF] text-white shrink-0 font-serif font-bold italic text-sm shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:ring-offset-2"
        aria-label="About Us"
      >
        i
      </Link>

      {/* Vertical Stack: Heading (Clickable) above Subtitle (Non-clickable) */}
      <div className="flex flex-col">
        <Link
          to="/about"
          onClick={handleAboutClick}
          className="text-base font-bold text-[#0052FF] hover:underline focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:ring-offset-2 rounded-sm"
        >
          About Us
        </Link>

        {/* Non-clickable Subtitle */}
        <span className="text-xs text-gray-900 font-medium">
          Who we are and what we do.
        </span>
      </div>
    </div>
  );
}
