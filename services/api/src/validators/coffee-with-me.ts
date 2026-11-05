import {
  isNonEmptyString,
  isStringLengthValid,
  isValidEmail,
  type ValidationResult,
  validationFailure,
  validationSuccess,
} from "./common.js";
import { sanitizeOptionalString, sanitizeString } from "./sanitize.js";

export type CreateCoffeeWithMeRequest = {
  name: string;
  email: string;
  topic: string;
  preferredFormat?: string;
  availability?: string;
};

type ValidationError = {
  field: string;
  message: string;
};

type RequiredFieldRule = {
  field: keyof CreateCoffeeWithMeRequest;
  requiredMessage: string;
  lengthMessage: string;
  maxLength: number;
};

const REQUIRED_FIELD_RULES: RequiredFieldRule[] = [
  {
    field: "name",
    requiredMessage: "Name is required.",
    lengthMessage: "Name must be between 1 and 100 characters.",
    maxLength: 100,
  },
  {
    field: "email",
    requiredMessage: "Email is required.",
    lengthMessage: "Please enter a valid email address.",
    maxLength: 254,
  },
  {
    field: "topic",
    requiredMessage: "Topic is required.",
    lengthMessage: "Topic must be between 1 and 2000 characters.",
    maxLength: 2000,
  },
];

function validateRequiredField(
  body: Record<string, unknown>,
  rule: RequiredFieldRule,
): ValidationError | null {
  const value = body[rule.field];

  if (!isNonEmptyString(value)) {
    return {
      field: rule.field,
      message: rule.requiredMessage,
    };
  }

  if (!isStringLengthValid(value, 1, rule.maxLength)) {
    return {
      field: rule.field,
      message: rule.lengthMessage,
    };
  }

  if (rule.field === "email" && !isValidEmail(value)) {
    return {
      field: rule.field,
      message: "Please enter a valid email address.",
    };
  }

  return null;
}

function validateOptionalField(
  body: Record<string, unknown>,
  field: "preferredFormat" | "availability",
): ValidationError | null {
  const value = body[field];

  if (
    value !== undefined &&
    value !== null &&
    !isStringLengthValid(value, 0, 100)
  ) {
    return {
      field,
      message:
        field === "preferredFormat"
          ? "Preferred format must not exceed 100 characters."
          : "Availability must not exceed 100 characters.",
    };
  }

  return null;
}

/**
 * Validates and sanitizes a visitor Coffee With Me request.
 *
 * Only the fields a visitor is allowed to provide are returned, so unknown
 * client fields can never become trusted database fields.
 */
export function validateCreateCoffeeWithMeRequest(
  input: unknown,
): ValidationResult<CreateCoffeeWithMeRequest> {
  if (!input || typeof input !== "object") {
    return validationFailure([
      {
        field: "body",
        message: "Request body must be an object.",
      },
    ]);
  }

  const body = input as Record<string, unknown>;
  const errors: ValidationError[] = [];

  for (const rule of REQUIRED_FIELD_RULES) {
    const error = validateRequiredField(body, rule);

    if (error) {
      errors.push(error);
    }
  }

  const optionalFields = ["preferredFormat", "availability"] as const;

  for (const field of optionalFields) {
    const error = validateOptionalField(body, field);

    if (error) {
      errors.push(error);
    }
  }

  if (errors.length > 0) {
    return validationFailure(errors);
  }

  const preferredFormat = sanitizeOptionalString(body.preferredFormat);
  const availability = sanitizeOptionalString(body.availability);

  return validationSuccess({
    name: sanitizeString(body.name),
    email: sanitizeString(body.email),
    topic: sanitizeString(body.topic),
    ...(preferredFormat !== undefined ? { preferredFormat } : {}),
    ...(availability !== undefined ? { availability } : {}),
  });
}