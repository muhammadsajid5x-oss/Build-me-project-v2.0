import {
  isNonEmptyString,
  isStringLengthValid,
  isValidEmail,
  type ValidationResult,
  validationFailure,
  validationSuccess,
} from "./common.js";
import { sanitizeString } from "./sanitize.js";

export type CreateOwnershipLearningCircleRequest = {
  name: string;
  email: string;
};

type ValidationError = {
  field: string;
  message: string;
};

/**
 * Validates and sanitizes a visitor Learning Circle request.
 *
 * Only the fields required by the Learning Circle journey are returned.
 * Unknown client fields are therefore never trusted as database fields.
 */
export function validateCreateOwnershipLearningCircleRequest(
  input: unknown,
): ValidationResult<CreateOwnershipLearningCircleRequest> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return validationFailure([
      {
        field: "body",
        message: "Request body must be an object.",
      },
    ]);
  }

  const body = input as Record<string, unknown>;
  const errors: ValidationError[] = [];

  const name = body.name;
  const email = body.email;

  if (!isNonEmptyString(name)) {
    errors.push({
      field: "name",
      message: "Name is required.",
    });
  } else if (!isStringLengthValid(name, 1, 100)) {
    errors.push({
      field: "name",
      message: "Name must be between 1 and 100 characters.",
    });
  }

  if (!isNonEmptyString(email)) {
    errors.push({
      field: "email",
      message: "Email is required.",
    });
  } else if (!isStringLengthValid(email, 1, 254) || !isValidEmail(email)) {
    errors.push({
      field: "email",
      message: "Please enter a valid email address.",
    });
  }

  if (errors.length > 0) {
    return validationFailure(errors);
  }

  return validationSuccess({
    name: sanitizeString(name),
    email: sanitizeString(email).toLowerCase(),
  });
}
