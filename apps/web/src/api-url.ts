const DEFAULT_API_BASE_URL = "http://localhost:3000";

export function getApiBaseUrl(configuredUrl?: string): string {
  return (configuredUrl ?? DEFAULT_API_BASE_URL).replace(/\/+$/, "");
}
