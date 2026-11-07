import { getApiBaseUrl } from "./api-url";

const apiBaseUrl = getApiBaseUrl(import.meta.env.VITE_API_URL);

type AnalyticsEventType = "view" | "click";

/**
 * The analytics events the API accepts. Keeping the names typed makes it
 * impossible to emit an event that the server would reject.
 */
export type AnalyticsEventName =
  | "hero.viewed"
  | "hero.right.viewed"
  | "page.viewed"
  | "navbar.home.clicked"
  | "work.with.me.clicked"
  | "deliver.my.project.clicked"
  | "deliver.my.project.viewed"
  | "deliver.my.project.completed"
  | "mentor.me.clicked"
  | "mentor.me.viewed"
  | "mentor.me.submitted"
  | "mentor.me.completed"
  | "coffee.with.me.clicked"
  | "coffee.with.me.viewed"
  | "coffee.with.me.submitted"
  | "coffee.with.me.completed"
  | "ownership.audit.clicked"
  | "ownership.audit.viewed"
  | "ownership.audit.started"
  | "ownership.audit.completed"
  | "ownership.toolkit.clicked"
  | "ownership.toolkit.viewed"
  | "ownership.toolkit.completed"
  | "ownership.toolkit.downloaded"
  | "ownership.learning.circle.clicked"
  | "circle.view"
  | "circle.join.click"
  | "circle.telegram.redirect"
  | "testimonials.viewed"
  | "testimonials.pagination.clicked"
  | "testimonial.helpful.clicked"
  | "testimonial.story.clicked"
  | "case.studies.viewed"
  | "case.studies.pagination.clicked"
  | "case.study.details.clicked";

export const ANALYTICS_EVENTS = {
  WORK_WITH_ME_CLICKED: "work.with.me.clicked",

  DELIVER_MY_PROJECT_CLICKED: "deliver.my.project.clicked",
  DELIVER_MY_PROJECT_VIEWED: "deliver.my.project.viewed",
  DELIVER_MY_PROJECT_COMPLETED: "deliver.my.project.completed",

  MENTOR_ME_CLICKED: "mentor.me.clicked",
  MENTOR_ME_VIEWED: "mentor.me.viewed",
  MENTOR_ME_SUBMITTED: "mentor.me.submitted",
  MENTOR_ME_COMPLETED: "mentor.me.completed",

  COFFEE_WITH_ME_CLICKED: "coffee.with.me.clicked",
  COFFEE_WITH_ME_VIEWED: "coffee.with.me.viewed",
  COFFEE_WITH_ME_SUBMITTED: "coffee.with.me.submitted",
  COFFEE_WITH_ME_COMPLETED: "coffee.with.me.completed",

  OWNERSHIP_AUDIT_CLICKED: "ownership.audit.clicked",
  OWNERSHIP_AUDIT_VIEWED: "ownership.audit.viewed",
  OWNERSHIP_AUDIT_STARTED: "ownership.audit.started",
  OWNERSHIP_AUDIT_COMPLETED: "ownership.audit.completed",

  OWNERSHIP_TOOLKIT_CLICKED: "ownership.toolkit.clicked",
  OWNERSHIP_TOOLKIT_VIEWED: "ownership.toolkit.viewed",
  OWNERSHIP_TOOLKIT_COMPLETED: "ownership.toolkit.completed",
  OWNERSHIP_TOOLKIT_DOWNLOADED: "ownership.toolkit.downloaded",

  OWNERSHIP_LEARNING_CIRCLE_CLICKED: "ownership.learning.circle.clicked",
  CIRCLE_VIEW: "circle.view",
  CIRCLE_JOIN_CLICK: "circle.join.click",
  CIRCLE_TELEGRAM_REDIRECT: "circle.telegram.redirect",

  TESTIMONIALS_VIEWED: "testimonials.viewed",
  TESTIMONIALS_PAGINATION_CLICKED: "testimonials.pagination.clicked",
  TESTIMONIAL_HELPFUL_CLICKED: "testimonial.helpful.clicked",
  TESTIMONIAL_STORY_CLICKED: "testimonial.story.clicked",
  CASE_STUDIES_VIEWED: "case.studies.viewed",
  CASE_STUDIES_PAGINATION_CLICKED: "case.studies.pagination.clicked",
  CASE_STUDY_DETAILS_CLICKED: "case.study.details.clicked",
} as const satisfies Record<string, AnalyticsEventName>;

export function trackAnalyticsEvent(event: {
  name: AnalyticsEventName;
  eventType: AnalyticsEventType;
  path?: string;
}): void {
  const body = new URLSearchParams({
    name: event.name,
    eventType: event.eventType,
  });

  if (event.path) {
    body.set("path", event.path);
  }

  // Analytics is best effort. A synchronous failure or a rejected request
  // must never interrupt the visitor journey it is reporting on.
  try {
    const request = fetch(`${apiBaseUrl}/api/v1/analytics/events`, {
      method: "POST",
      body,
      keepalive: true,
    }) as Promise<Response> | undefined;

    void request?.catch(() => undefined);
  } catch {
    // The analytics endpoint is optional and never fails the visitor journey.
  }
}
