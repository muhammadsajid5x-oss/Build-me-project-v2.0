import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ANALYTICS_EVENTS, trackAnalyticsEvent } from "../analytics";

type Review = {
  id: string;
  starterContent: boolean;
  name: string;
  role: string;
  company: string;
  category: string;
  rating: number;
  content: string;
  verified: boolean;
};

type Metric = {
  label: string;
  rating: number;
};

type CaseStudy = {
  id: string;
  starterContent: boolean;
  title: string;
  category: string;
  summary: string;
  businessNeed: string;
  outcome: string;
  businessValue: string;
  storyUrl: string;
};

export type TestimonialsContent = {
  starterContent: boolean;
  overallRating: number;
  reviewCount: number;
  metrics: Metric[];
  reviews: Review[];
  caseStudies: CaseStudy[];
};

const REVIEWS_PER_PAGE = 4;

function stars(rating: number) {
  return Array.from({ length: 5 }, (_, index) =>
    index < rating ? "★" : "☆",
  ).join("");
}

export default function Testimonials({
  content: testimonialsContent,
}: {
  content: TestimonialsContent;
}) {
  const [mode, setMode] = useState<"testimonials" | "case-studies">(
    "testimonials",
  );

  const [reviewPage, setReviewPage] = useState(1);

  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  const [selectedCaseStudy, setSelectedCaseStudy] = useState<CaseStudy | null>(
    null,
  );

  const sectionRef = useRef<HTMLElement | null>(null);
  const viewedRef = useRef(false);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section || viewedRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || viewedRef.current) {
          return;
        }

        viewedRef.current = true;

        trackAnalyticsEvent({
          name: ANALYTICS_EVENTS.TESTIMONIALS_VIEWED,
          eventType: "view",
          path: window.location.pathname,
        });

        observer.disconnect();
      },
      {
        threshold: 0.5,
      },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  const totalReviewPages = Math.ceil(
    testimonialsContent.reviews.length / REVIEWS_PER_PAGE,
  );

  const paginatedReviews = testimonialsContent.reviews.slice(
    (reviewPage - 1) * REVIEWS_PER_PAGE,
    reviewPage * REVIEWS_PER_PAGE,
  );

  const handleModeChange = (nextMode: "testimonials" | "case-studies") => {
    setMode(nextMode);

    if (nextMode === "testimonials") {
      setReviewPage(1);
    }

    if (nextMode === "case-studies") {
      trackAnalyticsEvent({
        name: ANALYTICS_EVENTS.CASE_STUDIES_VIEWED,
        eventType: "view",
        path: window.location.pathname,
      });
    }
  };

  const handleReviewPageChange = (page: number) => {
    if (page < 1 || page > totalReviewPages || page === reviewPage) {
      return;
    }

    setReviewPage(page);

    trackAnalyticsEvent({
      name: ANALYTICS_EVENTS.TESTIMONIALS_PAGINATION_CLICKED,
      eventType: "click",
      path: window.location.pathname,
    });

    window.requestAnimationFrame(() => {
      document.getElementById("testimonials-reviews")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const openReview = (review: Review) => {
    setSelectedReview(review);

    trackAnalyticsEvent({
      name: ANALYTICS_EVENTS.TESTIMONIAL_STORY_CLICKED,
      eventType: "click",
      path: window.location.pathname,
    });
  };

  const openCaseStudy = (caseStudy: CaseStudy) => {
    setSelectedCaseStudy(caseStudy);

    trackAnalyticsEvent({
      name: ANALYTICS_EVENTS.CASE_STUDY_DETAILS_CLICKED,
      eventType: "click",
      path: window.location.pathname,
    });
  };

  return (
    <>
      <section
        ref={sectionRef}
        aria-labelledby="testimonials-heading"
        className="relative w-full bg-white px-4 py-10 sm:px-6 lg:px-8"
      >
        <div className="mx-auto w-full max-w-7xl">
          {/* Section heading */}
          <div className="mx-auto max-w-3xl text-center">
            <p className="-mt-24 text-sm font-bold uppercase tracking-[0.18em] text-blue-700">
              Verified Business Impact
            </p>

            <h2
              id="testimonials-heading"
              className="mt-3 text-3xl font-bold tracking-tight text-black sm:text-4xl"
            >
              What People Say
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-black sm:text-base">
              Genuine feedback and experiences from the people and teams I've
              had the pleasure of working with.
            </p>
          </div>

          {/* Overall Rating + Business Metrics */}
          <div className="mx-auto mt-8 max-w-5xl rounded-2xl border-2 border-blue-700 bg-white p-5 shadow-sm sm:p-6">
            <div className="grid grid-cols-1 items-center gap-7 md:grid-cols-[220px_1fr] md:gap-10">
              {/* Overall Experience */}
              <div className="text-center md:border-r-2 md:border-blue-100 md:pr-8">
                <p className="text-5xl font-bold leading-none text-black sm:text-6xl">
                  {testimonialsContent.overallRating.toFixed(1)}
                </p>

                <div
                  aria-label={`${testimonialsContent.overallRating} out of 5 stars`}
                  className="mt-3 text-xl tracking-widest text-blue-700"
                >
                  {stars(testimonialsContent.overallRating)}
                </div>

                <p className="mt-2 text-sm font-bold text-black">
                  Overall Experience
                </p>

                <p className="mt-2 text-xs font-semibold text-black">
                  {testimonialsContent.reviewCount} Review
                  {testimonialsContent.reviewCount === 1 ? "" : "s"}
                </p>
              </div>

              {/* Business Metrics */}
              <div className="space-y-4">
                {testimonialsContent.metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="grid grid-cols-[120px_1fr_35px] items-center gap-3 sm:grid-cols-[150px_1fr_40px]"
                  >
                    <span className="text-xs font-semibold text-black sm:text-sm">
                      {metric.label}
                    </span>

                    <div
                      className="h-2 overflow-hidden rounded-full bg-blue-100"
                      aria-hidden="true"
                    >
                      <div
                        className="h-full rounded-full bg-blue-700"
                        style={{
                          width: `${(metric.rating / 5) * 100}%`,
                        }}
                      />
                    </div>

                    <span className="text-right text-xs font-bold text-black sm:text-sm">
                      {metric.rating.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div
            className="mt-8 flex justify-center"
            role="tablist"
            aria-label="Testimonials and case studies"
          >
            <div className="inline-flex rounded-xl border-2 border-blue-700 bg-white p-1">
              <button
                type="button"
                role="tab"
                aria-selected={mode === "testimonials"}
                onClick={() => handleModeChange("testimonials")}
                className={[
                  "rounded-lg px-5 py-2.5 text-sm font-semibold transition",
                  mode === "testimonials"
                    ? "bg-blue-700 text-white"
                    : "text-black hover:bg-blue-100",
                ].join(" ")}
              >
                Testimonials
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={mode === "case-studies"}
                onClick={() => handleModeChange("case-studies")}
                className={[
                  "rounded-lg px-5 py-2.5 text-sm font-semibold transition",
                  mode === "case-studies"
                    ? "bg-blue-700 text-white"
                    : "text-black hover:bg-blue-100",
                ].join(" ")}
              >
                Case Studies
              </button>
            </div>
          </div>

          {/* Testimonials */}
          {mode === "testimonials" && (
            <div id="testimonials-reviews" className="mt-8">
              {/* Four testimonial cards per page */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {paginatedReviews.map((review) => (
                  <article
                    key={review.id}
                    className="flex h-full min-h-70 flex-col rounded-2xl border-2 border-blue-700 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-bold text-black">
                          {review.name}
                        </p>

                        <p className="mt-1 text-xs text-black">
                          {review.role} · {review.company}
                        </p>
                      </div>

                      {review.verified && (
                        <span
                          aria-label="Verified review"
                          className="shrink-0 text-sm font-bold text-blue-700"
                        >
                          ✓
                        </span>
                      )}
                    </div>

                    <span className="mt-4 w-fit rounded-full bg-blue-100 px-3 py-1 text-[10px] font-bold text-blue-700">
                      {review.category}
                    </span>

                    {/* Rating and review stay together */}
                    <div className="mt-4">
                      <div
                        aria-label={`${review.rating} out of 5 stars`}
                        className="text-lg tracking-[0.12em] text-blue-700"
                      >
                        {stars(review.rating)}
                      </div>

                      <blockquote className="mt-3 text-sm leading-6 text-black">
                        “{review.content}”
                      </blockquote>
                    </div>

                    <button
                      type="button"
                      onClick={() => openReview(review)}
                      className="mt-auto border-t-2 border-blue-100 pt-3 text-left text-sm font-semibold text-blue-700 hover:text-black"
                    >
                      Read Full Review →
                    </button>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              {totalReviewPages > 1 && (
                <nav
                  aria-label="Testimonials pagination"
                  className="mt-8 flex items-center justify-center gap-2"
                >
                  <button
                    type="button"
                    disabled={reviewPage === 1}
                    onClick={() => handleReviewPageChange(reviewPage - 1)}
                    className="rounded-lg border-2 border-blue-700 px-3 py-2 text-sm font-semibold text-black transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ←
                  </button>

                  {Array.from({ length: totalReviewPages }, (_, index) => {
                    const page = index + 1;

                    return (
                      <button
                        key={page}
                        type="button"
                        onClick={() => handleReviewPageChange(page)}
                        aria-current={reviewPage === page ? "page" : undefined}
                        className={[
                          "h-9 min-w-9 rounded-lg px-3 text-sm font-semibold transition",
                          reviewPage === page
                            ? "bg-blue-700 text-white"
                            : "border-2 border-blue-700 bg-white text-black hover:bg-blue-100",
                        ].join(" ")}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    disabled={reviewPage === totalReviewPages}
                    onClick={() => handleReviewPageChange(reviewPage + 1)}
                    className="rounded-lg border-2 border-blue-700 px-3 py-2 text-sm font-semibold text-black transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    →
                  </button>
                </nav>
              )}

              {/* Empty state */}
              {testimonialsContent.reviews.length === 0 && (
                <div className="rounded-2xl border-2 border-blue-100 bg-white p-8 text-center">
                  <p className="text-sm font-semibold text-black">
                    No testimonials are available yet.
                  </p>

                  <p className="mt-2 text-xs text-black">
                    New reviews will appear here when they are added.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Case Studies */}
          {mode === "case-studies" && (
            <div className="mt-8">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                {testimonialsContent.caseStudies.map((caseStudy) => (
                  <article
                    key={caseStudy.id}
                    className="flex h-full flex-col rounded-2xl border-2 border-blue-700 bg-white p-5 shadow-sm"
                  >
                    <div className="flex-1">
                      <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-[10px] font-bold text-blue-700">
                        {caseStudy.category}
                      </span>

                      <h3 className="mt-4 text-xl font-bold text-black">
                        {caseStudy.title}
                      </h3>

                      <p className="mt-3 text-sm leading-6 text-black">
                        {caseStudy.summary}
                      </p>

                      <div className="mt-5 space-y-4">
                        <div className="rounded-xl bg-blue-100 p-4">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-blue-700">
                            Business Need
                          </p>

                          <p className="mt-1 text-sm leading-5 text-black">
                            {caseStudy.businessNeed}
                          </p>
                        </div>

                        <div className="rounded-xl border-2 border-blue-100 p-4">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-blue-700">
                            Outcome
                          </p>

                          <p className="mt-1 text-sm leading-5 text-black">
                            {caseStudy.outcome}
                          </p>
                        </div>

                        <div className="rounded-xl border-2 border-blue-100 p-4">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-blue-700">
                            Business Value
                          </p>

                          <p className="mt-1 text-sm leading-5 text-black">
                            {caseStudy.businessValue}
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => openCaseStudy(caseStudy)}
                      className="mt-5 text-left text-sm font-semibold text-blue-700 hover:text-black"
                    >
                      Read Full Story →
                    </button>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* Starter Content Indicator */}
          {testimonialsContent.starterContent && (
            <p className="mt-8 text-center text-xs text-black">
              Starter content — reviews and case studies can be replaced or
              expanded as real customer content becomes available.
            </p>
          )}
        </div>
      </section>

      {/* Review Dialog */}
      {selectedReview && (
        <>
          <div
            aria-hidden="true"
            className="fixed inset-0 z-50 bg-black/70"
            onClick={() => setSelectedReview(null)}
          />

          <dialog
            open
            aria-labelledby="review-dialog-heading"
            className="fixed inset-0 z-50 m-auto w-[92vw] max-w-xl rounded-2xl border-2 border-blue-700 bg-white p-0 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b-2 border-blue-700 px-5 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                  Customer Review
                </p>

                <h2
                  id="review-dialog-heading"
                  className="mt-1 text-xl font-bold text-black"
                >
                  {selectedReview.name}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedReview(null)}
                aria-label="Close review"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-xl font-bold text-blue-700 hover:bg-blue-100"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <div
                aria-label={`${selectedReview.rating} out of 5 stars`}
                className="text-xl tracking-[0.12em] text-blue-700"
              >
                {stars(selectedReview.rating)}
              </div>

              <blockquote className="mt-5 text-base leading-7 text-black">
                “{selectedReview.content}”
              </blockquote>

              <p className="mt-5 text-sm text-black">
                {selectedReview.role} · {selectedReview.company}
              </p>
            </div>
          </dialog>
        </>
      )}

      {/* Case Study Dialog */}
      {selectedCaseStudy && (
        <>
          <div
            aria-hidden="true"
            className="fixed inset-0 z-50 bg-black/70"
            onClick={() => setSelectedCaseStudy(null)}
          />

          <dialog
            open
            aria-labelledby="case-study-dialog-heading"
            className="fixed inset-0 z-50 m-auto max-h-[90vh] w-[92vw] max-w-2xl overflow-y-auto rounded-2xl border-2 border-blue-700 bg-white p-0 shadow-2xl"
          >
            <div className="sticky top-0 flex items-center justify-between border-b-2 border-blue-700 bg-white px-5 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                  Business Case Study
                </p>

                <h2
                  id="case-study-dialog-heading"
                  className="mt-1 text-xl font-bold text-black"
                >
                  {selectedCaseStudy.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCaseStudy(null)}
                aria-label="Close case study"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-xl font-bold text-blue-700 hover:bg-blue-100"
              >
                ×
              </button>
            </div>

            <div className="space-y-5 p-6">
              <p className="text-sm leading-6 text-black">
                {selectedCaseStudy.summary}
              </p>

              <div className="rounded-xl bg-blue-100 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                  Business Need
                </p>

                <p className="mt-2 text-sm leading-6 text-black">
                  {selectedCaseStudy.businessNeed}
                </p>
              </div>

              <div className="rounded-xl border-2 border-blue-100 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                  Outcome
                </p>

                <p className="mt-2 text-sm leading-6 text-black">
                  {selectedCaseStudy.outcome}
                </p>
              </div>

              <div className="rounded-xl border-2 border-blue-100 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                  Business Value
                </p>

                <p className="mt-2 text-sm leading-6 text-black">
                  {selectedCaseStudy.businessValue}
                </p>
              </div>

              <Link
                to={selectedCaseStudy.storyUrl}
                onClick={() => setSelectedCaseStudy(null)}
                className="inline-flex items-center justify-center rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-black"
              >
                Continue to {selectedCaseStudy.title} →
              </Link>
            </div>
          </dialog>
        </>
      )}
    </>
  );
}
