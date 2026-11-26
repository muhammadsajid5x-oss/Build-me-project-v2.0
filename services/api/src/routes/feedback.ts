import { Router } from "express";

import { authenticate, authorize } from "../middleware/index.js";
import { PERMISSIONS } from "../permissions/index.js";
import {
  createFeedback,
  deleteFeedback,
  listFeedback,
  updateFeedback,
  updateFeedbackStatus,
} from "../services/feedback.js";
import { promoteApprovedFeedbackToTestimonial } from "../services/testimonials.js";
import {
  API_ERROR_CODES,
  createApiError,
  createValidationError,
  validateCreateFeedback,
  validateUpdateFeedback,
  validateUpdateFeedbackStatus,
} from "../validators/index.js";
function getSingleParam(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

const router = Router();

const feedbackIdPattern = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;

/**
 * Public endpoint used by Give Feedback.
 *
 * New records default to pending in the database.
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
 * Admin list.
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

/**
 * Admin edit.
 *
 * Only pending feedback can be edited. This prevents the feedback record
 * from drifting away from an already-published testimonial.
 */
router.put(
  "/:id",
  authenticate,
  authorize(PERMISSIONS.ADMIN),
  async (request, response, next) => {
    const feedbackId = getSingleParam(request.params.id);

    if (!feedbackId || !feedbackIdPattern.test(feedbackId)) {
      response.status(400).json(
        createValidationError([
          {
            field: "id",
            message: "Feedback ID must be a valid UUID.",
          },
        ]),
      );
      return;
    }

    const result = validateUpdateFeedback(request.body);

    if (!result.success) {
      response.status(400).json(createValidationError(result.errors));
      return;
    }

    try {
      const update = await updateFeedback(feedbackId, result.data);

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
              "Only pending feedback can be edited.",
            ),
          );
        return;
      }

      response.status(200).json({
        data: update.data,
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * Admin approve/reject.
 */
router.put(
  "/:id/status",
  authenticate,
  authorize(PERMISSIONS.ADMIN),
  async (request, response, next) => {
    const feedbackId = getSingleParam(request.params.id);

    if (!feedbackId || !feedbackIdPattern.test(feedbackId)) {
      response.status(400).json(
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
      const update = await updateFeedbackStatus(feedbackId, result.data.status);

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

      if (update.data.status === "approved") {
        const promotion =
          await promoteApprovedFeedbackToTestimonial(feedbackId);

        if (
          promotion.kind !== "created" &&
          promotion.kind !== "already_promoted" &&
          promotion.kind !== "not_publishable"
        ) {
          response
            .status(409)
            .json(
              createApiError(
                API_ERROR_CODES.CONFLICT,
                "Approved feedback could not be published as a testimonial.",
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

/**
 * Admin delete.
 *
 * Deletion is limited to pending feedback.
 */
router.delete(
  "/:id",
  authenticate,
  authorize(PERMISSIONS.ADMIN),
  async (request, response, next) => {
    const feedbackId = getSingleParam(request.params.id);

    if (!feedbackId || !feedbackIdPattern.test(feedbackId)) {
      response.status(400).json(
        createValidationError([
          {
            field: "id",
            message: "Feedback ID must be a valid UUID.",
          },
        ]),
      );
      return;
    }

    try {
      const deletion = await deleteFeedback(feedbackId);

      if (deletion.kind === "not_found") {
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

      if (deletion.kind === "not_pending") {
        response
          .status(409)
          .json(
            createApiError(
              API_ERROR_CODES.CONFLICT,
              "Only pending feedback can be deleted.",
            ),
          );
        return;
      }

      response.status(200).json({
        data: {
          id: deletion.id,
          deleted: true,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
