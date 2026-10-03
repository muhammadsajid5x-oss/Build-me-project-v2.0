export const PERMISSIONS = {
  AUTHENTICATED: "authenticated",
  ADMIN: "admin",
} as const;
export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
