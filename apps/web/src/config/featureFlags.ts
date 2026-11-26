/**
 * Application feature flags.
 *
 * Change these values to enable or disable optional sections
 * without removing their implementation.
 */
export const FEATURE_FLAGS = {
  showFooter: true,
  showTestimonials: true,
  showGiveFeedback: true,

  // Footer sections
  showFooterFollowUs: true,
  showFooterShareThisPage: true,
  showFooterGiveReferrals: true,
  showAboutMe: true,
  showLegalLinks: true,

  // Copyright remains visible
  showCopyright: true,
} as const;
