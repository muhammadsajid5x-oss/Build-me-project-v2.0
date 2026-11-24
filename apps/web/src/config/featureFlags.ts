/**
 * Application feature flags.
 *
 * Change these values to enable or disable optional sections
 * without removing their implementation.
 */
export const FEATURE_FLAGS = {
  showFooter: true,
  showTestimonials: false,
  showGiveFeedback: false,

  // Footer sections
  showFooterFollowUs: false,
  showFooterShareThisPage: false,
  showFooterGiveReferrals: false,
  showAboutMe: false,
  showLegalLinks: false,

  // Copyright remains visible
  showCopyright: true,
} as const;
