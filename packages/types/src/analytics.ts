export type AnalyticsEventName =
  | "page_view"
  | "button_click"
  | "form_submit"
  | "lead_created"
  | "project_created"
  | "foundation.test.clicked";
export interface AnalyticsEvent {
  name: AnalyticsEventName;
  userId?: string;
  properties?: Record<string, unknown>;
  timestamp: string;
}
