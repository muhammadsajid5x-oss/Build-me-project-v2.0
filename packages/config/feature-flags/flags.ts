export type Environment = "development" | "staging" | "production";
export type FeatureFlag = {
  development: boolean;
  staging: boolean;
  production: boolean;
};
export const featureFlags = {
  enableNewDashboard: {
    development: true,
    staging: true,
    production: false,
  },
  enableExperimentalUI: {
    development: true,
    staging: false,
    production: false,
  },
  enableAnalytics: {
    development: true,
    staging: true,
    production: true,
  },
} as const satisfies Record<string, FeatureFlag>;
export type FeatureFlags = typeof featureFlags;
export function isFeatureEnabled(
  feature: keyof FeatureFlags,
  environment: Environment,
): boolean {
  return featureFlags[feature][environment];
}
