import { Router } from "express";

import {
  authenticate,
  authRateLimiter,
  authorize,
} from "../middleware/index.js";
import { PERMISSIONS } from "../permissions/index.js";
import type { AuthenticatedRequest } from "../auth/auth.types.js";

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

export default router;
