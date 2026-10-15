import { rateLimit } from "express-rate-limit";
import { Router } from "express";

const router = Router();

router.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  }),
);

router.post("/", async (request, response, next) => {
  if (
    typeof request.body !== "object" ||
    request.body === null ||
    request.body.name !== "navbar.home.clicked"
  ) {
    response.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "The analytics event is invalid.",
      },
    });
    return;
  }

  try {
    const [{ db }, { analyticsEvents }] = await Promise.all([
      import("../../../../database/dist/drizzle/client.js"),
      import("../../../../database/dist/schema/analytics-events.js"),
    ]);

    await db.insert(analyticsEvents).values({
      name: "navbar.home.clicked",
      properties: {
        feature: "navbar",
        data: { destination: "/" },
      },
    });

    response.status(202).json({ data: { accepted: true } });
  } catch (error) {
    next(error);
  }
});

export default router;
