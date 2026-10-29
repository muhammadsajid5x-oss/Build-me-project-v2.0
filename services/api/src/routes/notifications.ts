import { Router } from "express";
import { authenticate, authorize } from "../middleware/index.js";
import { PERMISSIONS } from "../permissions/index.js";
const router = Router();
/**
 * Administrator-only notifications endpoint.
 *
 * Notifications are not persisted yet, so the current valid state
 * is an empty notification collection.
 */
router.get(
  "/",
  authenticate,
  authorize(PERMISSIONS.ADMIN),
  async (_request, response) => {
    response.status(200).json({
      data: [],
    });
  },
);
export default router;
