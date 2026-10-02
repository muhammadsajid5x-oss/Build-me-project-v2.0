import type { NextFunction, Request, Response } from "express";
import { logger } from "@build-me/utils";
import {
  API_ERROR_CODES,
  ApiError,
  createApiError,
  NotFoundError,
} from "../validators/index.js";

// Express identifies error middleware by arity, so all four parameters must stay.
export function errorHandler(
  error: unknown,
  _request: Request,
  response: Response,
  next: NextFunction,
): void {
  if (response.headersSent) {
    next(error);
    return;
  }

  if (error instanceof NotFoundError) {
    response
      .status(404)
      .json(createApiError(API_ERROR_CODES.NOT_FOUND, error.message));
    return;
  }

  if (error instanceof ApiError) {
    const context = {
      service: "api",
      method: _request.method,
      path: _request.path,
      status: error.status,
      code: error.code,
      error,
    };

    if (error.status >= 500) {
      logger.error("API request failed.", context);
    } else {
      logger.warn("API request rejected.", context);
    }

    response
      .status(error.status)
      .json(createApiError(error.code, error.message));
    return;
  }

  if (error instanceof Error && error.message === "NOT_FOUND") {
    response
      .status(404)
      .json(
        createApiError(
          API_ERROR_CODES.NOT_FOUND,
          "The requested resource was not found.",
        ),
      );
    return;
  }

  const errorCode =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
      ? error.code
      : undefined;
  const isDatabaseError =
    errorCode !== undefined && /^[0-9A-Z]{5}$/.test(errorCode);

  logger.error(
    isDatabaseError ? "Database request failed." : "API request failed.",
    {
      service: isDatabaseError ? "database" : "api",
      method: _request.method,
      path: _request.path,
      status: 500,
      ...(errorCode ? { code: errorCode } : {}),
      error,
    },
  );

  response
    .status(500)
    .json(
      createApiError("INTERNAL_SERVER_ERROR", "An unexpected error occurred."),
    );
}
