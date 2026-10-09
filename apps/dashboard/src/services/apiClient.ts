import { ApiClient } from "@build-me/services";
import { getAccessToken } from "@build-me/services/integrations";

const apiUrl = import.meta.env.VITE_API_URL;

export const apiClient = new ApiClient({
  baseUrl: apiUrl,
  getAccessToken,
});
