import { useEffect, useRef, useState } from "react";
import { ANALYTICS_EVENTS, trackAnalyticsEvent } from "../analytics";

type Testimonial = {
  id: string; name: string; role: string | null; company: string | null;
  avatar: string | null; category: string | null; content: string; rating: number;
  helpfulCount: number; storyUrl: string | null; verified: boolean; published: boolean; createdAt: string;
};
type TestimonialsResponse = {
  data: Testimonial[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  summary: { averageRating: number; reviewCount: number };
};
type CaseStudy = {
  id: string; company: string; location: string | null; category: string | null;
  title: string; summary: string; outcome: string; content: string; image: string | null;
  storyUrl: string | null; published: boolean; createdAt: string;
};
type CaseStudiesResponse = {
  data: CaseStudy[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:3000";
const PAGE_SIZE = 4;
const MAX_CONTENT_LENGTH = 150;

function getInitials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("");
}
function truncateContent(content: string) {
  const value = content.trim();
  return value.length <= MAX_CONTENT_LENGTH ? value : `${value.slice(0, MAX_CONTENT_LENGTH).trimEnd()}...`;
}
function stars(rating: number) {
  return Array.from({ length: 5 }, (_, index) => index < rating ? "★" : "☆").join("");
}

export default function Testimonials() {
  const [mode, setMode] = useState<"testimonials" | "case-studies">("testimonials");
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [testimonialPage, setTestimonialPage] = useState(1);
  const [caseStudyPage, setCaseStudyPage] = useState(1);
  const [testimonialPagination, setTestimonialPagination] = useState({ total: 0, totalPages: 0 });
  const [caseStudyPagination, setCaseStudyPagination] = useState({ total: 0, totalPages: 0 });
  const [summary, setSummary] = useState({ averageRating: 0, reviewCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [helpfulLoading, setHelpfulLoading] = useState<string | null>(null);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<CaseStudy | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const viewedRef = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        setIsLoading(true); setError(null);
        const endpoint = mode === "testimonials"
          ? `${API_BASE_URL}/api/v1/testimonials?page=${testimonialPage}&limit=${PAGE_SIZE}`
          : `${API_BASE_URL}/api/v1/case-studies?page=${caseStudyPage}&limit=${PAGE_SIZE}`;
        const response = await fetch(endpoint, { signal: controller.signal });
        if (!response.ok) throw new Error("Request failed.");
        if (mode === "testimonials") {
          const result: TestimonialsResponse = await response.json();
          setTestimonials(result.data); setTestimonialPagination(result.pagination);
          setSummary(result.summary);
        } else {
          const result: CaseStudiesResponse = await response.json();
          setCaseStudies(result.data); setCaseStudyPagination(result.pagination);
        }
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === "AbortError") return;
        setError(mode === "testimonials" ? "Testimonials are temporarily unavailable." : "Case studies are temporarily unavailable.");
      } finally { setIsLoading(false); }
    }
    void load();
    return () => controller.abort();
  }, [mode, testimonialPage, caseStudyPage]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || viewedRef.current) return;
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting || viewedRef.current) return;
      viewedRef.current = true;
      trackAnalyticsEvent({ name: ANALYTICS_EVENTS.TESTIMONIALS_VIEWED, eventType: "view", path: window.location.pathname });
      observer.disconnect();
    }, { threshold: 0.5 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const changeMode = (nextMode: "testimonials" | "case-studies") => {
    setMode(nextMode); setError(null);
    if (nextMode === "case-studies") {
      trackAnalyticsEvent({ name: ANALYTICS_EVENTS.CASE_STUDIES_VIEWED, eventType: "view", path: window.location.pathname });
    }
  };

  const markHelpful = async (id: string) => {
    if (helpfulLoading === id) return;
    try {
      setHelpfulLoading(id);
      const response = await fetch(`${API_BASE_URL}/api/v1/testimonials/${id}/helpful`, { method: "POST" });
      if (!response.ok) throw new Error("Unable to save.");
      const result: { data: { testimonialId: string; helpfulCount: number } } = await response.json();
      setTestimonials((items) => items.map((item) => item.id === id ? { ...item, helpfulCount: result.data.helpfulCount } : item));
      trackAnalyticsEvent({ name: ANALYTICS_EVENTS.TESTIMONIAL_HELPFUL_CLICKED, eventType: "click", path: window.location.pathname });
    } catch { /* best effort */ } finally { setHelpfulLoading(null); }
  };

  const paginate = (direction: "previous" | "next") => {
    if (mode === "testimonials") {
      setTestimonialPage((current) => direction === "next"
        ? Math.min(testimonialPagination.totalPages, current + 1)
        : Math.max(1, current - 1));
      trackAnalyticsEvent({ name: ANALYTICS_EVENTS.TESTIMONIALS_PAGINATION_CLICKED, eventType: "click", path: window.location.pathname });
    } else {
      setCaseStudyPage((current) => direction === "next"
        ? Math.min(caseStudyPagination.totalPages, current + 1)
        : Math.max(1, current - 1));
      trackAnalyticsEvent({ name: ANALYTICS_EVENTS.CASE_STUDIES_PAGINATION_CLICKED, eventType: "click", path: window.location.pathname });
    }
  };

  const totalPages = mode === "testimonials" ? testimonialPagination.totalPages : caseStudyPagination.totalPages;
  const currentPage = mode === "testimonials" ? testimonialPage : caseStudyPage;

  return (
    <section ref={sectionRef} aria-labelledby="testimonials-heading" className="relative z-40 -mt-4 w-full bg-[#EAF0F6] px-4 pb-8 pt-4 sm:px-6 lg:-mt-28 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <h2 id="testimonials-heading" className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">What Our Community Says</h2>
          <p className="mt-1 text-sm leading-5 text-gray-600">Feedback and delivery evidence from practical Technology Ownership work.</p>
        </div>

        <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <div className="rounded-xl bg-white px-5 py-3 text-center shadow-sm">
            <div className="text-lg font-bold text-gray-900">★ {summary.averageRating.toFixed(1)}</div>
            <div className="text-xs text-gray-500">{summary.reviewCount} Reviews</div>
          </div>
          <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm" role="tablist" aria-label="Testimonials and case studies">
            <button type="button" role="tab" aria-selected={mode === "testimonials"} onClick={() => changeMode("testimonials")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${mode === "testimonials" ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-50"}`}>
              Testimonials
            </button>
            <button type="button" role="tab" aria-selected={mode === "case-studies"} onClick={() => changeMode("case-studies")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${mode === "case-studies" ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-50"}`}>
              Case Studies
            </button>
          </div>
        </div>

        {isLoading && <div role="status" className="mt-4 text-center text-sm text-gray-600">Loading {mode === "testimonials" ? "testimonials" : "case studies"}...</div>}
        {!isLoading && error && <div role="alert" className="mx-auto mt-4 max-w-xl rounded-xl border border-gray-200 bg-white p-4 text-center text-sm text-gray-600">{error}</div>}

        {!isLoading && !error && mode === "testimonials" && testimonials.length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {testimonials.map((testimonial) => (
              <article key={testimonial.id} className="flex min-h-[270px] h-full flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  {testimonial.avatar ? <img src={testimonial.avatar} alt={`${testimonial.name} avatar`} className="h-10 w-10 shrink-0 rounded-full object-cover" /> :
                    <div aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">{getInitials(testimonial.name)}</div>}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <p className="truncate text-sm font-bold text-gray-900">{testimonial.name}</p>
                      {testimonial.verified && <span aria-label="Verified testimonial" className="text-xs font-bold text-blue-600">✓</span>}
                    </div>
                    <p className="truncate text-xs text-gray-500">{[testimonial.role, testimonial.company].filter(Boolean).join(" · ")}</p>
                  </div>
                </div>
                {testimonial.category && <span className="mt-3 w-fit rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700">{testimonial.category}</span>}
                <div aria-label={`${testimonial.rating} out of 5 stars`} className="mt-3 text-sm tracking-wide text-amber-500">{stars(testimonial.rating)}</div>
                <blockquote className="mt-2 flex-1 text-sm leading-5 text-gray-700">"{truncateContent(testimonial.content)}"</blockquote>
                <footer className="mt-3 border-t border-gray-100 pt-3">
                  <div className="flex items-center justify-between gap-2">
                    <button type="button" onClick={() => void markHelpful(testimonial.id)} disabled={helpfulLoading === testimonial.id} className="text-xs font-medium text-gray-500 hover:text-blue-700 disabled:opacity-60">
                      {helpfulLoading === testimonial.id ? "Saving..." : `♡ Helpful (${testimonial.helpfulCount})`}
                    </button>
                    <button type="button" onClick={() => { setSelectedTestimonial(testimonial); trackAnalyticsEvent({ name: ANALYTICS_EVENTS.TESTIMONIAL_STORY_CLICKED, eventType: "click", path: window.location.pathname }); }}
                      className="text-xs font-semibold text-blue-700 hover:text-blue-900">Read Full Story →</button>
                  </div>
                </footer>
              </article>
            ))}
          </div>
        )}

        {!isLoading && !error && mode === "case-studies" && caseStudies.length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {caseStudies.map((study) => (
              <article key={study.id} className="flex min-h-[270px] h-full flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold text-gray-500">{study.company}{study.location ? ` · ${study.location}` : ""}</p>
                    <h3 className="mt-2 text-base font-bold text-gray-900">{study.title}</h3>
                  </div>
                  {study.category && <span className="shrink-0 rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700">{study.category}</span>}
                </div>
                <p className="mt-3 flex-1 text-sm leading-5 text-gray-700">{study.summary}</p>
                <div className="mt-3 rounded-lg bg-gray-50 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">Outcome</p>
                  <p className="mt-1 text-xs leading-5 text-gray-700">{study.outcome}</p>
                </div>
                <button type="button" onClick={() => { setSelectedCaseStudy(study); trackAnalyticsEvent({ name: ANALYTICS_EVENTS.CASE_STUDY_DETAILS_CLICKED, eventType: "click", path: window.location.pathname }); }}
                  className="mt-3 text-left text-xs font-semibold text-blue-700 hover:text-blue-900">Read Full Story →</button>
              </article>
            ))}
          </div>
        )}

        {!isLoading && !error && ((mode === "testimonials" && testimonials.length === 0) || (mode === "case-studies" && caseStudies.length === 0)) &&
          <div className="mx-auto mt-4 max-w-xl rounded-xl border border-gray-200 bg-white p-4 text-center text-sm text-gray-600">No {mode === "testimonials" ? "testimonials" : "case studies"} are currently available.</div>}

        {!isLoading && !error && totalPages > 1 && (
          <nav aria-label={`${mode} pagination`} className="mt-4 flex items-center justify-center gap-3">
            <button type="button" onClick={() => paginate("previous")} disabled={currentPage === 1} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 disabled:opacity-50">Previous</button>
            <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
            <button type="button" onClick={() => paginate("next")} disabled={currentPage === totalPages} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 disabled:opacity-50">Next</button>
          </nav>
        )}
      </div>

      {selectedTestimonial && (
        <dialog open aria-labelledby="testimonial-detail-heading" className="fixed inset-0 z-50 m-auto max-h-[85vh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div><p className="text-xs font-semibold text-gray-500">{[selectedTestimonial.role, selectedTestimonial.company].filter(Boolean).join(" · ")}</p><h3 id="testimonial-detail-heading" className="mt-1 text-xl font-bold text-gray-900">{selectedTestimonial.name}</h3></div>
            <button type="button" onClick={() => setSelectedTestimonial(null)} aria-label="Close testimonial details" className="text-2xl text-gray-500">×</button>
          </div>
          <div className="mt-4 text-amber-500">{stars(selectedTestimonial.rating)}</div>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-gray-700">"{selectedTestimonial.content}"</p>
          {selectedTestimonial.storyUrl && <a href={selectedTestimonial.storyUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-block text-sm font-semibold text-blue-700">Open external story →</a>}
        </dialog>
      )}

      {selectedCaseStudy && (
        <dialog open aria-labelledby="case-study-detail-heading" className="fixed inset-0 z-50 m-auto max-h-[85vh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div><p className="text-xs font-semibold text-gray-500">{selectedCaseStudy.company}{selectedCaseStudy.location ? ` · ${selectedCaseStudy.location}` : ""}</p><h3 id="case-study-detail-heading" className="mt-1 text-xl font-bold text-gray-900">{selectedCaseStudy.title}</h3></div>
            <button type="button" onClick={() => setSelectedCaseStudy(null)} aria-label="Close case study details" className="text-2xl text-gray-500">×</button>
          </div>
          <p className="mt-4 text-sm leading-6 text-gray-700">{selectedCaseStudy.content}</p>
          <div className="mt-5 rounded-xl bg-gray-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-gray-500">Outcome / Result</p><p className="mt-1 text-sm leading-6 text-gray-700">{selectedCaseStudy.outcome}</p></div>
          {selectedCaseStudy.storyUrl && <a href={selectedCaseStudy.storyUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-block text-sm font-semibold text-blue-700">Open external story →</a>}
        </dialog>
      )}
    </section>
  );
}
