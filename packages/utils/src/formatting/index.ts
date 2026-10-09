export function capitalize(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}
export function formatName(
  firstName: string,
  lastName?: string,
): string {
  return [firstName, lastName]
    .filter((name): name is string => Boolean(name?.trim()))
    .map((name) => name.trim())
    .map(capitalize)
    .join(" ");
}
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}
export function formatCurrency(
  value: number,
  currency = "USD",
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(value);
}
