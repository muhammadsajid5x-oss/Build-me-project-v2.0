import { Router } from "express";

import {
  authenticate,
  authRateLimiter,
  authorize,
} from "../middleware/index.js";
import { PERMISSIONS } from "../permissions/index.js";
import type { AuthenticatedRequest } from "../auth/auth.types.js";
import { updatePassword } from "../auth/auth.service.js";
import { createApiError } from "../validators/index.js";

const router = Router();

router.get(
  "/me",
  authRateLimiter,
  authenticate,
  authorize(PERMISSIONS.AUTHENTICATED),
  (request: AuthenticatedRequest, response) => {
    response.json({
      data: {
        user: request.user,
      },
    });
  },
);

/**
 * Allows an authenticated admin to change their own password.
 *
 * The request body must contain `currentPassword` and `newPassword`. The
 * current password is verified by Supabase before the update is applied.
 */
router.put(
  "/change-password",
  authRateLimiter,
  authenticate,
  authorize(PERMISSIONS.AUTHENTICATED),
  async (request: AuthenticatedRequest, response, next) => {
    const { currentPassword, newPassword } = request.body as {
      currentPassword?: string;
      newPassword?: string;
    };

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string" ||
      !currentPassword ||
      !newPassword
    ) {
      response
        .status(400)
        .json(
          createApiError(
            "VALIDATION_ERROR",
            "Current password and new password are required.",
          ),
        );
      return;
    }

    if (newPassword.length < 8) {
      response
        .status(400)
        .json(
          createApiError(
            "VALIDATION_ERROR",
            "New password must be at least 8 characters long.",
          ),
        );
      return;
    }

    const accessToken = request.header("authorization")?.replace(/^Bearer\s+/i, "");

    if (!accessToken) {
      response
        .status(401)
        .json(createApiError("UNAUTHORIZED", "Authentication is required."));
      return;
    }

    try {
      await updatePassword(accessToken, newPassword);

      response.status(200).json({ data: { success: true } });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
