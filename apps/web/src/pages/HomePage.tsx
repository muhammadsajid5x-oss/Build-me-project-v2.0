import { useState } from "react";
import { Link } from "react-router-dom";

import { ANALYTICS_EVENTS, trackAnalyticsEvent } from "../analytics";
import TechnologyOwnershipHero from "../components/Hero/hero-left";
import HeroRight from "../components/Hero/hero-right";

/**
 * Home page with a single primary "Work With Me" call to action.
 *
 * Clicking the button:
 * 1. Tracks the Work With Me click.
 * 2. Opens the existing Work With Me path selection.
 * 3. Lets the visitor choose Deliver My Project.
 */
export default function HomePage() {
  const [isImpactCardOpen, setIsImpactCardOpen] = useState(false);

  const handleWorkWithMeClick = () => {
    trackAnalyticsEvent({
      name: ANALYTICS_EVENTS.WORK_WITH_ME_CLICKED,
      eventType: "click",
    });

    setIsImpactCardOpen(true);
  };

  const closeImpactCard = () => {
    setIsImpactCardOpen(false);
  };

  return (
    <div className="relative w-full overflow-visible">
      <section
        aria-labelledby="technology-ownership-heading"
        className="
          relative
          mx-auto
          grid
          w-full
          max-w-7xl
          grid-cols-1
          items-start
          gap-0
          px-4
          pt-8
          sm:px-6
          lg:grid-cols-2
          lg:px-4
        "
      >
        <div>
          <TechnologyOwnershipHero />

          <div className="mt-4">
            <button
              type="button"
              onClick={handleWorkWithMeClick}
              className="
                inline-flex
                items-center
                justify-center
                rounded-lg
                bg-blue-600
                px-6
                py-3
                text-base
                font-semibold
                text-white
                transition
                hover:bg-blue-700
                focus:outline-none
                focus:ring-2
                focus:ring-blue-600
                focus:ring-offset-2
              "
            >
              Work With Me
            </button>
          </div>
        </div>

        <HeroRight />
      </section>

      {isImpactCardOpen && (
        <dialog
          open
          aria-labelledby="impact-card-heading"
          className="
            fixed
            inset-0
            z-50
            m-auto
            w-full
            max-w-lg
            rounded-2xl
            bg-white
            p-6
            shadow-xl
            sm:p-8
          "
        >
          <div className="flex items-start justify-between">
            <h2
              id="impact-card-heading"
              className="text-xl font-bold tracking-tight text-gray-900"
            >
              How would you like to work together?
            </h2>

            <button
              type="button"
              onClick={closeImpactCard}
              className="
                ml-3
                inline-flex
                h-8
                w-8
                items-center
                justify-center
                rounded-full
                text-white
                transition
                hover:bg-blue-950
                hover:text-white
                focus:outline-none
                focus:ring-2
                focus:ring-gray-900
                focus:ring-offset-2
              "
              aria-label="Close impact card"
            >
              <span className="text-lg leading-none" aria-hidden="true">
                ×
              </span>
            </button>
          </div>

          <p className="mt-3 text-sm text-gray-600">
            Choose the path that best fits your needs.
          </p>

          <div className="mt-6 space-y-3">
            <Link
              to="/deliver-my-project"
              onClick={() => {
                trackAnalyticsEvent({
                  name: ANALYTICS_EVENTS.DELIVER_MY_PROJECT_CLICKED,
                  eventType: "click",
                });
              }}
              className="
                flex
                items-center
                justify-between
                rounded-xl
                border
                border-gray-200
                px-4
                py-4
                text-left
                transition
                hover:border-gray-300
                hover:bg-gray-50
              "
            >
              <span>
                <span className="block text-base font-semibold text-gray-900">
                  Deliver My Project
                </span>

                <span className="mt-1 block text-sm text-gray-500">
                  Tell me about your project and I will review it.
                </span>
              </span>

              <span className="ml-4 text-gray-400" aria-hidden="true">
                →
              </span>
            </Link>
          </div>
        </dialog>
      )}
    </div>
  );
}
