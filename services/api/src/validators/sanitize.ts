export function sanitizeString(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

export function sanitizeOptionalString(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  const sanitized = sanitizeString(value);

  return sanitized || undefined;
}
