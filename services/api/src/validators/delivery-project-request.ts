import {
  isNonEmptyString,
  isStringLengthValid,
  isValidEmail,
  type ValidationResult,
  validationFailure,
  validationSuccess,
} from "./common.js";
import { sanitizeOptionalString, sanitizeString } from "./sanitize.js";

export type CreateDeliveryProjectRequest = {
  name: string;
  email: string;
  projectDescription: string;
  expectedOutcome: string;
  timeline?: string;
  budget?: string;
};

/**
 * Validates and sanitizes a visitor delivery project request.
 *
 * Only the fields a visitor is allowed to provide are returned, so unknown
 * client fields can never become trusted database fields.
 */
export function validateCreateDeliveryProjectRequest(
  input: unknown,
): ValidationResult<CreateDeliveryProjectRequest> {
  if (!input || typeof input !== "object") {
    return validationFailure([
      {
        field: "body",
        message: "Request body must be an object.",
      },
    ]);
  }

  const body = input as Record<string, unknown>;
  const errors = [];

  if (!isNonEmptyString(body.name)) {
    errors.push({
      field: "name",
      message: "Name is required.",
    });
  } else if (!isStringLengthValid(body.name, 1, 100)) {
    errors.push({
      field: "name",
      message: "Name must be between 1 and 100 characters.",
    });
  }

  if (!isNonEmptyString(body.email)) {
    errors.push({
      field: "email",
      message: "Email is required.",
    });
  } else if (
    !isStringLengthValid(body.email, 1, 254) ||
    !isValidEmail(body.email)
  ) {
    errors.push({
      field: "email",
      message: "Please enter a valid email address.",
    });
  }

  if (!isNonEmptyString(body.projectDescription)) {
    errors.push({
      field: "projectDescription",
      message: "Project description is required.",
    });
  } else if (!isStringLengthValid(body.projectDescription, 1, 2000)) {
    errors.push({
      field: "projectDescription",
      message: "Project description must be between 1 and 2000 characters.",
    });
  }

  if (!isNonEmptyString(body.expectedOutcome)) {
    errors.push({
      field: "expectedOutcome",
      message: "Expected outcome is required.",
    });
  } else if (!isStringLengthValid(body.expectedOutcome, 1, 2000)) {
    errors.push({
      field: "expectedOutcome",
      message: "Expected outcome must be between 1 and 2000 characters.",
    });
  }

  if (
    body.timeline !== undefined &&
    body.timeline !== null &&
    !isStringLengthValid(body.timeline, 0, 100)
  ) {
    errors.push({
      field: "timeline",
      message: "Timeline must not exceed 100 characters.",
    });
  }

  if (
    body.budget !== undefined &&
    body.budget !== null &&
    !isStringLengthValid(body.budget, 0, 100)
  ) {
    errors.push({
      field: "budget",
      message: "Budget must not exceed 100 characters.",
    });
  }

  if (errors.length > 0) {
    return validationFailure(errors);
  }

  const timeline = sanitizeOptionalString(body.timeline);
  const budget = sanitizeOptionalString(body.budget);

  return validationSuccess({
    name: sanitizeString(body.name),
    email: sanitizeString(body.email),
    projectDescription: sanitizeString(body.projectDescription),
    expectedOutcome: sanitizeString(body.expectedOutcome),
    ...(timeline !== undefined ? { timeline } : {}),
    ...(budget !== undefined ? { budget } : {}),
  });
}
