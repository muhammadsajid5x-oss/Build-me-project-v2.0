import { Router } from "express";

import { authenticate, authorize } from "../middleware/index.js";
import { PERMISSIONS } from "../permissions/index.js";
import {
  createCoffeeWithMeRequest,
  listCoffeeWithMeRequests,
} from "../services/coffee-with-me.js";
import {
  createValidationError,
  validateCreateCoffeeWithMeRequest,
} from "../validators/index.js";

const router = Router();

/**
 * Public endpoint used by the Coffee With Me form.
 *
 * Server-side validation is authoritative. Only validated visitor fields
 * reach the database.
 */
router.post("/", async (request, response, next) => {
  const result = validateCreateCoffeeWithMeRequest(request.body);

  if (!result.success) {
    response.status(400).json(createValidationError(result.errors));
    return;
  }

  try {
    const created = await createCoffeeWithMeRequest(result.data);

    response.status(201).json({
      data: {
        id: created.id,
        name: created.name,
        email: created.email,
        topic: created.topic,
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
 * Administrator-only listing of stored Coffee With Me requests.
 */
router.get(
  "/",
  authenticate,
  authorize(PERMISSIONS.ADMIN),
  async (_request, response, next) => {
    try {
      const requests = await listCoffeeWithMeRequests();

      response.status(200).json({ data: requests });
    } catch (error) {
      next(error);
    }
  },
);

export default router;