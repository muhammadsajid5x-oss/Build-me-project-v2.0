import { useEffect, useRef, useState } from "react";

import { ANALYTICS_EVENTS, trackAnalyticsEvent } from "../analytics";

type Testimonial = {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  avatar: string | null;
  category: string | null;
  content: string;
  rating: number;
  helpfulCount: number;
  storyUrl: string | null;
  verified: boolean;
  published: boolean;
  createdAt: string;
};

type TestimonialsResponse = {
  data: Testimonial[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type HelpfulResponse = {
  data: {
    testimonialId: string;
    helpfulCount: number;
  };
};

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:3000";

const PAGE_SIZE = 4;
const MAX_CONTENT_LENGTH = 150;

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function truncateContent(content: string) {
  const trimmedContent = content.trim();

  if (trimmedContent.length <= MAX_CONTENT_LENGTH) {
    return trimmedContent;
  }

  return `${trimmedContent.slice(0, MAX_CONTENT_LENGTH).trimEnd()}...`;
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [helpfulLoading, setHelpfulLoading] = useState<string | null>(null);

  const testimonialsSectionRef = useRef<HTMLElement | null>(null);
  const testimonialsViewedRef = useRef(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadTestimonials() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `${API_BASE_URL}/api/v1/testimonials?page=${page}&limit=${PAGE_SIZE}`,
          {
            method: "GET",
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error("Unable to load testimonials.");
        }

        const result: TestimonialsResponse = await response.json();

        setTestimonials(result.data);
        setTotalPages(result.pagination.totalPages);
        setTotal(result.pagination.total);
      } catch (requestError) {
        if (
          requestError instanceof DOMException &&
          requestError.name === "AbortError"
        ) {
          return;
        }

        setError("Testimonials are temporarily unavailable.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadTestimonials();

    return () => controller.abort();
  }, [page]);

  useEffect(() => {
    const section = testimonialsSectionRef.current;

    if (!section || testimonialsViewedRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (!entry?.isIntersecting || testimonialsViewedRef.current) {
          return;
        }

        testimonialsViewedRef.current = true;

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

  const goToPreviousPage = () => {
    setPage((currentPage) => Math.max(1, currentPage - 1));

    trackAnalyticsEvent({
      name: ANALYTICS_EVENTS.TESTIMONIALS_PAGINATION_CLICKED,
      eventType: "click",
      path: window.location.pathname,
    });
  };

  const goToNextPage = () => {
    setPage((currentPage) => Math.min(totalPages, currentPage + 1));

    trackAnalyticsEvent({
      name: ANALYTICS_EVENTS.TESTIMONIALS_PAGINATION_CLICKED,
      eventType: "click",
      path: window.location.pathname,
    });
  };

  const markHelpful = async (testimonialId: string) => {
    if (helpfulLoading === testimonialId) {
      return;
    }

    try {
      setHelpfulLoading(testimonialId);

      const response = await fetch(
        `${API_BASE_URL}/api/v1/testimonials/${testimonialId}/helpful`,
        {
          method: "POST",
        },
      );

      if (!response.ok) {
        throw new Error("Unable to mark testimonial as helpful.");
      }

      const result: HelpfulResponse = await response.json();

      setTestimonials((currentTestimonials) =>
        currentTestimonials.map((testimonial) =>
          testimonial.id === testimonialId
            ? {
                ...testimonial,
                helpfulCount: result.data.helpfulCount,
              }
            : testimonial,
        ),
      );

      trackAnalyticsEvent({
        name: ANALYTICS_EVENTS.TESTIMONIAL_HELPFUL_CLICKED,
        eventType: "click",
        path: window.location.pathname,
      });
    } catch {
      // Helpful is best effort. Keep the existing database value when
      // the request fails and do not interrupt the visitor journey.
    } finally {
      setHelpfulLoading(null);
    }
  };

  const handleStoryClick = (testimonial: Testimonial) => {
    if (!testimonial.storyUrl) {
      return;
    }

    trackAnalyticsEvent({
      name: ANALYTICS_EVENTS.TESTIMONIAL_STORY_CLICKED,
      eventType: "click",
      path: window.location.pathname,
    });
  };

  return (
    <section
      ref={testimonialsSectionRef}
      aria-labelledby="testimonials-heading"
      className="relative z-40 -mt-4 w-full bg-[#EAF0F6] px-4 pb-4 pt-2 sm:px-6 lg:-mt-28 lg:px-8"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <h2
            id="testimonials-heading"
            className="mt-0 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl"
          >
            What Our Community Says
          </h2>

          <p className="mt-0 text-sm leading-5 text-gray-600">
            Feedback from people who have experienced practical Technology
            Ownership guidance and delivery support.
          </p>
        </div>

        {isLoading && (
          <div
            role="status"
            aria-live="polite"
            className="mt-3 text-center text-sm text-gray-600"
          >
            Loading testimonials...
          </div>
        )}

        {!isLoading && error && (
          <div
            role="alert"
            className="mx-auto mt-3 max-w-xl rounded-xl border border-gray-200 bg-white p-4 text-center text-sm text-gray-600 shadow-sm"
          >
            {error}
          </div>
        )}

        {!isLoading && !error && testimonials.length === 0 && (
          <div className="mx-auto mt-3 max-w-xl rounded-xl border border-gray-200 bg-white p-4 text-center text-sm text-gray-600 shadow-sm">
            No testimonials are currently available.
          </div>
        )}

        {!isLoading && !error && testimonials.length > 0 && (
          <>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
              {testimonials.map((testimonial) => (
                <article
                  key={testimonial.id}
                  className="
                    flex h-full flex-col rounded-2xl border border-gray-200
                    bg-white p-4 shadow-sm
                  "
                >
                  {/* Identity row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      {testimonial.avatar ? (
                        <img
                          src={testimonial.avatar}
                          alt={`${testimonial.name} avatar`}
                          className="h-10 w-10 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          aria-hidden="true"
                          className="
                            flex h-10 w-10 shrink-0 items-center justify-center
                            rounded-full bg-blue-100 text-xs font-bold text-blue-700
                          "
                        >
                          {getInitials(testimonial.name)}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="truncate text-sm font-bold text-gray-900">
                            {testimonial.name}
                          </p>

                          {testimonial.verified && (
                            <span
                              aria-label="Verified testimonial"
                              title="Verified"
                              className="text-xs font-bold text-blue-600"
                            >
                              ✓
                            </span>
                          )}
                        </div>

                        {(testimonial.role || testimonial.company) && (
                          <p className="truncate text-xs text-gray-500">
                            {[testimonial.role, testimonial.company]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        )}
                      </div>
                    </div>

                    {testimonial.category && (
                      <span
                        className="
                          shrink-0 rounded-full bg-blue-50 px-2 py-1
                          text-[10px] font-semibold text-blue-700
                        "
                      >
                        {testimonial.category}
                      </span>
                    )}
                  </div>

                  {/* Rating */}
                  <div
                    aria-label={`${testimonial.rating} out of 5 stars`}
                    className="mt-3 text-sm tracking-wide text-amber-500"
                  >
                    {Array.from({ length: 5 }, (_, index) =>
                      index < testimonial.rating ? "★" : "☆",
                    ).join("")}
                  </div>

                  {/* Testimonial content */}
                  <blockquote className="mt-2 flex-1 text-sm leading-5 text-gray-700">
                    "{truncateContent(testimonial.content)}"
                  </blockquote>

                  {/* Bottom actions */}
                  <footer className="mt-3 border-t border-gray-100 pt-3">
                    <div className="flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => void markHelpful(testimonial.id)}
                        disabled={helpfulLoading === testimonial.id}
                        className="
                          text-xs font-medium text-gray-500
                          transition hover:text-blue-700
                          disabled:cursor-not-allowed disabled:opacity-60
                        "
                        aria-label={`Mark ${testimonial.name}'s testimonial as helpful`}
                      >
                        {helpfulLoading === testimonial.id
                          ? "Saving..."
                          : `♡ Helpful (${testimonial.helpfulCount})`}
                      </button>

                      {testimonial.storyUrl ? (
                        <a
                          href={testimonial.storyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => handleStoryClick(testimonial)}
                          className="
                            cursor-pointer text-xs font-semibold text-blue-700
                            transition hover:text-blue-900
                          "
                        >
                          Read Story →
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            console.info(
                              `No story available for ${testimonial.name}`,
                            );
                          }}
                          className="
                            cursor-pointer text-xs font-semibold text-blue-700
                            transition hover:text-blue-900
                          "
                          aria-label={`Read story for ${testimonial.name}`}
                        >
                          Read Story →
                        </button>
                      )}
                    </div>
                  </footer>
                </article>
              ))}
            </div>

            {totalPages > 1 && (
              <nav
                aria-label="Testimonials pagination"
                className="mt-3 flex items-center justify-center gap-3"
              >
                <button
                  type="button"
                  onClick={goToPreviousPage}
                  disabled={page === 1}
                  className="
                    rounded-lg border border-gray-300 bg-white px-3 py-1.5
                    text-sm font-semibold text-gray-700 transition
                    hover:bg-gray-50 disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  Previous
                </button>

                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>

                <button
                  type="button"
                  onClick={goToNextPage}
                  disabled={page === totalPages}
                  className="
                    rounded-lg border border-gray-300 bg-white px-3 py-1.5
                    text-sm font-semibold text-gray-700 transition
                    hover:bg-gray-50 disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  Next
                </button>
              </nav>
            )}

            <p className="mt-1 text-center text-xs text-gray-500">
              Showing {testimonials.length} of {total} published testimonials
            </p>
          </>
        )}
      </div>
    </section>
  );
}
