import type { ValidationResult } from "./common.js";
import {
  validationFailure,
  validationSuccess,
} from "./common.js";
export type ApiResponse<T> = {
  data: T;
};
export function validateApiResponse<T>(
  response: unknown,
): ValidationResult<ApiResponse<T>> {
  if (!response || typeof response !== "object") {
    return validationFailure([
      {
        field: "response",
        message: "Response must be an object.",
      },
    ]);
  }
  const body = response as Record<string, unknown>;
  if (!("data" in body)) {
    return validationFailure([
      {
        field: "data",
        message: "Response must contain a data property.",
      },
    ]);
  }
  return validationSuccess({
    data: body.data as T,
  });
}
