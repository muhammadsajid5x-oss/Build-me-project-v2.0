export type ValidationIssue = {
  field: string;
  message: string;
};
export type ValidationResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      errors: ValidationIssue[];
    };
export function validationSuccess<T>(data: T): ValidationResult<T> {
  return {
    success: true,
    data,
  };
}
export function validationFailure<T = never>(
  errors: ValidationIssue[],
): ValidationResult<T> {
  return {
    success: false,
    errors,
  };
}
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
export function isValidEmail(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
export function isValidUrl(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}
export function isStringLengthValid(
  value: unknown,
  min: number,
  max: number,
): boolean {
  if (typeof value !== "string") {
    return false;
  }
  const length = value.trim().length;
  return length >= min && length <= max;
}
