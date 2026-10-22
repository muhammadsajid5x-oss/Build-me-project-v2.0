const DEFAULT_API_BASE_URL = "http://localhost:3000";

export function getApiBaseUrl(configuredUrl?: string): string {
  let apiBaseUrl = configuredUrl ?? DEFAULT_API_BASE_URL;

  while (apiBaseUrl.endsWith("/")) {
    apiBaseUrl = apiBaseUrl.slice(0, -1);
  }

  return apiBaseUrl;
}
