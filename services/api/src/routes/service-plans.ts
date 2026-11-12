import { Router } from "express";

import { listActiveServicePlans } from "../services/service-plans.js";

const router = Router();

/**
 * Public endpoint used by the pricing UI.
 */
router.get("/", async (_request, response, next) => {
  try {
    const plans = await listActiveServicePlans();

    response.status(200).json({
      data: plans,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
