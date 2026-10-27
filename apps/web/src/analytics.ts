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
  | "mentor.me.completed";

export const ANALYTICS_EVENTS = {
  WORK_WITH_ME_CLICKED: "work.with.me.clicked",
  DELIVER_MY_PROJECT_CLICKED: "deliver.my.project.clicked",
  DELIVER_MY_PROJECT_VIEWED: "deliver.my.project.viewed",
  DELIVER_MY_PROJECT_COMPLETED: "deliver.my.project.completed",
  MENTOR_ME_CLICKED: "mentor.me.clicked",
  MENTOR_ME_VIEWED: "mentor.me.viewed",
  MENTOR_ME_SUBMITTED: "mentor.me.submitted",
  MENTOR_ME_COMPLETED: "mentor.me.completed",
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
