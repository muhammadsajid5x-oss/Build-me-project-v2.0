import { Router } from "express";

import {
  incrementTestimonialHelpfulCount,
  listPublishedTestimonials,
} from "../services/testimonials.js";

const router = Router();

router.get("/", async (request, response, next) => {
  try {
    const page = Number.parseInt(String(request.query.page ?? "1"), 10);
    const limit = Number.parseInt(String(request.query.limit ?? "4"), 10);

    const result = await listPublishedTestimonials(page, limit);

    response.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

router.post("/:id/helpful", async (request, response, next) => {
  try {
    const testimonialId = request.params.id;

    if (!testimonialId) {
      response.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Testimonial ID is required.",
        },
      });
      return;
    }

    const helpfulCount = await incrementTestimonialHelpfulCount(testimonialId);

    if (helpfulCount === null) {
      response.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "Published testimonial not found.",
        },
      });
      return;
    }

    response.status(200).json({
      data: {
        testimonialId,
        helpfulCount,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
