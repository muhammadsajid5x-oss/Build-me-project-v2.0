export function isValidDate(value: string | Date): boolean {
  const date = value instanceof Date ? value : new Date(value);
  return !Number.isNaN(date.getTime());
}
export function formatDate(
  value: string | Date,
): string {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}
export function formatDateTime(
  value: string | Date,
): string {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
export function toISOString(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  return date.toISOString();
}
