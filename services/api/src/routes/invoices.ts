import { Router } from "express";

import { authenticate, authorize } from "../middleware/index.js";
import { PERMISSIONS } from "../permissions/index.js";
import { createInvoice, listInvoices } from "../services/invoices.js";
import {
  createValidationError,
  validateCreateInvoice,
} from "../validators/index.js";

const router = Router();

/**
 * Public endpoint used immediately after booking creation.
 *
 * Invoice amount is always derived from the stored booking.
 */
router.post("/", async (request, response, next) => {
  const result = validateCreateInvoice(request.body);

  if (!result.success) {
    response.status(400).json(createValidationError(result.errors));
    return;
  }

  try {
    const invoice = await createInvoice(result.data);

    response.status(201).json({
      data: invoice,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "INVOICE_BOOKING_NOT_FOUND") {
        response.status(404).json({
          error: "Booking not found.",
        });
        return;
      }
    }

    next(error);
  }
});

/**
 * Admin endpoint used by the dashboard to review invoices.
 */
router.get(
  "/",
  authenticate,
  authorize(PERMISSIONS.ADMIN),
  async (_request, response, next) => {
    try {
      const invoices = await listInvoices();

      response.status(200).json({
        data: invoices,
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
