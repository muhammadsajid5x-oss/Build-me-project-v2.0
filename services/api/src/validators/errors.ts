export type ApiErrorDetail = {
  field?: string;
  message: string;
};
export type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
  };
};
export const API_ERROR_CODES = {
  BAD_REQUEST: "BAD_REQUEST",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
} as const;
export function createValidationError(
  details: ApiErrorDetail[],
): ApiErrorResponse {
  return {
    error: {
      code: API_ERROR_CODES.VALIDATION_ERROR,
      message: "The request contains invalid fields.",
      details,
    },
  };
}
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code: string = API_ERROR_CODES.INTERNAL_SERVER_ERROR,
    public readonly status: number = 500,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class NotFoundError extends ApiError {
  constructor(message = "The requested resource was not found.") {
    super(message, API_ERROR_CODES.NOT_FOUND, 404);
    this.name = "NotFoundError";
  }
}

export function createApiError(
  code: string,
  message: string,
): ApiErrorResponse {
  return {
    error: {
      code,
      message,
    },
  };
}
