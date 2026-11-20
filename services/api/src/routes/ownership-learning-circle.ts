import { Router } from "express";

import { authenticate, authorize } from "../middleware/index.js";
import { PERMISSIONS } from "../permissions/index.js";
import {
  createOwnershipLearningCircleRequest,
  listOwnershipLearningCircleRequests,
} from "../services/ownership-learning-circle.js";
import {
  createValidationError,
  validateCreateOwnershipLearningCircleRequest,
} from "../validators/index.js";

const router = Router();

/**
 * Public endpoint used by the Ownership Learning Circle form.
 *
 * Server-side validation is authoritative. Only validated visitor fields
 * reach the database.
 */
router.post("/", async (request, response, next) => {
  const result = validateCreateOwnershipLearningCircleRequest(request.body);

  if (!result.success) {
    response.status(400).json(createValidationError(result.errors));
    return;
  }

  try {
    const created = await createOwnershipLearningCircleRequest(result.data);

    response.status(201).json({
      data: {
        id: created.id,
        name: created.name,
        email: created.email,
        status: created.status,
        createdAt: created.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Admin endpoint used to review Learning Circle requests.
 */
router.get(
  "/",
  authenticate,
  authorize(PERMISSIONS.ADMIN),
  async (_request, response, next) => {
    try {
      const requests = await listOwnershipLearningCircleRequests();

      response.status(200).json({
        data: requests,
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
