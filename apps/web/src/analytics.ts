import { getApiBaseUrl } from "./api-url";

const apiBaseUrl = getApiBaseUrl(import.meta.env.VITE_API_URL);

type AnalyticsEventType = "view" | "click";

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
  | "case.study.details.clicked"
  | "follow.us.viewed"
  | "follow.us.clicked"
  | "follow.us.whatsapp.clicked"
  | "follow.us.telegram.clicked"
  | "follow.us.linkedin.clicked"
  | "follow.us.facebook.clicked"
  | "follow.us.youtube.clicked"
  | "share.this.page.viewed"
  | "share.this.page.clicked"
  | "share.this.page.facebook.clicked"
  | "share.this.page.instagram.clicked"
  | "share.this.page.twitter.clicked"
  | "share.this.page.linkedin.clicked"
  | "share.this.page.pinterest.clicked"
  | "share.this.page.tiktok.clicked"
  | "share.this.page.telegram.clicked"
  | "share.this.page.whatsapp.clicked"
  | "share.this.page.youtube.clicked"
  | "share.this.page.snapchat.clicked"
  | "share.this.page.email.clicked"
  | "share.this.page.app.clicked"
  | "share.this.page.copy.link.clicked"
  | "give.referrals.viewed"
  | "give.referrals.clicked"
  | "give.referrals.step.one.completed"
  | "give.referrals.step.two.completed"
  | "give.referrals.completed"
  | "about.cta.clicked"
  | "about.terms.clicked"
  | "about.privacy.clicked"
  | "about.cookie.clicked";

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

  FOLLOW_US_VIEWED: "follow.us.viewed",
  FOLLOW_US_CLICKED: "follow.us.clicked",
  FOLLOW_US_WHATSAPP_CLICKED: "follow.us.whatsapp.clicked",
  FOLLOW_US_TELEGRAM_CLICKED: "follow.us.telegram.clicked",
  FOLLOW_US_LINKEDIN_CLICKED: "follow.us.linkedin.clicked",
  FOLLOW_US_FACEBOOK_CLICKED: "follow.us.facebook.clicked",
  FOLLOW_US_YOUTUBE_CLICKED: "follow.us.youtube.clicked",

  SHARE_THIS_PAGE_VIEWED: "share.this.page.viewed",
  SHARE_THIS_PAGE_CLICKED: "share.this.page.clicked",
  SHARE_THIS_PAGE_FACEBOOK_CLICKED: "share.this.page.facebook.clicked",
  SHARE_THIS_PAGE_INSTAGRAM_CLICKED: "share.this.page.instagram.clicked",
  SHARE_THIS_PAGE_TWITTER_CLICKED: "share.this.page.twitter.clicked",
  SHARE_THIS_PAGE_LINKEDIN_CLICKED: "share.this.page.linkedin.clicked",
  SHARE_THIS_PAGE_PINTEREST_CLICKED: "share.this.page.pinterest.clicked",
  SHARE_THIS_PAGE_TIKTOK_CLICKED: "share.this.page.tiktok.clicked",
  SHARE_THIS_PAGE_TELEGRAM_CLICKED: "share.this.page.telegram.clicked",
  SHARE_THIS_PAGE_WHATSAPP_CLICKED: "share.this.page.whatsapp.clicked",
  SHARE_THIS_PAGE_YOUTUBE_CLICKED: "share.this.page.youtube.clicked",
  SHARE_THIS_PAGE_SNAPCHAT_CLICKED: "share.this.page.snapchat.clicked",
  SHARE_THIS_PAGE_EMAIL_CLICKED: "share.this.page.email.clicked",
  SHARE_THIS_PAGE_APP_CLICKED: "share.this.page.app.clicked",
  SHARE_THIS_PAGE_COPY_LINK_CLICKED: "share.this.page.copy.link.clicked",

  GIVE_REFERRALS_VIEWED: "give.referrals.viewed",
  GIVE_REFERRALS_CLICKED: "give.referrals.clicked",
  GIVE_REFERRALS_STEP_ONE_COMPLETED: "give.referrals.step.one.completed",
  GIVE_REFERRALS_STEP_TWO_COMPLETED: "give.referrals.step.two.completed",
  GIVE_REFERRALS_COMPLETED: "give.referrals.completed",

  ABOUT_CTA_CLICKED: "about.cta.clicked",
  ABOUT_TERMS_CLICKED: "about.terms.clicked",
  ABOUT_PRIVACY_CLICKED: "about.privacy.clicked",
  ABOUT_COOKIE_CLICKED: "about.cookie.clicked",
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

  try {
    const request = fetch(`${apiBaseUrl}/api/v1/analytics/events`, {
      method: "POST",
      body,
      keepalive: true,
    }) as Promise<Response> | undefined;

    void request?.catch(() => undefined);
  } catch {
    // Analytics failures must not interrupt the visitor journey.
  }
}
