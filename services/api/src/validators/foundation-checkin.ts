import {
  isNonEmptyString,
  isStringLengthValid,
  type ValidationResult,
  validationFailure,
  validationSuccess,
} from "./common.js";

export type CreateFoundationCheckinRequest = {
  name: string;
};

export function validateCreateFoundationCheckinRequest(
  input: unknown,
): ValidationResult<CreateFoundationCheckinRequest> {
  if (!input || typeof input !== "object") {
    return validationFailure([{ field: "name", message: "Name is required." }]);
  }

  const { name } = input as Record<string, unknown>;

  if (!isNonEmptyString(name)) {
    return validationFailure([{ field: "name", message: "Name is required." }]);
  }

  if (!isStringLengthValid(name, 1, 80)) {
    return validationFailure([
      {
        field: "name",
        message: "Name must be between 1 and 80 characters.",
      },
    ]);
  }

  return validationSuccess({ name: name.trim() });
}
