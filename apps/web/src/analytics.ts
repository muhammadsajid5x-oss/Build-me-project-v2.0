import { getApiBaseUrl } from "./api-url";

const apiBaseUrl = getApiBaseUrl(import.meta.env.VITE_API_URL);

type AnalyticsEventType = "view" | "click";

export function trackAnalyticsEvent(event: {
  name: string;
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

  void fetch(`${apiBaseUrl}/api/v1/analytics/events`, {
    method: "POST",
    body,
    keepalive: true,
  }).catch(() => undefined);
}
