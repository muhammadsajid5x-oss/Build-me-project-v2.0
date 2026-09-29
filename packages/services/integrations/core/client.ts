import { logger } from "@build-me/utils";
import { IntegrationError } from "./errors";
export type IntegrationResponseValidator<T> = {
  safeParse: (data: unknown) => {
    success: boolean;
    data?: T;
    error?: unknown;
  };
} | ((data: unknown) => T);

export const DEFAULT_INTEGRATION_TIMEOUT_MS = 10_000;

export type IntegrationRequest<T = unknown> = {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  schema?: IntegrationResponseValidator<T>;
  timeoutMs?: number;
};
export type IntegrationResponse<T> = {
  data: T;
  status: number;
  headers: Headers;
};
function validateResponseBody<T>(
  raw: unknown,
  schema: IntegrationResponseValidator<T> | undefined,
  url: string,
): T {
  if (!schema) {
    return raw as T;
  }

  if (typeof schema === "function") {
    try {
      return schema(raw);
    } catch (error) {
      throw new IntegrationError(
        `Integration response validation failed for ${url}.`,
        "INTEGRATION_RESPONSE_INVALID",
      );
    }
  }

  const result = schema.safeParse(raw);

  if (!result.success || result.data === undefined) {
    throw new IntegrationError(
      `Integration response validation failed for ${url}.`,
      "INTEGRATION_RESPONSE_INVALID",
    );
  }

  return result.data;
}

export async function requestIntegration<T = unknown>(
  request: IntegrationRequest<T>,
): Promise<IntegrationResponse<T>> {
  const method = request.method ?? "GET";
  const timeoutMs = request.timeoutMs ?? DEFAULT_INTEGRATION_TIMEOUT_MS;
  logger.info("Integration request started.", {
    method,
    url: request.url,
  });
  try {
    const response = await fetch(request.url, {
      signal: AbortSignal.timeout(timeoutMs),
      method,
      headers: {
        "Content-Type": "application/json",
        ...request.headers,
      },
      ...(request.body !== undefined
        ? { body: JSON.stringify(request.body) }
        : {}),
    });
    const contentType = response.headers.get("content-type") ?? "";
    const data = contentType.includes("application/json")
      ? await response.json()
      : await response.text();
    if (!response.ok) {
      logger.error("Integration request returned an error.", {
        method,
        url: request.url,
        status: response.status,
      });
      throw new IntegrationError(
        `Integration request failed with status ${response.status}.`,
        "INTEGRATION_REQUEST_FAILED",
        response.status,
      );
    }
    logger.info("Integration request completed.", {
      method,
      url: request.url,
      status: response.status,
    });
    return {
      data: validateResponseBody(data, request.schema, request.url),
      status: response.status,
      headers: response.headers,
    };
  } catch (error) {
    if (error instanceof IntegrationError) {
      throw error;
    }
    if (error instanceof Error && error.name === "AbortError") {
      logger.error("Integration request timed out.", {
        method,
        url: request.url,
        timeoutMs,
      });
      throw new IntegrationError(
        `Integration request timed out after ${timeoutMs}ms.`,
        "INTEGRATION_TIMEOUT",
      );
    }
    logger.error("Integration request failed.", {
      method,
      url: request.url,
    });
    throw new IntegrationError(
      "Integration request failed.",
      "INTEGRATION_REQUEST_FAILED",
    );
  }
}
