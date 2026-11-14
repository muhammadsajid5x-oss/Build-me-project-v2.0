import {
  isNonEmptyString,
  type ValidationResult,
  validationFailure,
  validationSuccess,
} from "./common.js";
import { sanitizeString } from "./sanitize.js";

export type CreateInvoiceInput = {
  bookingId: string;
};

export function validateCreateInvoice(
  input: unknown,
): ValidationResult<CreateInvoiceInput> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return validationFailure([
      {
        field: "body",
        message: "Request body must be an object.",
      },
    ]);
  }

  const body = input as Record<string, unknown>;

  if (!isNonEmptyString(body.bookingId)) {
    return validationFailure([
      {
        field: "bookingId",
        message: "Booking ID is required.",
      },
    ]);
  }

  return validationSuccess({
    bookingId: sanitizeString(body.bookingId),
  });
}
