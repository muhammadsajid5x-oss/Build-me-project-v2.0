import { rateLimit } from "express-rate-limit";
import { Router } from "express";

const router = Router();
const eventTypes: Record<string, "view" | "click"> = {
  "navbar.home.clicked": "click",
  "page.viewed": "view",
};

router.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  }),
);

router.post("/", async (request, response, next) => {
  if (typeof request.body !== "object" || request.body === null) {
    response.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "The analytics event is invalid.",
      },
    });
    return;
  }

  const { name, eventType, path } = request.body;
  const expectedEventType =
    typeof name === "string" && Object.hasOwn(eventTypes, name)
      ? eventTypes[name]
      : undefined;
  const validViewPath =
    eventType !== "view" ||
    (typeof path === "string" &&
      path.startsWith("/") &&
      !path.startsWith("//") &&
      path.length <= 2048);

  if (!expectedEventType || eventType !== expectedEventType || !validViewPath) {
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
      name,
      eventType,
      properties:
        eventType === "click"
          ? { feature: "navbar", data: { destination: "/" } }
          : { feature: "page", data: { path } },
    });

    response.status(202).json({ data: { accepted: true } });
  } catch (error) {
    next(error);
  }
});

export default router;
