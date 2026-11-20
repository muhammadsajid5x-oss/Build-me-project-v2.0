import {
  isNonEmptyString,
  type ValidationResult,
  validationFailure,
  validationSuccess,
} from "./common.js";
import { sanitizeString } from "./sanitize.js";

export type CreateBookingInput = {
  leadId: string;
  planId: string;
};

export function validateCreateBooking(
  input: unknown,
): ValidationResult<CreateBookingInput> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return validationFailure([
      {
        field: "body",
        message: "Request body must be an object.",
      },
    ]);
  }

  const body = input as Record<string, unknown>;
  const errors = [];

  if (!isNonEmptyString(body.leadId)) {
    errors.push({
      field: "leadId",
      message: "Lead ID is required.",
    });
  }

  if (!isNonEmptyString(body.planId)) {
    errors.push({
      field: "planId",
      message: "Plan ID is required.",
    });
  }

  if (errors.length > 0) {
    return validationFailure(errors);
  }

  return validationSuccess({
    leadId: sanitizeString(body.leadId),
    planId: sanitizeString(body.planId),
  });
}
