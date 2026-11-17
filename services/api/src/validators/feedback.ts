import {
  isNonEmptyString,
  isStringLengthValid,
  isValidEmail,
  type ValidationResult,
  validationFailure,
  validationSuccess,
} from "./common.js";
import { sanitizeString } from "./sanitize.js";

export type FeedbackType = "score" | "rate" | "complaint" | "suggestion";

export type CreateFeedbackInput = {
  type: FeedbackType;
  name: string;
  email: string;
  score?: number;
  rating?: number;
  title?: string;
  content: string;
};

export function validateCreateFeedback(
  input: unknown,
): ValidationResult<CreateFeedbackInput> {
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

  const validTypes: FeedbackType[] = [
    "score",
    "rate",
    "complaint",
    "suggestion",
  ];

  if (
    typeof body.type !== "string" ||
    !validTypes.includes(body.type as FeedbackType)
  ) {
    errors.push({
      field: "type",
      message: "A valid feedback type is required.",
    });
  }

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

  if (!isNonEmptyString(body.content)) {
    errors.push({
      field: "content",
      message: "Feedback details are required.",
    });
  } else if (!isStringLengthValid(body.content, 1, 3000)) {
    errors.push({
      field: "content",
      message: "Feedback details must be between 1 and 3000 characters.",
    });
  }

  const type = body.type as FeedbackType | undefined;

  if (type === "score") {
    if (
      typeof body.score !== "number" ||
      !Number.isInteger(body.score) ||
      body.score < 1 ||
      body.score > 10
    ) {
      errors.push({
        field: "score",
        message: "Score must be an integer between 1 and 10.",
      });
    }
  }

  if (type === "rate") {
    if (
      typeof body.rating !== "number" ||
      !Number.isInteger(body.rating) ||
      body.rating < 1 ||
      body.rating > 5
    ) {
      errors.push({
        field: "rating",
        message: "Rating must be an integer between 1 and 5.",
      });
    }
  }

  if (type === "complaint" || type === "suggestion") {
    if (!isNonEmptyString(body.title)) {
      errors.push({
        field: "title",
        message: "Title is required.",
      });
    } else if (!isStringLengthValid(body.title, 1, 200)) {
      errors.push({
        field: "title",
        message: "Title must be between 1 and 200 characters.",
      });
    }
  }

  if (errors.length > 0) {
    return validationFailure(errors);
  }

  const result: CreateFeedbackInput = {
    type: type as FeedbackType,
    name: sanitizeString(body.name),
    email: sanitizeString(body.email),
    content: sanitizeString(body.content),
  };

  if (typeof body.score === "number") {
    result.score = body.score;
  }

  if (typeof body.rating === "number") {
    result.rating = body.rating;
  }

  if (isNonEmptyString(body.title)) {
    result.title = sanitizeString(body.title);
  }

  return validationSuccess(result);
}
