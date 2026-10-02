import { logger } from "@build-me/utils";

export interface ApiClientOptions {
  baseUrl: string;
  defaultHeaders?: Record<string, string>;
  getAccessToken?: () => Promise<string | null>;
}
export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: unknown;
  signal?: AbortSignal;
}
export type ApiError = {
  code: string;
  message: string;
  status: number;
};
function validateBaseUrl(baseUrl: string): string {
  const trimmed = baseUrl.trim();
  if (!trimmed) {
    throw new Error("API base URL is required.");
  }
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new Error("API base URL must be a valid URL.");
  }
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("API base URL must use HTTP or HTTPS.");
  }
  return trimmed.replace(/\/$/, "");
}
async function parseApiError(response: Response): Promise<ApiError> {
  const fallback: ApiError = {
    code: "API_REQUEST_FAILED",
    message: "The request could not be completed.",
    status: response.status,
  };
  try {
    const body = (await response.json()) as {
      error?: {
        code?: unknown;
        message?: unknown;
      };
    };
    if (
      body.error &&
      typeof body.error.code === "string" &&
      typeof body.error.message === "string"
    ) {
      return {
        code: body.error.code,
        message: body.error.message,
        status: response.status,
      };
    }
  } catch {
    // Use the safe fallback when the response is not valid JSON.
  }
  return fallback;
}
export class ApiClient {
  private readonly baseUrl: string;
  private readonly defaultHeaders: Record<string, string>;
  private readonly getAccessToken?: () => Promise<string | null>;
  constructor(options: ApiClientOptions) {
    this.baseUrl = validateBaseUrl(options.baseUrl);
    this.defaultHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.defaultHeaders,
    };
    this.getAccessToken = options.getAccessToken;
  }
  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const normalizedPath = path.replace(/^\/+/, "");
    const url = `${this.baseUrl}/${normalizedPath}`;
    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      ...options.headers,
    };
    if (this.getAccessToken) {
      const accessToken = await this.getAccessToken();
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    const method = options.method ?? "GET";
    let response: Response;

    try {
      response = await fetch(url, {
        method,
        headers,
        body:
          options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: options.signal,
      });
    } catch (error) {
      logger.error("Service API request failed before receiving a response.", {
        service: "services",
        method,
        path: normalizedPath,
        error,
      });
      throw error;
    }

    if (!response.ok) {
      const error = await parseApiError(response);
      logger.error("Service API request returned an error.", {
        service: "services",
        method,
        path: normalizedPath,
        status: response.status,
        code: error.code,
      });
      throw error;
    }
    if (response.status === 204) {
      return undefined as T;
    }
    try {
      return (await response.json()) as T;
    } catch (error) {
      logger.error("Service API response could not be parsed.", {
        service: "services",
        method,
        path: normalizedPath,
        error,
      });
      throw error;
    }
  }
  get<T>(path: string, options?: Omit<RequestOptions, "method" | "body">) {
    return this.request<T>(path, {
      ...options,
      method: "GET",
    });
  }
  post<T>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">,
  ) {
    return this.request<T>(path, {
      ...options,
      method: "POST",
      body,
    });
  }
  put<T>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">,
  ) {
    return this.request<T>(path, {
      ...options,
      method: "PUT",
      body,
    });
  }
  patch<T>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">,
  ) {
    return this.request<T>(path, {
      ...options,
      method: "PATCH",
      body,
    });
  }
  delete<T>(path: string, options?: Omit<RequestOptions, "method" | "body">) {
    return this.request<T>(path, {
      ...options,
      method: "DELETE",
    });
  }
}
