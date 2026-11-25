import { Router } from "express";

import { authenticate, authorize } from "../middleware/index.js";
import { PERMISSIONS } from "../permissions/index.js";
import {
  createFeedback,
  listFeedback,
  updateFeedbackStatus,
} from "../services/feedback.js";
import { promoteApprovedFeedbackToTestimonial } from "../services/testimonials.js";
import {
  API_ERROR_CODES,
  createApiError,
  createValidationError,
  validateCreateFeedback,
  validateUpdateFeedbackStatus,
} from "../validators/index.js";

const router = Router();
const feedbackIdPattern =
  /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;

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

router.put(
  "/:id/status",
  authenticate,
  authorize(PERMISSIONS.ADMIN),
  async (request, response, next) => {
    const feedbackId = request.params.id;

    if (
      typeof feedbackId !== "string" ||
      !feedbackIdPattern.test(feedbackId)
    ) {
      response
        .status(400)
        .json(
          createValidationError([
            {
              field: "id",
              message: "Feedback ID must be a valid UUID.",
            },
          ]),
        );
      return;
    }

    const result = validateUpdateFeedbackStatus(request.body);

    if (!result.success) {
      response.status(400).json(createValidationError(result.errors));
      return;
    }

    try {
      const update = await updateFeedbackStatus(
        feedbackId,
        result.data.status,
      );

      if (update.kind === "not_found") {
        response
          .status(404)
          .json(
            createApiError(
              API_ERROR_CODES.NOT_FOUND,
              "Feedback record not found.",
            ),
          );
        return;
      }

      if (update.kind === "not_pending") {
        response
          .status(409)
          .json(
            createApiError(
              API_ERROR_CODES.CONFLICT,
              "Only pending feedback can be approved or rejected.",
            ),
          );
        return;
      }

      if (
        update.data.status === "approved" &&
        update.data.type === "rate"
      ) {
        const promotion = await promoteApprovedFeedbackToTestimonial(
          feedbackId,
        );

        if (promotion.kind === "not_found") {
          response
            .status(404)
            .json(
              createApiError(
                API_ERROR_CODES.NOT_FOUND,
                "Approved feedback record was not found for promotion.",
              ),
            );
          return;
        }

        if (
          promotion.kind !== "created" &&
          promotion.kind !== "already_promoted"
        ) {
          response
            .status(409)
            .json(
              createApiError(
                API_ERROR_CODES.CONFLICT,
                "Approved Rate Us feedback could not be promoted to a testimonial.",
              ),
            );
          return;
        }
      }

      response.status(200).json({
        data: {
          id: update.data.id,
          status: update.data.status,
          updatedAt: update.data.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
