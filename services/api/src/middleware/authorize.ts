import type { AuthenticatedRequest } from "../auth/auth.types.js";
import type { NextFunction, Response } from "express";
import { createApiError } from "../validators/index.js";
import { PERMISSIONS, type Permission } from "../permissions/index.js";
export function authorize(permission: Permission) {
  return (
    request: AuthenticatedRequest,
    response: Response,
    next: NextFunction,
  ): void => {
    if (!request.user) {
      response
        .status(401)
        .json(createApiError("UNAUTHORIZED", "Authentication is required."));
      return;
    }
    if (permission === PERMISSIONS.AUTHENTICATED) {
      next();
      return;
    }
    if (permission === PERMISSIONS.ADMIN && request.user.isAdmin) {
      next();
      return;
    }
    response
      .status(403)
      .json(
        createApiError(
          "FORBIDDEN",
          "You do not have permission to access this resource.",
        ),
      );
  };
}
