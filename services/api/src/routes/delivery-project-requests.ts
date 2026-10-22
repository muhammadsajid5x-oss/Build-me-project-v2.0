import { Router } from "express";

import { authenticate, authorize } from "../middleware/index.js";
import { PERMISSIONS } from "../permissions/index.js";
import {
  createDeliveryProjectRequest,
  listDeliveryProjectRequests,
} from "../services/delivery-project-request.js";
import {
  createValidationError,
  validateCreateDeliveryProjectRequest,
} from "../validators/index.js";

const router = Router();

/**
 * Public endpoint used by the "Deliver My Project" form.
 *
 * Validation is performed on the server and is the authoritative check; the
 * visitor supplied fields are the only values that reach the database.
 */
router.post("/", async (request, response, next) => {
  const result = validateCreateDeliveryProjectRequest(request.body);

  if (!result.success) {
    response.status(400).json(createValidationError(result.errors));
    return;
  }

  try {
    const created = await createDeliveryProjectRequest(result.data);

    response.status(201).json({
      data: {
        id: created.id,
        name: created.name,
        email: created.email,
        projectDescription: created.projectDescription,
        expectedOutcome: created.expectedOutcome,
        ...(created.timeline ? { timeline: created.timeline } : {}),
        ...(created.budget ? { budget: created.budget } : {}),
        status: created.status,
        createdAt: created.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Administrator only listing of the stored delivery project requests.
 */
router.get(
  "/",
  authenticate,
  authorize(PERMISSIONS.ADMIN),
  async (_request, response, next) => {
    try {
      const requests = await listDeliveryProjectRequests();

      response.status(200).json({ data: requests });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
