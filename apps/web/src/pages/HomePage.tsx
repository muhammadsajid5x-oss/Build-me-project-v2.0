import { useState } from "react";
import { Link } from "react-router-dom";

import { ANALYTICS_EVENTS, trackAnalyticsEvent } from "../analytics";
import TechnologyOwnershipHero from "../components/Hero/hero-left";
import HeroRight from "../components/Hero/hero-right";
import { Modal, ModalHeader, ModalBody } from "@build-me/ui";
import TechnologyOwnershipAudit from "../components/TechnologyOwnershipAudit";

/**
 * Home page with a single primary "Work With Me" call to action.
 *
 * Clicking the button:
 * 1. Tracks the Work With Me click.
 * 2. Opens the existing Work With Me path selection.
 * 3. Lets the visitor choose an existing journey or open the Ownership Audit.
 */
export default function HomePage() {
  const [isImpactCardOpen, setIsImpactCardOpen] = useState(false);
  const [isOwnershipAuditOpen, setIsOwnershipAuditOpen] = useState(false);

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

  const handleOwnershipAuditClick = () => {
    trackAnalyticsEvent({
      name: ANALYTICS_EVENTS.OWNERSHIP_AUDIT_CLICKED,
      eventType: "click",
      path: "/",
    });

    setIsImpactCardOpen(false);
    setIsOwnershipAuditOpen(true);
  };

  const closeOwnershipAudit = () => {
    setIsOwnershipAuditOpen(false);
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
          lg:overflow-visible
        "
      >
        {/* Hero Left — desktop only: extends into Hero Right area */}
        <div
          className="
            relative
            z-20
            min-w-0
            lg:w-[calc(100%+120px)]
            lg:max-w-none
          "
        >
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

        {/* Hero Right — remains in its existing grid position */}
        <div className="relative z-10 min-w-0">
          <HeroRight />
        </div>
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
              to="/mentor-me"
              onClick={() => {
                trackAnalyticsEvent({
                  name: ANALYTICS_EVENTS.MENTOR_ME_CLICKED,
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
                  Mentor Me
                </span>

                <span className="mt-1 block text-sm text-gray-500">
                  Request mentoring support and guidance.
                </span>
              </span>

              <span className="ml-4 text-gray-400" aria-hidden="true">
                →
              </span>
            </Link>

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

            <button
              type="button"
              onClick={handleOwnershipAuditClick}
              className="
                flex
                w-full
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
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
                focus:ring-offset-2
              "
            >
              <span>
                <span className="block text-base font-semibold text-gray-900">
                  Ownership Audit
                </span>

                <span className="mt-1 block text-sm text-gray-500">
                  Audit your technology ownership and maturity.
                </span>
              </span>

              <span className="ml-4 text-gray-400" aria-hidden="true">
                →
              </span>
            </button>

            <Link
              to="/coffee-with-me"
              onClick={() => {
                trackAnalyticsEvent({
                  name: ANALYTICS_EVENTS.COFFEE_WITH_ME_CLICKED,
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
                  Coffee With Me
                </span>

                <span className="mt-1 block text-sm text-gray-500">
                  Grab a virtual coffee and chat about what is next for you.
                </span>
              </span>

              <span className="ml-4 text-gray-400" aria-hidden="true">
                →
              </span>
            </Link>
          </div>
        </dialog>
      )}

      {isOwnershipAuditOpen && (
        <Modal open={isOwnershipAuditOpen} onClose={closeOwnershipAudit}>
          <ModalHeader>
            <h2 className="text-xl font-bold tracking-tight text-gray-900">
              Ownership Audit
            </h2>
          </ModalHeader>

          <ModalBody>
            <TechnologyOwnershipAudit />
          </ModalBody>
        </Modal>
      )}
    </div>
  );
}
