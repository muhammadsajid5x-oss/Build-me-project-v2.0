import type { NextFunction, Request, Response } from "express";
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
  _next: NextFunction,
): void {
  void _next;

  if (response.headersSent) {
    return;
  }

  if (error instanceof NotFoundError) {
    response
      .status(404)
      .json(createApiError(API_ERROR_CODES.NOT_FOUND, error.message));
    return;
  }

  if (error instanceof ApiError) {
    console.error(error);
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

  console.error(error);

  response
    .status(500)
    .json(
      createApiError("INTERNAL_SERVER_ERROR", "An unexpected error occurred."),
    );
}
