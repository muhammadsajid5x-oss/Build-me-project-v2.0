import type { Request } from "express";

export type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
};
export type AuthenticatedUser = {
  id: string;
  email?: string;
  isAdmin: boolean;
};
export type AuthContext = {
  user: AuthenticatedUser;
  accessToken: string;
};
