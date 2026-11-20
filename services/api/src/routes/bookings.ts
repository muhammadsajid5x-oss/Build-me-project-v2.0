import { Router } from "express";

import { authenticate, authorize } from "../middleware/index.js";
import { PERMISSIONS } from "../permissions/index.js";
import { createBooking, listBookings } from "../services/bookings.js";
import {
  createValidationError,
  validateCreateBooking,
} from "../validators/index.js";

const router = Router();

/**
 * Public endpoint used when a visitor selects a pricing plan.
 */
router.post("/", async (request, response, next) => {
  const result = validateCreateBooking(request.body);

  if (!result.success) {
    response.status(400).json(createValidationError(result.errors));
    return;
  }

  try {
    const booking = await createBooking(result.data);

    response.status(201).json({
      data: booking,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "BOOKING_LEAD_NOT_FOUND") {
        response.status(404).json({
          error: "Lead not found.",
        });
        return;
      }

      if (error.message === "BOOKING_PLAN_NOT_FOUND") {
        response.status(404).json({
          error: "Pricing plan not found.",
        });
        return;
      }

      if (error.message === "BOOKING_PLAN_INACTIVE") {
        response.status(409).json({
          error: "The selected pricing plan is no longer available.",
        });
        return;
      }
    }

    next(error);
  }
});

/**
 * Admin endpoint used by the dashboard to review bookings.
 */
router.get(
  "/",
  authenticate,
  authorize(PERMISSIONS.ADMIN),
  async (_request, response, next) => {
    try {
      const bookings = await listBookings();

      response.status(200).json({
        data: bookings,
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
