export type SafeError = {
  message: string;
  code?: string;
};

export function getSafeErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string" &&
    error.message.trim()
  ) {
    return error.message;
  }

  return fallback;
}

export function isUnauthorizedError(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return false;
  }

  return error.code === "UNAUTHORIZED";
}
