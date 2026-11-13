import { useState } from "react";
import { Link } from "react-router-dom";

import { Modal, ModalHeader, ModalBody } from "@build-me/ui";
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

  // Existing Work With Me behaviour — unchanged
  const handleWorkWithMeClick = () => {
    trackAnalyticsEvent({
      name: ANALYTICS_EVENTS.WORK_WITH_ME_CLICKED,
      eventType: "click",
    });

    setIsImpactCardOpen(true);
  };

  // Get Quick Wins opens its own impact card
  const handleGetQuickWinsClick = () => {
    setIsQuickWinsCardOpen(true);
  };

  const closeImpactCard = () => {
    setIsImpactCardOpen(false);
  };

  const closeQuickWinsCard = () => {
    setIsQuickWinsCardOpen(false);
  };

  // Ownership Audit opens from the Get Quick Wins card
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

  // Ownership Toolkit opens from the Get Quick Wins card
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

  // Ownership Learning Circle opens from the Get Quick Wins card
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
        {/* Hero Top */}
        <div className="col-span-full">
          <HeroTop />
        </div>

        {/* Hero Left */}
        <div
          className="
            relative z-20 min-w-0
            lg:w-[calc(100%+120px)] lg:max-w-none
          "
        >
          <TechnologyOwnershipHero />
        </div>

        {/* Hero Right */}
        <div
          className="
    relative z-10 min-w-0
    translate-y-58
    sm:translate-y-43
    lg:translate-y-0
  "
        >
          <HeroRight />
        </div>

        {/* Hero Bottom */}
        <div
          className="
    relative z-40 col-span-full
    -mt-96 translate-x-4 sm:-mt-116 sm:translate-x-5 lg:translate-x-0
    lg:-mt-56
  "
        >
          <HeroBottom />
        </div>

        {/* Existing buttons — immediately after Hero Bottom */}
        <div
          className="
    relative z-40 col-span-full
    -mt-58
    sm:-mt-91
    lg:-mt-30
    flex flex-wrap items-center gap-3
  "
        >
          {/* Existing Work With Me button */}
          <button
            type="button"
            onClick={handleWorkWithMeClick}
            className="
      inline-flex items-center justify-center rounded-lg
      bg-blue-600 px-6 py-3 text-base font-semibold text-white
      transition hover:bg-blue-700
      focus:outline-none focus:ring-2 focus:ring-blue-600
      focus:ring-offset-2
    "
          >
            Work With Me
          </button>

          {/* Existing Get Quick Wins button */}
          <button
            type="button"
            onClick={handleGetQuickWinsClick}
            className="
      inline-flex items-center justify-center rounded-lg
      border-2 border-blue-950 bg-white px-6 py-3
      text-base font-semibold text-blue-800
      transition hover:bg-blue-50
      focus:outline-none focus:ring-2 focus:ring-blue-800
      focus:ring-offset-2
    "
          >
            Get Quick Wins
          </button>
        </div>
      </section>

      {/* Work With Me impact card — existing options */}
      {isImpactCardOpen && (
        <dialog
          open
          aria-labelledby="impact-card-heading"
          className="
      fixed inset-0 z-50 m-auto w-full max-w-lg
      rounded-2xl border border-[#0052FF]/20
      bg-white p-6 shadow-xl sm:p-8
    "
        >
          <div className="flex items-start justify-between">
            <h2
              id="impact-card-heading"
              className="text-xl font-bold tracking-tight text-[#0052FF]"
            >
              How would you like to work together?
            </h2>

            <button
              type="button"
              onClick={closeImpactCard}
              aria-label="Close Work With Me card"
              className="
          ml-3 inline-flex h-8 w-8 items-center justify-center
          rounded-full text-[#0052FF] transition hover:bg-[#EBF3FE]
          focus:outline-none focus:ring-2 focus:ring-[#0052FF]
        "
            >
              <span aria-hidden="true" className="text-lg leading-none">
                ×
              </span>
            </button>
          </div>

          <p className="mt-3 text-sm text-slate-700">
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
          border border-[#0052FF]/30 bg-[#EBF3FE]
          px-4 py-4 text-left transition
          hover:border-[#0052FF] hover:bg-blue-100
          focus:outline-none focus:ring-2 focus:ring-[#0052FF]
        "
            >
              <span>
                <span className="block text-base font-semibold text-[#0052FF]">
                  Mentor Me
                </span>
                <span className="mt-1 block text-sm text-slate-700">
                  Request mentoring support and guidance.
                </span>
              </span>

              <span className="ml-4 text-[#0052FF]" aria-hidden="true">
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
          border border-[#0052FF]/30 bg-[#EBF3FE]
          px-4 py-4 text-left transition
          hover:border-[#0052FF] hover:bg-blue-100
          focus:outline-none focus:ring-2 focus:ring-[#0052FF]
        "
            >
              <span>
                <span className="block text-base font-semibold text-[#0052FF]">
                  Deliver My Project
                </span>
                <span className="mt-1 block text-sm text-slate-700">
                  Tell me about your project and I will review it.
                </span>
              </span>

              <span className="ml-4 text-[#0052FF]" aria-hidden="true">
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
          border border-[#0052FF]/30 bg-[#EBF3FE]
          px-4 py-4 text-left transition
          hover:border-[#0052FF] hover:bg-blue-100
          focus:outline-none focus:ring-2 focus:ring-[#0052FF]
        "
            >
              <span>
                <span className="block text-base font-semibold text-[#0052FF]">
                  Coffee With Me
                </span>
                <span className="mt-1 block text-sm text-slate-700">
                  Grab a virtual coffee and chat about what is next for you.
                </span>
              </span>

              <span className="ml-4 text-[#0052FF]" aria-hidden="true">
                →
              </span>
            </Link>
          </div>
        </dialog>
      )}

      {/* Get Quick Wins impact card */}
      {isQuickWinsCardOpen && (
        <dialog
          open
          aria-labelledby="quick-wins-heading"
          className="
      fixed inset-0 z-50 m-auto w-full max-w-lg
      rounded-2xl border border-[#0052FF]/20
      bg-white p-6 shadow-xl sm:p-8
    "
        >
          <div className="flex items-start justify-between">
            <h2
              id="quick-wins-heading"
              className="text-xl font-bold tracking-tight text-[#0052FF]"
            >
              Get Quick Wins
            </h2>

            <button
              type="button"
              onClick={closeQuickWinsCard}
              aria-label="Close Get Quick Wins card"
              className="
          ml-3 inline-flex h-8 w-8 items-center justify-center
          rounded-full text-[#0052FF] transition hover:bg-[#EBF3FE]
          focus:outline-none focus:ring-2 focus:ring-[#0052FF]
        "
            >
              <span aria-hidden="true" className="text-lg leading-none">
                ×
              </span>
            </button>
          </div>

          <p className="mt-3 text-sm text-slate-700">
            Discover where your technology ownership stands and identify
            opportunities for improvement.
          </p>

          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={handleOwnershipAuditClick}
              className="
          flex w-full items-center justify-between rounded-xl
          border border-[#0052FF]/30 bg-[#EBF3FE]
          px-4 py-4 text-left transition
          hover:border-[#0052FF] hover:bg-blue-100
          focus:outline-none focus:ring-2 focus:ring-[#0052FF]
          focus:ring-offset-2
        "
            >
              <span>
                <span className="block text-base font-semibold text-[#0052FF]">
                  Ownership Audit
                </span>
                <span className="mt-1 block text-sm text-slate-700">
                  Audit your technology ownership and maturity.
                </span>
              </span>

              <span className="ml-4 text-[#0052FF]" aria-hidden="true">
                →
              </span>
            </button>

            <button
              type="button"
              onClick={handleOwnershipToolkitClick}
              className="
          flex w-full items-center justify-between rounded-xl
          border border-[#0052FF]/30 bg-[#EBF3FE]
          px-4 py-4 text-left transition
          hover:border-[#0052FF] hover:bg-blue-100
          focus:outline-none focus:ring-2 focus:ring-[#0052FF]
          focus:ring-offset-2
        "
            >
              <span>
                <span className="block text-base font-semibold text-[#0052FF]">
                  Ownership Toolkit
                </span>
                <span className="mt-1 block text-sm text-slate-700">
                  Access practical lifecycle guidance, checklists, and the
                  downloadable Technology Ownership Toolkit.
                </span>
              </span>

              <span className="ml-4 text-[#0052FF]" aria-hidden="true">
                →
              </span>
            </button>

            <button
              type="button"
              onClick={handleOwnershipLearningCircleClick}
              className="
          flex w-full items-center justify-between rounded-xl
          border border-[#0052FF]/30 bg-[#EBF3FE]
          px-4 py-4 text-left transition
          hover:border-[#0052FF] hover:bg-blue-100
          focus:outline-none focus:ring-2 focus:ring-[#0052FF]
          focus:ring-offset-2
        "
            >
              <span>
                <span className="block text-base font-semibold text-[#0052FF]">
                  Ownership Learning Circle
                </span>
                <span className="mt-1 block text-sm text-slate-700">
                  Join a free community to learn and grow your Technology
                  Ownership.
                </span>
              </span>

              <span className="ml-4 text-[#0052FF]" aria-hidden="true">
                →
              </span>
            </button>
          </div>
        </dialog>
      )}

      <div className="mt-41 sm:mt-28.5 lg:mt-6">
        <Testimonials />
      </div>

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

      {isOwnershipToolkitOpen && (
        <Modal open={isOwnershipToolkitOpen} onClose={closeOwnershipToolkit}>
          <ModalHeader>
            <h2 className="text-xl font-bold tracking-tight text-gray-900">
              Technology Ownership Toolkit
            </h2>
          </ModalHeader>

          <ModalBody>
            <TechnologyOwnershipToolkit />
          </ModalBody>
        </Modal>
      )}

      {isOwnershipLearningCircleOpen && (
        <Modal
          open={isOwnershipLearningCircleOpen}
          onClose={closeOwnershipLearningCircle}
        >
          <ModalHeader>
            <h2 className="text-xl font-bold tracking-tight text-blue-600">
              Ownership Learning Circle
            </h2>
          </ModalHeader>

          <ModalBody>
            <OwnershipLearningCircle />
          </ModalBody>
        </Modal>
      )}
    </div>
  );
}
