import { useState } from "react";
import { Link } from "react-router-dom";
import { FEATURE_FLAGS } from "../config/featureFlags";
import { ANALYTICS_EVENTS, trackAnalyticsEvent } from "../analytics";
import HeroTop from "../components/Hero/HeroTop";
import TechnologyOwnershipHero from "../components/Hero/HeroLeft";
import HeroBottom from "../components/Hero/HeroBottom";
import HeroRight from "../components/Hero/hero-right";
import Testimonials from "../components/Testimonials";
import TechnologyOwnershipAudit from "../components/TechnologyOwnershipAudit";
import TechnologyOwnershipToolkit from "../components/TechnologyOwnershipToolkit";
import OwnershipLearningCircle from "../components/OwnershipLearningCircle";

export default function HomePage() {
  const [isImpactCardOpen, setIsImpactCardOpen] = useState(false);
  const [isQuickWinsCardOpen, setIsQuickWinsCardOpen] = useState(false);
  const [isOwnershipAuditOpen, setIsOwnershipAuditOpen] = useState(false);
  const [isOwnershipToolkitOpen, setIsOwnershipToolkitOpen] = useState(false);
  const [isOwnershipLearningCircleOpen, setIsOwnershipLearningCircleOpen] =
    useState(false);

  const handleWorkWithMeClick = () => {
    trackAnalyticsEvent({
      name: ANALYTICS_EVENTS.WORK_WITH_ME_CLICKED,
      eventType: "click",
    });

    setIsImpactCardOpen(true);
  };

  const handleGetQuickWinsClick = () => {
    setIsQuickWinsCardOpen(true);
  };

  const closeImpactCard = () => {
    setIsImpactCardOpen(false);
  };

  const closeQuickWinsCard = () => {
    setIsQuickWinsCardOpen(false);
  };

  const handleOwnershipAuditClick = () => {
    trackAnalyticsEvent({
      name: ANALYTICS_EVENTS.OWNERSHIP_AUDIT_CLICKED,
      eventType: "click",
      path: "/",
    });

    setIsQuickWinsCardOpen(false);
    setIsOwnershipAuditOpen(true);
  };

  const closeOwnershipAudit = () => {
    setIsOwnershipAuditOpen(false);
  };

  const handleOwnershipToolkitClick = () => {
    trackAnalyticsEvent({
      name: ANALYTICS_EVENTS.OWNERSHIP_TOOLKIT_CLICKED,
      eventType: "click",
      path: "/",
    });

    setIsQuickWinsCardOpen(false);
    setIsOwnershipToolkitOpen(true);
  };

  const closeOwnershipToolkit = () => {
    setIsOwnershipToolkitOpen(false);
  };

  const handleOwnershipLearningCircleClick = () => {
    trackAnalyticsEvent({
      name: ANALYTICS_EVENTS.OWNERSHIP_LEARNING_CIRCLE_CLICKED,
      eventType: "click",
      path: "/",
    });

    setIsQuickWinsCardOpen(false);
    setIsOwnershipLearningCircleOpen(true);

    trackAnalyticsEvent({
      name: ANALYTICS_EVENTS.CIRCLE_VIEW,
      eventType: "view",
      path: "/",
    });
  };

  const closeOwnershipLearningCircle = () => {
    setIsOwnershipLearningCircleOpen(false);
  };

  return (
    <div className="relative w-full overflow-visible">
      <section
        aria-labelledby="technology-ownership-heading"
        className="
          relative mx-auto grid w-full max-w-7xl grid-cols-1
          items-start gap-0 px-4 pt-8 pb-0 sm:px-6
          lg:grid-cols-2 lg:px-4 lg:overflow-visible
        "
      >
        <div className="col-span-full">
          <HeroTop />
        </div>

        <div
          className="
            relative z-20 min-w-0
            lg:w-[calc(100%+120px)] lg:max-w-none
          "
        >
          <TechnologyOwnershipHero />
        </div>

        <div
          className="
            relative z-10 min-w-0
            translate-y-28
            sm:translate-y-23
            lg:translate-y-0
          "
        >
          <HeroRight />
        </div>

        <div
          className="
            relative z-40 col-span-center
            mt-20 -size-1 translate-x-4
            sm:mt-16 sm:translate-x-40
            lg:translate-x-80 lg:-mt-32
          "
        >
          <HeroBottom />
        </div>

        <div
          className="
            relative z-40 col-span-full
            -mt-156
            flex flex-wrap items-center gap-3
            sm:-mt-146 sm:translate-x-5
            lg:-mt-55
          "
        >
          <button
            type="button"
            onClick={handleWorkWithMeClick}
            className="
              inline-flex items-center justify-center rounded-lg
              bg-blue-700 px-6 py-3 text-base font-semibold text-white
              transition hover:bg-black lg:-translate-x-6
              focus:outline-none focus:ring-2 focus:ring-blue-700
              focus:ring-offset-2 lg:-mt-44 -mt-35
            "
          >
            Work With Me
          </button>

          <button
            type="button"
            onClick={handleGetQuickWinsClick}
            className="
              inline-flex items-center justify-center rounded-lg
              border-2 border-blue-700 bg-white px-6 py-3
              text-base font-semibold text-blue-700
              transition hover:bg-blue-100 lg:-translate-x-6 lg:-mt-44
              focus:outline-none focus:ring-2 focus:ring-blue-700
              focus:ring-offset-2 -mt-35
            "
          >
            Get Quick Wins
          </button>
        </div>
      </section>

      {isImpactCardOpen && (
        <dialog
          open
          aria-labelledby="impact-card-heading"
          className="
            fixed inset-0 z-50 m-auto w-full max-w-lg
            rounded-2xl border-2 border-blue-700
            bg-white p-6 shadow-xl sm:p-8
          "
        >
          <div className="flex items-start justify-between">
            <h2
              id="impact-card-heading"
              className="text-xl font-bold tracking-tight text-blue-700"
            >
              How would you like to work together?
            </h2>

            <button
              type="button"
              onClick={closeImpactCard}
              aria-label="Close Work With Me card"
              className="
                ml-3 inline-flex h-8 w-8 items-center justify-center
                rounded-full text-blue-700 transition hover:bg-blue-100
                focus:outline-none focus:ring-2 focus:ring-blue-700
              "
            >
              <span aria-hidden="true" className="text-lg leading-none">
                ×
              </span>
            </button>
          </div>

          <p className="mt-3 text-sm text-black">
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
                flex items-center justify-between rounded-xl
                border-2 border-blue-700 bg-blue-100
                px-4 py-4 text-left transition
                hover:bg-white
                focus:outline-none focus:ring-2 focus:ring-blue-700
              "
            >
              <span>
                <span className="block text-base font-semibold text-blue-700">
                  Mentor Me
                </span>
                <span className="mt-1 block text-sm text-black">
                  Get practical guidance.
                </span>
              </span>

              <span className="ml-4 text-blue-700" aria-hidden="true">
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
                flex items-center justify-between rounded-xl
                border-2 border-blue-700 bg-blue-100
                px-4 py-4 text-left transition
                hover:bg-white
                focus:outline-none focus:ring-2 focus:ring-blue-700
              "
            >
              <span>
                <span className="block text-base font-semibold text-blue-700">
                  Deliver My Project
                </span>
                <span className="mt-1 block text-sm text-black">
                  Tell me what you need delivered.
                </span>
              </span>

              <span className="ml-4 text-blue-700" aria-hidden="true">
                →
              </span>
            </Link>

            <Link
              to="/coffee-with-me"
              onClick={() => {
                trackAnalyticsEvent({
                  name: ANALYTICS_EVENTS.COFFEE_WITH_ME_CLICKED,
                  eventType: "click",
                });
              }}
              className="
                flex items-center justify-between rounded-xl
                border-2 border-blue-700 bg-blue-100
                px-4 py-4 text-left transition
                hover:bg-white
                focus:outline-none focus:ring-2 focus:ring-blue-700
              "
            >
              <span>
                <span className="block text-base font-semibold text-blue-700">
                  Coffee With Me
                </span>
                <span className="mt-1 block text-sm text-black">
                  Talk through what comes next.
                </span>
              </span>

              <span className="ml-4 text-blue-700" aria-hidden="true">
                →
              </span>
            </Link>
          </div>
        </dialog>
      )}

      {isQuickWinsCardOpen && (
        <dialog
          open
          aria-labelledby="quick-wins-heading"
          className="
            fixed inset-0 z-50 m-auto w-full max-w-lg
            rounded-2xl border-2 border-blue-700
            bg-white p-6 shadow-xl sm:p-8
          "
        >
          <div className="flex items-start justify-between">
            <h2
              id="quick-wins-heading"
              className="text-xl font-bold tracking-tight text-blue-700"
            >
              Get Quick Wins
            </h2>

            <button
              type="button"
              onClick={closeQuickWinsCard}
              aria-label="Close Get Quick Wins card"
              className="
                ml-3 inline-flex h-8 w-8 items-center justify-center
                rounded-full text-blue-700 transition hover:bg-blue-100
                focus:outline-none focus:ring-2 focus:ring-blue-700
              "
            >
              <span aria-hidden="true" className="text-lg leading-none">
                ×
              </span>
            </button>
          </div>

          <p className="mt-3 text-sm text-black">
            Choose a practical way to improve your technology ownership.
          </p>

          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={handleOwnershipAuditClick}
              className="
                flex w-full items-center justify-between rounded-xl
                border-2 border-blue-700 bg-blue-100
                px-4 py-4 text-left transition hover:bg-white
                focus:outline-none focus:ring-2 focus:ring-blue-700
              "
            >
              <span>
                <span className="block text-base font-semibold text-blue-700">
                  Ownership Audit
                </span>
                <span className="mt-1 block text-sm text-black">
                  See where your technology stands.
                </span>
              </span>

              <span className="ml-4 text-blue-700" aria-hidden="true">
                →
              </span>
            </button>

            <button
              type="button"
              onClick={handleOwnershipToolkitClick}
              className="
                flex w-full items-center justify-between rounded-xl
                border-2 border-blue-700 bg-blue-100
                px-4 py-4 text-left transition hover:bg-white
                focus:outline-none focus:ring-2 focus:ring-blue-700
              "
            >
              <span>
                <span className="block text-base font-semibold text-blue-700">
                  Ownership Toolkit
                </span>
                <span className="mt-1 block text-sm text-black">
                  Learn what to own, check, and improve.
                </span>
              </span>

              <span className="ml-4 text-blue-700" aria-hidden="true">
                →
              </span>
            </button>

            <button
              type="button"
              onClick={handleOwnershipLearningCircleClick}
              className="
                flex w-full items-center justify-between rounded-xl
                border-2 border-blue-700 bg-blue-100
                px-4 py-4 text-left transition hover:bg-white
                focus:outline-none focus:ring-2 focus:ring-blue-700
              "
            >
              <span>
                <span className="block text-base font-semibold text-blue-700">
                  Ownership Learning Circle
                </span>
                <span className="mt-1 block text-sm text-black">
                  Learn and grow with others.
                </span>
              </span>

              <span className="ml-4 text-blue-700" aria-hidden="true">
                →
              </span>
            </button>
          </div>
        </dialog>
      )}

      {FEATURE_FLAGS.showTestimonials && (
        <div className="mt-7 sm:mt-10 lg:mt-28">
          <Testimonials />
        </div>
      )}

      {isOwnershipAuditOpen && (
        <>
          <div
            aria-hidden="true"
            className="fixed inset-0 z-50 bg-black/50"
            onClick={closeOwnershipAudit}
          />

          <dialog
            open
            aria-labelledby="ownership-audit-heading"
            className="
        fixed inset-0 z-50 m-auto
        h-[94vh] w-[96vw] max-w-280
        overflow-y-auto
        rounded-2xl
        border-2 border-blue-700
        bg-white p-0
        shadow-2xl
      "
          >
            {/* Header */}
            <div
              className="
          sticky top-0 z-20
          flex items-center justify-between
          border-b-2 border-blue-700
          bg-white
          px-5 py-4
          sm:px-7
        "
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                  Technology Ownership
                </p>

                <h2
                  id="ownership-audit-heading"
                  className="
              mt-1
              text-xl font-bold tracking-tight text-black
              sm:text-2xl
            "
                >
                  Ownership Audit
                </h2>
              </div>

              <button
                type="button"
                onClick={closeOwnershipAudit}
                aria-label="Close Ownership Audit"
                className="
            inline-flex h-9 w-9 shrink-0
            items-center justify-center
            rounded-full
            text-xl font-bold text-blue-700
            transition
            hover:bg-blue-100
            focus:outline-none
            focus:ring-2
            focus:ring-blue-700
          "
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>

            {/* Audit content */}
            <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
              <TechnologyOwnershipAudit />
            </div>
          </dialog>
        </>
      )}
      {isOwnershipToolkitOpen && (
        <>
          <div
            aria-hidden="true"
            className="fixed inset-0 z-50 bg-black/50"
            onClick={closeOwnershipToolkit}
          />

          <dialog
            open
            aria-labelledby="technology-ownership-toolkit-heading"
            className="
              fixed inset-0 z-50 m-auto
              max-h-[94vh] w-[96vw] max-w-280
              overflow-y-auto rounded-2xl
              border-2 border-blue-700
              bg-white p-0 shadow-2xl 
            "
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b-2 border-blue-700 bg-white px-5 py-4 sm:px-7">
              <h2
                id="technology-ownership-toolkit-heading"
                className="text-lg font-bold text-blue-700 sm:text-xl"
              >
                Technology Ownership Toolkit
              </h2>

              <button
                type="button"
                onClick={closeOwnershipToolkit}
                aria-label="Close Technology Ownership Toolkit"
                className="
                  inline-flex h-9 w-9 items-center justify-center
                  rounded-full text-xl font-bold text-blue-700
                  transition hover:bg-blue-100
                  focus:outline-none focus:ring-2 focus:ring-blue-700
                "
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <div className="p-5 sm:p-7">
              <TechnologyOwnershipToolkit />
            </div>
          </dialog>
        </>
      )}

      {isOwnershipLearningCircleOpen && (
        <>
          <div
            aria-hidden="true"
            className="fixed inset-0 z-50 bg-black/50"
            onClick={closeOwnershipLearningCircle}
          />

          <dialog
            open
            aria-labelledby="ownership-learning-circle-heading"
            className="
        fixed inset-0 z-50 m-auto
        max-h-[94vh] w-[96vw] max-w-280
        overflow-y-auto rounded-2xl
        border-2 border-blue-700
        bg-white p-0 shadow-2xl
      "
          >
            <div
              className="
          sticky top-0 z-10
          flex items-center justify-between
          border-b-2 border-blue-700
          bg-white px-5 py-4
          sm:px-7
        "
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                  Technology Ownership
                </p>

                <h2
                  id="ownership-learning-circle-heading"
                  className="mt-1 text-xl font-bold tracking-tight text-black sm:text-2xl"
                >
                  Ownership Learning Circle
                </h2>
              </div>

              <button
                type="button"
                onClick={closeOwnershipLearningCircle}
                aria-label="Close Ownership Learning Circle"
                className="
            inline-flex h-9 w-9 shrink-0
            items-center justify-center
            rounded-full text-xl font-bold text-blue-700
            transition hover:bg-blue-100
            focus:outline-none focus:ring-2
            focus:ring-blue-700
          "
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <div className="w-full p-4 sm:p-6 lg:p-8">
              <OwnershipLearningCircle />
            </div>
          </dialog>
        </>
      )}
    </div>
  );
}
