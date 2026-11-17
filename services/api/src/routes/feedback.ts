import { Router } from "express";

import { authenticate, authorize } from "../middleware/index.js";
import { PERMISSIONS } from "../permissions/index.js";
import { createFeedback, listFeedback } from "../services/feedback.js";
import {
  createValidationError,
  validateCreateFeedback,
} from "../validators/index.js";

const router = Router();

/**
 * Public endpoint used by the Give Feedback modal.
 *
 * Server-side validation is authoritative. Only validated feedback
 * fields are passed to the database service.
 */
router.post("/", async (request, response, next) => {
  const result = validateCreateFeedback(request.body);

  if (!result.success) {
    response.status(400).json(createValidationError(result.errors));
    return;
  }

  try {
    const created = await createFeedback(result.data);

    response.status(201).json({
      data: {
        referenceId: created.referenceId,
        type: created.type,
        createdAt: created.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Admin endpoint used by the dashboard Feedback page.
 *
 * Feedback data is protected by authentication and admin authorization.
 */
router.get(
  "/",
  authenticate,
  authorize(PERMISSIONS.ADMIN),
  async (_request, response, next) => {
    try {
      const feedbackRecords = await listFeedback();

      response.status(200).json({
        data: feedbackRecords,
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
