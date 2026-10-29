import { Router } from "express";

import { authenticate, authorize } from "../middleware/index.js";
import { PERMISSIONS } from "../permissions/index.js";
import {
  createMentorMeRequest,
  listMentorMeRequests,
} from "../services/mentor-me.js";
import {
  createValidationError,
  validateCreateMentorMeRequest,
} from "../validators/index.js";

const router = Router();

/**
 * Public endpoint used by the Mentor Me form.
 *
 * Server-side validation is authoritative. Only validated visitor fields
 * reach the database.
 */
router.post("/", async (request, response, next) => {
  const result = validateCreateMentorMeRequest(request.body);

  if (!result.success) {
    response.status(400).json(createValidationError(result.errors));
    return;
  }

  try {
    const created = await createMentorMeRequest(result.data);

    response.status(201).json({
      data: {
        id: created.id,
        name: created.name,
        email: created.email,
        mentoringArea: created.mentoringArea,
        helpWith: created.helpWith,
        experienceContext: created.experienceContext,
        ...(created.preferredFormat
          ? { preferredFormat: created.preferredFormat }
          : {}),
        ...(created.availability ? { availability: created.availability } : {}),
        status: created.status,
        createdAt: created.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Administrator-only listing of stored Mentor Me requests.
 */
router.get(
  "/",
  authenticate,
  authorize(PERMISSIONS.ADMIN),
  async (_request, response, next) => {
    try {
      const requests = await listMentorMeRequests();

      response.status(200).json({ data: requests });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
