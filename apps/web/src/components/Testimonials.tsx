import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { ANALYTICS_EVENTS, trackAnalyticsEvent } from "../analytics";
import { getApiBaseUrl } from "../api-url";
import bundledStarterContent from "../content/testimonials.json";

type CategoryKey = "communications" | "timelines" | "knowledge" | "value";

type KeyResult = {
  stat: string;
  label: string;
};

type Review = {
  id: string;
  starterContent?: boolean;
  name: string;
  role: string | null;
  company: string | null;
  location: string | null;
  source: string | null;
  category: string | null;
  tags: string[];
  rating: number;
  communications: number | null;
  timelines: number | null;
  knowledge: number | null;
  value: number | null;
  content: string;
  outcome: string | null;
  verified?: boolean;
};

type CaseStudy = {
  id: string;
  starterContent?: boolean;
  company: string;
  location: string | null;
  category: string | null;
  tags: string[];
  title: string;
  summary: string;
  challenge?: string;
  solution?: string;
  outcome: string;
  businessValue?: string;
  content?: string;
  keyResults: KeyResult[];
  storyUrl: string | null;
};

export type TestimonialsContent = {
  starterContent: boolean;
  customerCount: string;
  badge: string;
  heading: string;
  subtitle: string;
  reviews: Review[];
  caseStudies: CaseStudy[];
};

type ApiTestimonialsResponse = {
  data?: Array<{
    id: string;
    name: string;
    role: string | null;
    company: string | null;
    location: string | null;
    source: string | null;
    tags: string[];
    avatar: string | null;
    category: string | null;
    content: string;
    rating: number;
    communications: number | null;
    timelines: number | null;
    knowledge: number | null;
    value: number | null;
    outcome: string | null;
    verified?: boolean;
  }>;
};

type ApiCaseStudiesResponse = {
  data?: Array<{
    id: string;
    company: string;
    location: string | null;
    category: string | null;
    tags: string[];
    title: string;
    summary: string;
    outcome: string;
    content: string;
    keyResults: KeyResult[];
    storyUrl: string | null;
  }>;
};

const starterContent = bundledStarterContent as TestimonialsContent;

const REVIEWS_PER_PAGE = 4;
const CASE_STUDIES_PER_PAGE = 4;

const categoryLabels: Array<{
  key: CategoryKey;
  label: string;
}> = [
  {
    key: "communications",
    label: "Communications",
  },
  {
    key: "timelines",
    label: "Timelines",
  },
  {
    key: "knowledge",
    label: "Knowledge",
  },
  {
    key: "value",
    label: "Value",
  },
];

function clampRating(value: number | null | undefined): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 5;
  }

  return Math.min(5, Math.max(1, value));
}

function stars(rating: number): string {
  const rounded = Math.round(clampRating(rating));

  return Array.from({ length: 5 }, (_, index) =>
    index < rounded ? "★" : "☆",
  ).join("");
}

function getInitials(value: string): string {
  const words = value.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return "NA";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function formatSource(value: string | null): string {
  switch (value) {
    case "client-work":
      return "Client Work";

    case "mentorship":
      return "Mentorship";

    case "coffee-chat":
      return "Coffee With Me";

    default:
      return value ?? "Customer Review";
  }
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}

function getCategoryRating(review: Review, key: CategoryKey): number {
  const value = review[key];

  if (typeof value === "number") {
    return clampRating(value);
  }

  return clampRating(review.rating);
}

function dedupeById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();

  return items.filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }

    seen.add(item.id);
    return true;
  });
}

function getStoryUrl(caseStudy: CaseStudy): string {
  if (caseStudy.storyUrl) {
    return new URL(caseStudy.storyUrl, window.location.origin).toString();
  }

  return window.location.href;
}

function PaginationDots({
  page,
  totalPages,
  onChange,
  label,
}: {
  readonly page: number;
  readonly totalPages: number;
  readonly onChange: (page: number) => void;
  readonly label: string;
}) {
  if (totalPages <= 1) {
    return (
      <div className="mt-7 flex justify-center" aria-label={label}>
        <span
          className="h-2.5 w-2.5 rounded-full bg-blue-700"
          aria-hidden="true"
        />
      </div>
    );
  }

  return (
    <nav aria-label={label} className="mt-7 flex justify-center gap-2">
      {Array.from({ length: totalPages }, (_, index) => {
        const dotPage = index + 1;
        const active = dotPage === page;

        return (
          <button
            key={dotPage}
            type="button"
            onClick={() => onChange(dotPage)}
            aria-label={`Go to page ${dotPage}`}
            aria-current={active ? "page" : undefined}
            className={[
              "h-2.5 rounded-full transition-all",
              active
                ? "w-8 bg-blue-700"
                : "w-2.5 bg-blue-100 hover:bg-blue-700",
            ].join(" ")}
          />
        );
      })}
    </nav>
  );
}

export default function Testimonials({
  content = starterContent,
}: {
  readonly content?: TestimonialsContent;
}) {
  const [mode, setMode] = useState<"testimonials" | "case-studies">(
    "testimonials",
  );

  const [reviewPage, setReviewPage] = useState(1);
  const [caseStudyPage, setCaseStudyPage] = useState(1);

  const [remoteReviews, setRemoteReviews] = useState<Review[]>([]);
  const [remoteCaseStudies, setRemoteCaseStudies] = useState<CaseStudy[]>([]);

  const [selectedCaseStudy, setSelectedCaseStudy] = useState<CaseStudy | null>(
    null,
  );

  const [copied, setCopied] = useState(false);

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

  useEffect(() => {
    let cancelled = false;

    async function loadLiveContent() {
      const apiBaseUrl = getApiBaseUrl(import.meta.env.VITE_API_URL);

      try {
        const [testimonialResponse, caseStudyResponse] = await Promise.all([
          fetch(`${apiBaseUrl}/api/v1/testimonials?limit=100`),
          fetch(`${apiBaseUrl}/api/v1/case-studies?limit=100`),
        ]);

        const testimonialPayload = testimonialResponse.ok
          ? ((await testimonialResponse.json()) as ApiTestimonialsResponse)
          : null;

        const caseStudyPayload = caseStudyResponse.ok
          ? ((await caseStudyResponse.json()) as ApiCaseStudiesResponse)
          : null;

        if (cancelled) {
          return;
        }

        const liveReviews: Review[] =
          testimonialPayload?.data?.map((item) => ({
            id: `api-${item.id}`,
            name: item.name,
            role: item.role,
            company: item.company,
            location: item.location,
            source: item.source,
            category: item.category,
            tags: Array.isArray(item.tags) ? item.tags : [],
            rating: clampRating(item.rating),
            communications: item.communications,
            timelines: item.timelines,
            knowledge: item.knowledge,
            value: item.value,
            content: item.content,
            outcome: item.outcome,
            verified: item.verified,
          })) ?? [];

        const liveCaseStudies: CaseStudy[] =
          caseStudyPayload?.data?.map((item) => {
            const starterMatch = content.caseStudies.find(
              (starter) => starter.title === item.title,
            );

            return {
              id: `api-${item.id}`,
              company: item.company,
              location: item.location ?? starterMatch?.location ?? null,
              category: item.category ?? starterMatch?.category ?? null,
              tags:
                item.tags?.length > 0 ? item.tags : (starterMatch?.tags ?? []),
              title: item.title,
              summary: item.summary,
              challenge: starterMatch?.challenge ?? item.summary,
              solution: starterMatch?.solution ?? item.content,
              outcome: item.outcome,
              businessValue: starterMatch?.businessValue ?? item.outcome,
              content: item.content,
              keyResults:
                item.keyResults?.length > 0
                  ? item.keyResults
                  : (starterMatch?.keyResults ?? []),
              storyUrl: item.storyUrl ?? starterMatch?.storyUrl ?? null,
            };
          }) ?? [];

        setRemoteReviews(liveReviews);
        setRemoteCaseStudies(liveCaseStudies);
      } catch {
        // Starter content remains visible when the API is unavailable.
      }
    }

    void loadLiveContent();

    return () => {
      cancelled = true;
    };
  }, [content]);

  const reviews = useMemo(() => {
    if (remoteReviews.length > 0) {
      return remoteReviews;
    }

    return content.reviews;
  }, [content.reviews, remoteReviews]);

  const caseStudies = useMemo(() => {
    return dedupeById([...remoteCaseStudies, ...content.caseStudies]);
  }, [content.caseStudies, remoteCaseStudies]);

  const summary = useMemo(() => {
    const overallRating = average(
      reviews.map((review) => clampRating(review.rating)),
    );

    const categoryRatings = categoryLabels.map(({ key, label }) => ({
      key,
      label,
      rating: average(reviews.map((review) => getCategoryRating(review, key))),
    }));

    return {
      overallRating,
      reviewCount: reviews.length,
      categoryRatings,
    };
  }, [reviews]);

  const paginatedReviews = useMemo(() => {
    const start = (reviewPage - 1) * REVIEWS_PER_PAGE;

    return reviews.slice(start, start + REVIEWS_PER_PAGE);
  }, [reviewPage, reviews]);

  const paginatedCaseStudies = useMemo(() => {
    const start = (caseStudyPage - 1) * CASE_STUDIES_PER_PAGE;

    return caseStudies.slice(start, start + CASE_STUDIES_PER_PAGE);
  }, [caseStudyPage, caseStudies]);

  const totalReviewPages = Math.max(
    1,
    Math.ceil(reviews.length / REVIEWS_PER_PAGE),
  );

  const totalCaseStudyPages = Math.max(
    1,
    Math.ceil(caseStudies.length / CASE_STUDIES_PER_PAGE),
  );

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
  };

  const handleCaseStudyPageChange = (page: number) => {
    if (page < 1 || page > totalCaseStudyPages || page === caseStudyPage) {
      return;
    }

    setCaseStudyPage(page);

    trackAnalyticsEvent({
      name: ANALYTICS_EVENTS.CASE_STUDIES_PAGINATION_CLICKED,
      eventType: "click",
      path: window.location.pathname,
    });
  };

  const handleModeChange = (nextMode: "testimonials" | "case-studies") => {
    setMode(nextMode);

    if (nextMode === "testimonials") {
      setReviewPage(1);
    } else {
      setCaseStudyPage(1);

      trackAnalyticsEvent({
        name: ANALYTICS_EVENTS.CASE_STUDIES_VIEWED,
        eventType: "view",
        path: window.location.pathname,
      });
    }
  };

  const openCaseStudy = (caseStudy: CaseStudy) => {
    setSelectedCaseStudy(caseStudy);
    setCopied(false);

    trackAnalyticsEvent({
      name: ANALYTICS_EVENTS.CASE_STUDY_DETAILS_CLICKED,
      eventType: "click",
      path: window.location.pathname,
    });
  };

  const copyStoryLink = async () => {
    if (!selectedCaseStudy) {
      return;
    }

    const url = getStoryUrl(selectedCaseStudy);

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      <section
        ref={sectionRef}
        aria-labelledby="testimonials-heading"
        className="w-full bg-white px-4 py-4 -mt-23 sm:px-6 lg:px-8 border-t-0 lg:border-t-2 border-blue-700 pt-12"
      >
        <div className="mx-auto w-full max-w-7xl">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-1 rounded-full border-2 border-blue-700 bg-blue-100 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-black">
              {/* Open book icon */}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-4 w-4 shrink-0"
                aria-hidden="true"
              >
                <path d="M3 5.5A2.5 2.5 0 0 1 5.5 3H11v17H5.5A2.5 2.5 0 0 0 3 22V5.5Z" />
                <path d="M21 5.5A2.5 2.5 0 0 0 18.5 3H13v17h5.5A2.5 2.5 0 0 1 21 22V5.5Z" />
              </svg>

              {content.badge}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border-2 border-blue-700 bg-blue-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-black">
              {/* Blank star icon */}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-4 w-4 shrink-0"
                aria-hidden="true"
              >
                <path d="m12 3 2.78 5.63 6.22.9-4.5 4.38 1.06 6.19L12 17.18l-5.56 2.92 1.06-6.19L3 9.53l6.22-.9L12 3Z" />
              </svg>
              Customer Reviews
            </span>

            <span className="inline-flex items-center gap-2 rounded-full border-2 border-blue-700 bg-blue-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-black">
              {/* Blank chat icon */}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-4 w-4 shrink-0"
                aria-hidden="true"
              >
                <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H8l-4 2v-5.02A7.5 7.5 0 1 1 20 11.5Z" />
              </svg>
              What Others Are Saying
            </span>

            <h2
              id="testimonials-heading"
              className="mt-5 text-3xl font-bold tracking-tight text-black sm:text-4xl lg:text-5xl"
            >
              {content.heading}
            </h2>

            <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-black sm:text-base">
              {content.subtitle}
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-6xl rounded-3xl border-2 border-blue-700 bg-blue-100 p-5 sm:p-7">
            <div className="grid gap-8 md:grid-cols-[240px_1fr] md:items-center">
              <div className="text-center md:border-r-2 md:border-blue-700 md:pr-8">
                <p className="text-6xl font-bold leading-none text-black sm:text-7xl">
                  {summary.overallRating.toFixed(1)}
                </p>

                <p
                  className="mt-3 text-2xl tracking-[0.15em] text-blue-700"
                  aria-label={`${summary.overallRating.toFixed(
                    1,
                  )} out of 5 stars`}
                >
                  {stars(summary.overallRating)}
                </p>

                <p className="mt-3 text-sm font-bold uppercase tracking-wide text-black">
                  Overall Experience
                </p>

                <p className="mt-2 text-sm font-semibold text-black">
                  {summary.reviewCount} Review
                  {summary.reviewCount === 1 ? "" : "s"}
                </p>

                <p className="mt-1 text-sm font-semibold text-black">
                  {content.customerCount}
                </p>
              </div>

              <div className="space-y-5">
                {summary.categoryRatings.map((metric) => (
                  <div
                    key={metric.key}
                    className="grid grid-cols-[105px_1fr_42px] items-center gap-3 sm:grid-cols-[140px_1fr_48px]"
                  >
                    <span className="text-xs font-bold text-black sm:text-sm">
                      {metric.label}
                    </span>

                    <div
                      className="h-2.5 overflow-hidden rounded-full bg-white"
                      aria-hidden="true"
                    >
                      <div
                        className="h-full rounded-full bg-blue-700"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(0, (metric.rating / 5) * 100),
                          )}%`,
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

          <div
            className="mt-9 flex justify-center"
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
                  "rounded-lg px-6 py-3 text-sm font-bold transition",
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
                  "rounded-lg px-6 py-3 text-sm font-bold transition",
                  mode === "case-studies"
                    ? "bg-blue-700 text-white"
                    : "text-black hover:bg-blue-100",
                ].join(" ")}
              >
                Case Studies
              </button>
            </div>
          </div>

          {mode === "testimonials" && (
            <div className="mt-10">
              {paginatedReviews.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
                    {paginatedReviews.map((review) => {
                      const tags = [
                        ...(review.category ? [review.category] : []),
                        formatSource(review.source),
                        ...review.tags,
                      ].filter(
                        (value, index, array) =>
                          value && array.indexOf(value) === index,
                      );

                      return (
                        <article
                          key={review.id}
                          className="flex h-full min-h-80 flex-col rounded-2xl border-2 border-blue-700 bg-white p-5 shadow-sm"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-black text-sm font-bold text-white">
                              {getInitials(review.name)}
                            </div>

                            <div className="min-w-0">
                              <h3 className="text-base font-bold text-black">
                                {review.name}
                              </h3>

                              <p className="mt-1 text-xs font-medium text-black">
                                {[review.role, review.location]
                                  .filter(Boolean)
                                  .join(" · ") || "Customer"}
                              </p>
                            </div>

                            {review.verified && (
                              <span className="ml-auto shrink-0 rounded-full bg-blue-100 px-2 py-1 text-[10px] font-bold uppercase text-blue-700">
                                Verified
                              </span>
                            )}
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-blue-100 px-3 py-1 text-[10px] font-bold text-blue-700"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>

                          <div className="mt-4">
                            <p
                              className="text-lg tracking-[0.14em] text-blue-700"
                              aria-label={`${review.rating} out of 5 stars`}
                            >
                              {stars(review.rating)}
                            </p>

                            <blockquote className="mt-4 text-sm leading-7 text-black">
                              “{review.content}”
                            </blockquote>
                          </div>

                          <div className="mt-auto pt-5">
                            <div className="rounded-xl bg-blue-100 p-4">
                              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-700">
                                Result
                              </p>

                              <p className="mt-2 text-sm font-semibold leading-6 text-black">
                                {review.outcome ??
                                  "Positive experience shared."}
                              </p>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  <PaginationDots
                    page={reviewPage}
                    totalPages={totalReviewPages}
                    onChange={handleReviewPageChange}
                    label="Testimonials pagination"
                  />
                </>
              ) : (
                <div className="rounded-2xl border-2 border-blue-700 bg-white p-8 text-center">
                  <p className="text-sm font-bold text-black">
                    No approved testimonials yet.
                  </p>
                </div>
              )}
            </div>
          )}

          {mode === "case-studies" && (
            <div className="mt-10">
              {paginatedCaseStudies.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
                    {paginatedCaseStudies.map((caseStudy) => (
                      <article
                        key={caseStudy.id}
                        className="flex h-full min-h-97.5 flex-col rounded-2xl border-2 border-blue-700 bg-white p-5"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-black text-sm font-bold text-white">
                            {getInitials(caseStudy.company)}
                          </div>

                          <div className="min-w-0">
                            <p className="text-base font-bold text-black">
                              {caseStudy.company}
                            </p>

                            <p className="mt-1 text-xs font-medium text-black">
                              {caseStudy.location ?? "Remote"}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {[caseStudy.category, ...caseStudy.tags]
                            .filter(Boolean)
                            .filter(
                              (value, index, array) =>
                                array.indexOf(value) === index,
                            )
                            .slice(0, 3)
                            .map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-blue-100 px-3 py-1 text-[10px] font-bold text-blue-700"
                              >
                                {tag}
                              </span>
                            ))}
                        </div>

                        <h3 className="mt-5 text-xl font-bold leading-tight text-black">
                          {caseStudy.title}
                        </h3>

                        <p className="mt-3 text-sm leading-6 text-black">
                          {caseStudy.summary}
                        </p>

                        <div className="mt-5 rounded-xl bg-blue-100 p-4">
                          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-700">
                            Outcome
                          </p>

                          <p className="mt-2 text-sm font-bold leading-6 text-black">
                            {caseStudy.outcome}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => openCaseStudy(caseStudy)}
                          className="mt-auto w-full rounded-lg bg-blue-700 px-4 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-black"
                        >
                          Read Full Story
                        </button>
                      </article>
                    ))}
                  </div>

                  <PaginationDots
                    page={caseStudyPage}
                    totalPages={totalCaseStudyPages}
                    onChange={handleCaseStudyPageChange}
                    label="Case studies pagination"
                  />
                </>
              ) : (
                <div className="rounded-2xl border-2 border-blue-700 bg-white p-8 text-center">
                  <p className="text-sm font-bold text-black">
                    No published case studies yet.
                  </p>
                </div>
              )}
            </div>
          )}

          {content.starterContent && remoteReviews.length === 0 && (
            <p className="mt-7 text-center text-xs font-medium text-black">
              Starter content is shown until verified customer reviews replace
              the preview entries.
            </p>
          )}
        </div>
      </section>

      {selectedCaseStudy && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/80"
            aria-hidden="true"
            onClick={() => setSelectedCaseStudy(null)}
          />

          <dialog
            open
            aria-modal="true"
            aria-labelledby="case-study-dialog-heading"
            className="fixed inset-0 z-50 m-auto max-h-[92vh] w-[94vw] max-w-4xl overflow-y-auto rounded-2xl border-2 border-blue-700 bg-white p-0 text-black shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b-2 border-blue-700 bg-white px-5 py-4 sm:px-7">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">
                  Customer Case Study
                </p>

                <h2
                  id="case-study-dialog-heading"
                  className="mt-1 text-xl font-bold sm:text-2xl"
                >
                  {selectedCaseStudy.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCaseStudy(null)}
                aria-label="Close case study"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-2xl font-bold text-blue-700 hover:bg-blue-100"
              >
                ×
              </button>
            </div>

            <div className="p-5 sm:p-7">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-black text-sm font-bold text-white">
                  {getInitials(selectedCaseStudy.company)}
                </div>

                <div>
                  <p className="font-bold">{selectedCaseStudy.company}</p>

                  <p className="text-sm">
                    {selectedCaseStudy.location ?? "Remote"}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {[selectedCaseStudy.category, ...selectedCaseStudy.tags]
                  .filter(Boolean)
                  .filter(
                    (value, index, array) => array.indexOf(value) === index,
                  )
                  .map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700"
                    >
                      {tag}
                    </span>
                  ))}
              </div>

              <div className="mt-8 grid gap-6 md:grid-cols-2">
                <section>
                  <h3 className="text-lg font-bold">The Challenge</h3>

                  <p className="mt-3 text-sm leading-7">
                    {selectedCaseStudy.challenge ?? selectedCaseStudy.summary}
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-bold">Our Solution</h3>

                  <p className="mt-3 text-sm leading-7">
                    {selectedCaseStudy.solution ?? selectedCaseStudy.content}
                  </p>
                </section>
              </div>

              <section className="mt-8">
                <h3 className="text-lg font-bold">Key Results</h3>

                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  {(selectedCaseStudy.keyResults.length > 0
                    ? selectedCaseStudy.keyResults
                    : [
                        {
                          stat: "1",
                          label: "Structured delivery path",
                        },
                        {
                          stat: "1",
                          label: "Clear business outcome",
                        },
                        {
                          stat: "1",
                          label: "Defined next step",
                        },
                      ]
                  )
                    .slice(0, 3)
                    .map((result) => (
                      <div
                        key={`${result.stat}-${result.label}`}
                        className="rounded-xl border-2 border-blue-700 bg-blue-100 p-5"
                      >
                        <p className="text-3xl font-bold text-black">
                          {result.stat}
                        </p>

                        <p className="mt-2 text-sm font-bold leading-5">
                          {result.label}
                        </p>
                      </div>
                    ))}
                </div>
              </section>

              <section className="mt-8">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">
                  Share This Story
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                      getStoryUrl(selectedCaseStudy),
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-10 min-w-10 items-center justify-center rounded-lg border-2 border-blue-700 bg-white px-3 text-sm font-bold text-black hover:bg-blue-100"
                  >
                    in
                  </a>

                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                      getStoryUrl(selectedCaseStudy),
                    )}&text=${encodeURIComponent(selectedCaseStudy.title)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-10 min-w-10 items-center justify-center rounded-lg border-2 border-blue-700 bg-white px-3 text-sm font-bold text-black hover:bg-blue-100"
                  >
                    X
                  </a>

                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                      getStoryUrl(selectedCaseStudy),
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-10 min-w-10 items-center justify-center rounded-lg border-2 border-blue-700 bg-white px-3 text-sm font-bold text-black hover:bg-blue-100"
                  >
                    f
                  </a>

                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `${selectedCaseStudy.title} ${getStoryUrl(
                        selectedCaseStudy,
                      )}`,
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-10 items-center justify-center rounded-lg border-2 border-blue-700 bg-white px-3 text-sm font-bold text-black hover:bg-blue-100"
                  >
                    WA
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      void copyStoryLink();
                    }}
                    className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-700 px-4 text-sm font-bold text-white hover:bg-black"
                  >
                    {copied ? "Copied" : "Copy Link"}
                  </button>
                </div>
              </section>
            </div>

            <div className="flex flex-col gap-3 border-t-2 border-blue-700 bg-blue-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-7">
              <Link
                to="/coffee-with-me"
                onClick={() => setSelectedCaseStudy(null)}
                className="inline-flex items-center justify-center rounded-lg bg-blue-700 px-5 py-3 text-sm font-bold text-white hover:bg-black"
              >
                Start Your Journey →
              </Link>

              <button
                type="button"
                onClick={() => setSelectedCaseStudy(null)}
                className="inline-flex items-center justify-center rounded-lg border-2 border-blue-700 bg-white px-5 py-3 text-sm font-bold text-black hover:bg-blue-100"
              >
                Close
              </button>
            </div>
          </dialog>
        </>
      )}
    </>
  );
}
