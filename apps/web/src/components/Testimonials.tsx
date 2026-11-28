import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { ANALYTICS_EVENTS, trackAnalyticsEvent } from "../analytics";
import { getApiBaseUrl } from "../api-url";
import bundledStarterContent from "../content/testimonials.json";

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

const DEFAULT_REVIEW_LABELS = [
  "Service Experience",
  "Clear Communication",
  "Outcome Focus",
];

const DEFAULT_CASE_STUDY_LABELS = [
  "Problem Solving",
  "Service Delivery",
  "Outcome Focus",
];

/*
 * These are the three approved quantified results for each service.
 *
 * They match GiveFeedback.tsx exactly.
 *
 * Do not replace these with generic outcomes or the first API key result.
 */
const SERVICE_RESULTS: Record<string, KeyResult[]> = {
  "Deliver My Project": [
    {
      stat: "30%",
      label: "Faster Delivery Planning",
    },
  ],

  "Mentor Me": [
    {
      stat: "25%",
      label: "Faster Problem Resolution",
    },
  ],
  "Coffee With Me": [
    {
      stat: "2–3",
      label: "Decisions Clarified",
    },
  ],
};

function clampRating(value: number | null | undefined): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0;
  }

  return Math.min(5, Math.max(0, value));
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

function getCompanyShortName(value: string): string {
  const words = value.replaceAll("&", " ").trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return "CC";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return words
    .slice(0, 3)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function getServiceLabel(
  source: string | null,
  category: string | null,
): string {
  switch (source) {
    case "client-work":
      return "Deliver My Project";

    case "coffee-chat":
      return "Coffee With Me";

    case "mentorship":
      return "Mentor Me";

    default:
      if (
        category === "Deliver My Project" ||
        category === "Coffee With Me" ||
        category === "Mentor Me"
      ) {
        return category;
      }

      return category ?? "Cup&Commit Service";
  }
}

function getJourneyPath(
  source: string | null,
  category: string | null,
): string {
  switch (getServiceLabel(source, category)) {
    case "Deliver My Project":
      return "/deliver-my-project";

    case "Mentor Me":
      return "/mentor-me";

    case "Coffee With Me":
      return "/coffee-with-me";

    default:
      return "/coffee-with-me";
  }
}

function uniqueLabels(values: string[]): string[] {
  return values
    .map((value) => value?.trim())
    .filter(Boolean)
    .filter((value, index, array) => array.indexOf(value) === index)
    .slice(0, 3);
}

function getExactlyThreeLabels(
  tags: string[],
  defaults: string[] = DEFAULT_REVIEW_LABELS,
): string[] {
  const labels = uniqueLabels(tags);

  return Array.from({ length: 3 }, (_, index) => {
    return labels[index] ?? defaults[index];
  });
}

function truncateText(value: string, maxLength: number): string {
  const normalized = value.trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}

/*
 * Resolve the service-specific result set.
 *
 * The UI always displays the three approved results for the service.
 * Existing API keyResults are only used when they already contain all
 * three valid results. Otherwise the approved service result set is used.
 */
function getCaseStudyResults(caseStudy: CaseStudy): KeyResult[] {
  const service = getServiceLabel(null, caseStudy.category);

  const configuredResults = caseStudy.keyResults
    .filter((result) => result.stat?.trim() && result.label?.trim())
    .slice(0, 3);

  const approvedResults = SERVICE_RESULTS[service];

  if (configuredResults.length === 3) {
    return configuredResults;
  }

  return approvedResults ?? configuredResults;
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
    return null;
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

function ResultList({ results }: { readonly results: KeyResult[] }) {
  return (
    <div className="mt-4 grid gap-3">
      {results.map((result) => (
        <div
          key={`${result.stat}-${result.label}`}
          className="rounded-xl bg-blue-100 p-4"
        >
          <p className="text-2xl font-bold leading-7 text-black">
            {result.stat}
          </p>

          <p className="mt-1 text-xs font-bold uppercase tracking-wide text-blue-700">
            {result.label}
          </p>
        </div>
      ))}
    </div>
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
        // Keep the component usable when the API is unavailable.
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

    return content.reviews.slice(0, 1).map((review) => ({
      ...review,
      starterContent: true,
    }));
  }, [content.reviews, remoteReviews]);

  const caseStudies = useMemo(() => {
    return dedupeById([...remoteCaseStudies, ...content.caseStudies]);
  }, [content.caseStudies, remoteCaseStudies]);

  const reviewSummary = useMemo(() => {
    if (reviews.length === 0) {
      return {
        averageRating: 0,
        reviewCount: 0,
      };
    }

    const totalRating = reviews.reduce(
      (total, review) => total + clampRating(review.rating),
      0,
    );

    return {
      averageRating: totalRating / reviews.length,
      reviewCount: reviews.length,
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
      return;
    }

    setCaseStudyPage(1);

    trackAnalyticsEvent({
      name: ANALYTICS_EVENTS.CASE_STUDIES_VIEWED,
      eventType: "view",
      path: window.location.pathname,
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

  const closeReview = () => {
    setSelectedReview(null);
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
        className="w-full border-t-0 border-blue-700 bg-white px-4 -mt-23 pt-12 sm:px-6 lg:border-t-2 lg:px-8"
      >
        <div className="mx-auto w-full max-w-7xl">
          <div className="mx-auto max-w-4xl text-center">
            <div className="flex flex-wrap justify-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border-2 border-blue-700 bg-blue-100 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-black">
                Success Stories
              </span>

              <span className="inline-flex items-center gap-2 rounded-full border-2 border-blue-700 bg-blue-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-black">
                Open Feedback
              </span>
            </div>

            <h2
              id="testimonials-heading"
              className="mt-5 text-3xl font-bold tracking-tight text-black sm:text-4xl lg:text-5xl"
            >
              {content.heading}
            </h2>

            <p className="mx-auto mt-4 max-w-3xl text-sm font-bold leading-7 text-black sm:text-base">
              {content.subtitle}
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-6xl rounded-3xl border-2 border-blue-700 bg-blue-100 p-6 sm:p-8">
            <div className="text-center">
              <p className="text-6xl font-bold leading-none text-black sm:text-7xl">
                {reviewSummary.averageRating.toFixed(1)}
              </p>

              <p
                className="mt-3 text-2xl tracking-[0.15em] text-blue-700"
                aria-label={`${reviewSummary.averageRating.toFixed(
                  1,
                )} out of 5 stars`}
              >
                {stars(reviewSummary.averageRating)}
              </p>

              <p className="mt-3 text-sm font-bold uppercase tracking-wide text-black">
                Ownership & Trust Rating
              </p>

              <p className="mt-2 text-sm font-semibold text-black">
                {reviewSummary.reviewCount} Review
                {reviewSummary.reviewCount === 1 ? "" : "s"}
              </p>
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
                      const labels = getExactlyThreeLabels(review.tags);

                      const normalizedReview = review.content.trim();
                      const hasLongReview = normalizedReview.length > 100;
                      const cardReview = truncateText(normalizedReview, 100);

                      return (
                        <article
                          key={review.id}
                          className="flex h-full min-h-107.5 flex-col rounded-2xl border-2 border-blue-700 bg-white p-5 shadow-sm"
                        >
                          {review.starterContent && (
                            <div className="mb-4 rounded-lg border border-dashed border-blue-700 bg-blue-50 px-3 py-2">
                              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-700">
                                Demo Sample
                              </p>

                              <p className="mt-1 text-xs leading-5 text-black">
                                Sample content for layout demonstration — not
                                verified customer evidence.
                              </p>
                            </div>
                          )}

                          <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-black text-sm font-bold text-white">
                              {getInitials(review.name)}
                            </div>

                            <div className="min-w-0">
                              <h3 className="text-base font-bold text-black">
                                {review.name}
                              </h3>

                              {(review.role ||
                                review.company ||
                                review.location) && (
                                <p className="mt-1 text-xs leading-5 text-black">
                                  {[
                                    review.role,
                                    review.company,
                                    review.location,
                                  ]
                                    .filter(Boolean)
                                    .join(" · ")}
                                </p>
                              )}
                            </div>

                            {review.verified && (
                              <span className="ml-auto shrink-0 rounded-full bg-blue-100 px-2 py-1 text-[10px] font-bold uppercase text-blue-700">
                                Verified
                              </span>
                            )}
                          </div>

                          <div className="mt-3 flex min-h-7 flex-wrap gap-2">
                            {labels.map((label) => (
                              <span
                                key={label}
                                className="rounded-full bg-blue-100 px-3 py-1 text-[10px] font-bold text-blue-700"
                              >
                                {label}
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
                          </div>

                          <div className="mt-4">
                            <blockquote className="min-h-21 overflow-hidden text-sm leading-7 text-black">
                              “{cardReview}”
                            </blockquote>

                            {hasLongReview && (
                              <button
                                type="button"
                                onClick={() => openReview(review)}
                                className="mt-2 text-sm font-bold text-blue-700 underline underline-offset-4 hover:text-black"
                              >
                                Read Full Review
                              </button>
                            )}
                          </div>

                          <div className="mt-auto pt-5">
                            <div className="rounded-xl bg-blue-100 p-4">
                              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-700">
                                Result
                              </p>

                              <p className="mt-2 text-sm font-bold leading-7 text-black">
                                {review.outcome?.trim() || "Result pending"}
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

                  <p className="mt-2 text-sm text-black">
                    Approved reviews will appear here after they are published.
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
                    {paginatedCaseStudies.map((caseStudy) => {
                      const labels = getExactlyThreeLabels(
                        caseStudy.tags,
                        DEFAULT_CASE_STUDY_LABELS,
                      );
                      const results = getCaseStudyResults(caseStudy);
                      const subtitle = truncateText(caseStudy.summary, 50);
                      const companyShortName = getCompanyShortName(
                        caseStudy.company,
                      );

                      return (
                        <article
                          key={caseStudy.id}
                          className="flex h-full min-h-107.5 flex-col rounded-2xl border-2 border-blue-700 bg-white p-5"
                        >
                          {/* EXACT company + short-name treatment */}
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-black text-sm font-bold text-white"
                              title={`${caseStudy.company} short name`}
                              aria-label={`${caseStudy.company} short name ${companyShortName}`}
                            >
                              {companyShortName}
                            </div>

                            <p className="min-w-0 truncate text-base font-bold text-black">
                              {caseStudy.company}
                            </p>
                          </div>

                          <div className="mt-4 flex min-h-7 flex-wrap gap-2">
                            {labels.map((label) => (
                              <span
                                key={label}
                                className="rounded-full bg-blue-100 px-3 py-1 text-[10px] font-bold text-blue-700"
                              >
                                {label}
                              </span>
                            ))}
                          </div>

                          <h3 className="mt-5 line-clamp-1 text-xl font-bold leading-tight text-black">
                            {caseStudy.title}
                          </h3>

                          <p
                            className="mt-3 line-clamp-2 min-h-12 text-sm leading-6 text-black"
                            title={caseStudy.summary}
                          >
                            {subtitle}
                          </p>

                          {/* ALL THREE required quantified results */}
                          <div className="mt-auto pt-5">
                            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-700">
                              Results
                            </p>

                            <ResultList results={results} />

                            <button
                              type="button"
                              onClick={() => openCaseStudy(caseStudy)}
                              className="mt-4 w-full rounded-lg bg-blue-700 px-4 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-black"
                            >
                              Read Full Story
                            </button>
                          </div>
                        </article>
                      );
                    })}
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
        </div>
      </section>

      {selectedReview && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/80"
            aria-hidden="true"
            onClick={closeReview}
          />

          <dialog
            open
            aria-modal="true"
            aria-labelledby="review-dialog-heading"
            className="fixed inset-0 z-50 m-auto max-h-[92vh] w-[94vw] max-w-2xl overflow-y-auto rounded-2xl border-2 border-blue-700 bg-white p-0 text-black shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b-2 border-blue-700 bg-white px-5 py-4 sm:px-7">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">
                  Full Review
                </p>

                <h2
                  id="review-dialog-heading"
                  className="mt-1 text-xl font-bold sm:text-2xl"
                >
                  {selectedReview.name}
                </h2>

                {(selectedReview.role ||
                  selectedReview.company ||
                  selectedReview.location) && (
                  <p className="mt-1 text-xs text-black">
                    {[
                      selectedReview.role,
                      selectedReview.company,
                      selectedReview.location,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={closeReview}
                aria-label="Close full review"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-2xl font-bold text-blue-700 hover:bg-blue-100"
              >
                ×
              </button>
            </div>

            <div className="p-5 sm:p-7">
              {selectedReview.starterContent && (
                <div className="mb-5 rounded-lg border border-dashed border-blue-700 bg-blue-50 px-3 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-700">
                    Demo Sample
                  </p>

                  <p className="mt-1 text-xs leading-5 text-black">
                    Sample content for layout demonstration — not verified
                    customer evidence.
                  </p>
                </div>
              )}

              <span className="inline-flex rounded-full border-2 border-blue-700 bg-blue-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                {getServiceLabel(
                  selectedReview.source,
                  selectedReview.category,
                )}
              </span>

              <div className="mt-4 flex flex-wrap gap-2">
                {getExactlyThreeLabels(selectedReview.tags).map((label) => (
                  <span
                    key={label}
                    className="rounded-full bg-blue-100 px-3 py-1 text-[10px] font-bold text-blue-700"
                  >
                    {label}
                  </span>
                ))}
              </div>

              <p
                className="mt-5 text-2xl tracking-[0.14em] text-blue-700"
                aria-label={`${selectedReview.rating} out of 5 stars`}
              >
                {stars(selectedReview.rating)}
              </p>

              <blockquote className="mt-5 text-base leading-8 text-black">
                “{selectedReview.content}”
              </blockquote>

              {selectedReview.outcome && (
                <div className="mt-7 rounded-xl bg-blue-100 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-700">
                    Result
                  </p>

                  <p className="mt-2 text-2xl font-bold leading-7 text-black">
                    {selectedReview.outcome}
                  </p>
                </div>
              )}
            </div>
          </dialog>
        </>
      )}

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
                  Customer Story
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
              {/* EXACT same company + short-name design as card */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border-2 border-blue-700 bg-blue-100 text-xs font-black text-blue-700">
                    {getCompanyShortName(selectedCaseStudy.company)}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-base font-bold text-black">
                      {selectedCaseStudy.company}
                    </p>

                    {selectedCaseStudy.location && (
                      <p className="mt-1 truncate text-xs text-black">
                        {selectedCaseStudy.location}
                      </p>
                    )}
                  </div>
                </div>

                <span className="inline-flex shrink-0 rounded-full border-2 border-blue-700 bg-blue-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                  {getServiceLabel(null, selectedCaseStudy.category)}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {getExactlyThreeLabels(
                  selectedCaseStudy.tags,
                  DEFAULT_CASE_STUDY_LABELS,
                ).map((label) => (
                  <span
                    key={label}
                    className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700"
                  >
                    {label}
                  </span>
                ))}
              </div>

              <h3 className="mt-7 text-2xl font-bold">
                {selectedCaseStudy.title}
              </h3>

              <div className="mt-8 space-y-8">
                <section>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">
                    The Problem
                  </p>

                  <h3 className="mt-2 text-lg font-bold">
                    What the target audience was facing
                  </h3>

                  <p className="mt-3 text-sm leading-7">
                    {selectedCaseStudy.challenge ?? selectedCaseStudy.summary}
                  </p>
                </section>

                <section>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">
                    The Service
                  </p>

                  <h3 className="mt-2 text-lg font-bold">
                    How Cup&Commit provided the service
                  </h3>

                  <p className="mt-3 text-sm leading-7">
                    {selectedCaseStudy.solution ??
                      selectedCaseStudy.content ??
                      selectedCaseStudy.summary}
                  </p>
                </section>

                <section>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">
                    How It Was Resolved
                  </p>

                  <h3 className="mt-2 text-lg font-bold">
                    How the issue was addressed
                  </h3>

                  <p className="mt-3 text-sm leading-7">
                    {selectedCaseStudy.businessValue ??
                      selectedCaseStudy.outcome}
                  </p>
                </section>
              </div>

              {/* ALL THREE REQUIRED RESULTS IN MODAL */}
              <section className="mt-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">
                  Results
                </p>

                <ResultList results={getCaseStudyResults(selectedCaseStudy)} />
              </section>
            </div>

            {/* Only Start Your Journey */}
            <div className="border-t-2 border-blue-700 bg-blue-100 px-5 py-4 sm:px-7">
              <Link
                to={getJourneyPath(null, selectedCaseStudy.category)}
                onClick={() => setSelectedCaseStudy(null)}
                className="inline-flex w-full items-center justify-center rounded-lg bg-blue-700 px-5 py-3 text-sm font-bold text-white hover:bg-black"
              >
                Start Your Journey →
              </Link>
            </div>
          </dialog>
        </>
      )}
    </>
  );
}
