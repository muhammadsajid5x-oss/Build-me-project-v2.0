import {
  isNonEmptyString,
  isStringLengthValid,
  type ValidationResult,
  validationFailure,
  validationSuccess,
} from "./common.js";
export type CreateProjectRequest = {
  name: string;
  description?: string;
};
export function validateCreateProjectRequest(
  input: unknown,
): ValidationResult<CreateProjectRequest> {
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
  if (
    body.description !== undefined &&
    typeof body.description !== "string"
  ) {
    errors.push({
      field: "description",
      message: "Description must be a string.",
    });
  }
  if (
    typeof body.description === "string" &&
    body.description.length > 1000
  ) {
    errors.push({
      field: "description",
      message: "Description must not exceed 1000 characters.",
    });
  }
  if (errors.length > 0) {
    return validationFailure(errors);
  }
  return validationSuccess({
    name: (body.name as string).trim(),
    ...(typeof body.description === "string"
      ? { description: body.description.trim() }
      : {}),
  });
}
