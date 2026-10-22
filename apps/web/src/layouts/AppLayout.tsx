import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { trackAnalyticsEvent } from "../analytics";
import Navbar from "../components/Navbar/Navbar";

export default function AppLayout() {
  const location = useLocation();
  const lastTrackedLocationKey = useRef<string | null>(null);

  useEffect(() => {
    if (lastTrackedLocationKey.current === location.key) {
      return;
    }

    lastTrackedLocationKey.current = location.key;
    trackAnalyticsEvent({
      name: "page.viewed",
      eventType: "view",
      path: location.pathname,
    });
  }, [location.key, location.pathname]);

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar />

      <main className="p-0">
        <Outlet />
      </main>
    </div>
  );
}
