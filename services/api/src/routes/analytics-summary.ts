import { Router } from "express";

import { authenticate, authorize } from "../middleware/index.js";
import { PERMISSIONS } from "../permissions/index.js";
import { getAnalyticsSummary } from "../services/analytics-summary.js";

const router = Router();

/**
 * Administrator-only endpoint that returns aggregated analytics.
 *
 * The endpoint is intentionally simple: it returns a single object with
 * the metrics the dashboard needs to render the analytics view.
 */
router.get(
  "/",
  authenticate,
  authorize(PERMISSIONS.ADMIN),
  async (_request, response, next) => {
    try {
      const summary = await getAnalyticsSummary();

      response.status(200).json({ data: summary });
    } catch (error) {
      next(error);
    }
  },
);

export default router;