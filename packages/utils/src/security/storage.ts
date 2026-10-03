const SENSITIVE_KEYS = new Set([
  "password",
  "access_token",
  "refresh_token",
  "service_role_key",
  "api_key",
  "secret",
]);

export function isSensitiveStorageKey(key: string): boolean {
  return SENSITIVE_KEYS.has(key.toLowerCase());
}

export function setSafeStorageItem(
  storage: Storage,
  key: string,
  value: string,
): void {
  if (isSensitiveStorageKey(key)) {
    throw new Error(
      `Sensitive value "${key}" must not be stored in browser storage.`,
    );
  }

  storage.setItem(key, value);
}
