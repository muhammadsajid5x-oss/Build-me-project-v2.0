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

export type FeedbackSource =
  | "client-work"
  | "mentorship"
  | "coffee-chat"
  | "other";

export type CreateFeedbackInput = {
  type: FeedbackType;
  name: string;
  email: string;
  role?: string;
  company?: string;
  location?: string;
  source?: FeedbackSource;
  tags?: string[];
  score?: number;
  rating?: number;
  communications?: number;
  timelines?: number;
  knowledge?: number;
  value?: number;
  title?: string;
  content: string;
  outcome?: string;
};

export type UpdateFeedbackInput = {
  name?: string;
  role?: string;
  company?: string;
  location?: string;
  source?: FeedbackSource;
  tags?: string[];
  rating?: number;
  communications?: number;
  timelines?: number;
  knowledge?: number;
  value?: number;
  title?: string;
  content?: string;
  outcome?: string;
};

export type FeedbackModerationStatus = "approved" | "rejected";

export type UpdateFeedbackStatusInput = {
  status: FeedbackModerationStatus;
};

const feedbackTypes: FeedbackType[] = [
  "score",
  "rate",
  "complaint",
  "suggestion",
];

const feedbackSources: FeedbackSource[] = [
  "client-work",
  "mentorship",
  "coffee-chat",
  "other",
];

function validateOptionalText(
  value: unknown,
  field: string,
  label: string,
  maxLength: number,
  errors: Array<{ field: string; message: string }>,
) {
  if (value === undefined) {
    return;
  }

  if (typeof value !== "string") {
    errors.push({
      field,
      message: `${label} must be text.`,
    });
    return;
  }

  if (!isStringLengthValid(value, 0, maxLength)) {
    errors.push({
      field,
      message: `${label} must be at most ${maxLength} characters.`,
    });
  }
}

function validateRatingField(
  value: unknown,
  field: string,
  errors: Array<{ field: string; message: string }>,
) {
  if (value === undefined || value === null) {
    return;
  }

  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < 1 ||
    value > 5
  ) {
    errors.push({
      field,
      message: `${field} must be an integer between 1 and 5.`,
    });
  }
}

function normalizeTags(
  value: unknown,
  errors: Array<{ field: string; message: string }>,
): string[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    errors.push({
      field: "tags",
      message: "Tags must be an array.",
    });
    return undefined;
  }

  const tags = value
    .filter((tag): tag is string => typeof tag === "string")
    .map((tag) => sanitizeString(tag).trim())
    .filter(Boolean)
    .slice(0, 8);

  if (tags.length !== value.length) {
    errors.push({
      field: "tags",
      message: "Tags must contain only text values.",
    });
  }

  for (const tag of tags) {
    if (!isStringLengthValid(tag, 1, 50)) {
      errors.push({
        field: "tags",
        message: "Each tag must be between 1 and 50 characters.",
      });
      break;
    }
  }

  return tags;
}

export function validateUpdateFeedbackStatus(
  input: unknown,
): ValidationResult<UpdateFeedbackStatusInput> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return validationFailure([
      {
        field: "body",
        message: "Request body must be an object.",
      },
    ]);
  }

  const status = (input as Record<string, unknown>).status;

  if (status !== "approved" && status !== "rejected") {
    return validationFailure([
      {
        field: "status",
        message: "Status must be approved or rejected.",
      },
    ]);
  }

  return validationSuccess({ status });
}

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
  const errors: Array<{ field: string; message: string }> = [];

  if (
    typeof body.type !== "string" ||
    !feedbackTypes.includes(body.type as FeedbackType)
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

  if (type === "rate" && body.rating === undefined) {
    errors.push({
      field: "rating",
      message: "Rating is required for a review.",
    });
  }

  validateRatingField(body.rating, "rating", errors);
  validateRatingField(body.communications, "communications", errors);
  validateRatingField(body.timelines, "timelines", errors);
  validateRatingField(body.knowledge, "knowledge", errors);
  validateRatingField(body.value, "value", errors);

  if (body.source !== undefined) {
    if (
      typeof body.source !== "string" ||
      !feedbackSources.includes(body.source as FeedbackSource)
    ) {
      errors.push({
        field: "source",
        message: "Invalid feedback source.",
      });
    }
  }

  validateOptionalText(body.role, "role", "Role", 150, errors);
  validateOptionalText(body.company, "company", "Company", 150, errors);
  validateOptionalText(body.location, "location", "Location", 150, errors);
  validateOptionalText(body.outcome, "outcome", "Outcome", 1000, errors);
  validateOptionalText(body.title, "title", "Title", 200, errors);

  const tags = normalizeTags(body.tags, errors);

  if (
    (type === "complaint" || type === "suggestion") &&
    !isNonEmptyString(body.title)
  ) {
    errors.push({
      field: "title",
      message: "Title is required.",
    });
  }

  if (errors.length > 0) {
    return validationFailure(errors);
  }

  const result: CreateFeedbackInput = {
    type: type as FeedbackType,
    name: sanitizeString(body.name as string),
    email: sanitizeString(body.email as string),
    content: sanitizeString(body.content as string),
  };

  if (typeof body.role === "string" && body.role.trim()) {
    result.role = sanitizeString(body.role);
  }

  if (typeof body.company === "string" && body.company.trim()) {
    result.company = sanitizeString(body.company);
  }

  if (typeof body.location === "string" && body.location.trim()) {
    result.location = sanitizeString(body.location);
  }

  if (typeof body.source === "string") {
    result.source = body.source as FeedbackSource;
  }

  if (tags) {
    result.tags = tags;
  }

  if (typeof body.score === "number") {
    result.score = body.score;
  }

  if (typeof body.rating === "number") {
    result.rating = body.rating;
  }

  if (typeof body.communications === "number") {
    result.communications = body.communications;
  }

  if (typeof body.timelines === "number") {
    result.timelines = body.timelines;
  }

  if (typeof body.knowledge === "number") {
    result.knowledge = body.knowledge;
  }

  if (typeof body.value === "number") {
    result.value = body.value;
  }

  if (typeof body.title === "string" && body.title.trim()) {
    result.title = sanitizeString(body.title);
  }

  if (typeof body.outcome === "string" && body.outcome.trim()) {
    result.outcome = sanitizeString(body.outcome);
  }

  return validationSuccess(result);
}

export function validateUpdateFeedback(
  input: unknown,
): ValidationResult<UpdateFeedbackInput> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return validationFailure([
      {
        field: "body",
        message: "Request body must be an object.",
      },
    ]);
  }

  const body = input as Record<string, unknown>;
  const errors: Array<{ field: string; message: string }> = [];

  validateOptionalText(body.name, "name", "Name", 100, errors);
  validateOptionalText(body.role, "role", "Role", 150, errors);
  validateOptionalText(body.company, "company", "Company", 150, errors);
  validateOptionalText(body.location, "location", "Location", 150, errors);
  validateOptionalText(body.title, "title", "Title", 200, errors);
  validateOptionalText(body.content, "content", "Content", 3000, errors);
  validateOptionalText(body.outcome, "outcome", "Outcome", 1000, errors);

  if (body.source !== undefined) {
    if (
      typeof body.source !== "string" ||
      !feedbackSources.includes(body.source as FeedbackSource)
    ) {
      errors.push({
        field: "source",
        message: "Invalid feedback source.",
      });
    }
  }

  validateRatingField(body.rating, "rating", errors);
  validateRatingField(body.communications, "communications", errors);
  validateRatingField(body.timelines, "timelines", errors);
  validateRatingField(body.knowledge, "knowledge", errors);
  validateRatingField(body.value, "value", errors);

  const tags = normalizeTags(body.tags, errors);

  if (errors.length > 0) {
    return validationFailure(errors);
  }

  const result: UpdateFeedbackInput = {};

  if (typeof body.name === "string") {
    result.name = sanitizeString(body.name);
  }

  if (typeof body.role === "string") {
    result.role = sanitizeString(body.role);
  }

  if (typeof body.company === "string") {
    result.company = sanitizeString(body.company);
  }

  if (typeof body.location === "string") {
    result.location = sanitizeString(body.location);
  }

  if (typeof body.source === "string") {
    result.source = body.source as FeedbackSource;
  }

  if (tags) {
    result.tags = tags;
  }

  if (typeof body.rating === "number") {
    result.rating = body.rating;
  }

  if (typeof body.communications === "number") {
    result.communications = body.communications;
  }

  if (typeof body.timelines === "number") {
    result.timelines = body.timelines;
  }

  if (typeof body.knowledge === "number") {
    result.knowledge = body.knowledge;
  }

  if (typeof body.value === "number") {
    result.value = body.value;
  }

  if (typeof body.title === "string") {
    result.title = sanitizeString(body.title);
  }

  if (typeof body.content === "string") {
    result.content = sanitizeString(body.content);
  }

  if (typeof body.outcome === "string") {
    result.outcome = sanitizeString(body.outcome);
  }

  return validationSuccess(result);
}
