import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { trackAnalyticsEvent } from "../analytics";
import Footer from "../components/Footer/Footer";
import GiveFeedback from "../components/GiveFeedback/GiveFeedback";
import Navbar from "../components/Navbar/Navbar";
import { FEATURE_FLAGS } from "../config/featureFlags";

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
    <div className="min-h-screen overflow-x-hidden bg-white">
      <Navbar />

      <main className="block w-full p-0">
        <Outlet />
      </main>

      {FEATURE_FLAGS.showFooter && <Footer />}

      {FEATURE_FLAGS.showGiveFeedback && <GiveFeedback />}
    </div>
  );
}
