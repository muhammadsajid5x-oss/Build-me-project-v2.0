import { rateLimit } from "express-rate-limit";
import { Router } from "express";
import { logger } from "@build-me/utils/logging";

const router = Router();

type AnalyticsEventType = "view" | "click";

const databaseErrorDetails = (
  error: unknown,
  seen = new Set<object>(),
  depth = 0,
): Record<string, unknown> => {
  if (typeof error !== "object" || error === null) {
    return { message: String(error) };
  }

  if (seen.has(error)) {
    return { name: "CircularErrorCause" };
  }
  seen.add(error);

  const details: Record<string, unknown> = {};
  for (const key of [
    "name",
    "message",
    "severity",
    "code",
    "detail",
    "hint",
    "constraint",
    "schema",
    "table",
    "column",
    "dataType",
    "where",
    "routine",
  ]) {
    const value = Reflect.get(error, key);
    if (typeof value === "string") {
      details[key] = value;
    }
  }

  const cause = Reflect.get(error, "cause");
  if (cause !== undefined && depth < 4) {
    details.cause = databaseErrorDetails(cause, seen, depth + 1);
  }

  return details;
};

type AnalyticsEventDefinition = {
  readonly eventType: AnalyticsEventType;
  readonly buildProperties: (path?: string) => Record<string, unknown>;
};

const pageViewProperties = (path?: string): Record<string, unknown> => ({
  feature: "page",
  data: { path },
});

const deliveryProjectProperties = (): Record<string, unknown> => ({
  feature: "deliver-my-project",
  data: { destination: "/deliver-my-project" },
});

const coffeeWithMeProperties = (): Record<string, unknown> => ({
  feature: "coffee-with-me",
  data: { destination: "/coffee-with-me" },
});

const testimonialsViewProperties = (
  path?: string,
): Record<string, unknown> => ({
  feature: "testimonials",
  data: {
    action: "viewed",
    path,
  },
});

const testimonialsPaginationProperties = (): Record<string, unknown> => ({
  feature: "testimonials",
  data: { action: "pagination-clicked" },
});

const testimonialHelpfulProperties = (): Record<string, unknown> => ({
  feature: "testimonial",
  data: { action: "helpful-clicked" },
});

const testimonialStoryProperties = (): Record<string, unknown> => ({
  feature: "testimonial",
  data: { action: "story-clicked" },
});

const caseStudiesViewProperties = (path?: string): Record<string, unknown> => ({
  feature: "case-studies",
  data: {
    action: "viewed",
    path,
  },
});

const caseStudiesPaginationProperties = (): Record<string, unknown> => ({
  feature: "case-studies",
  data: { action: "pagination-clicked" },
});

const caseStudyDetailsProperties = (): Record<string, unknown> => ({
  feature: "case-study",
  data: { action: "details-clicked" },
});

const followUsViewProperties = (path?: string): Record<string, unknown> => ({
  feature: "follow-us",
  data: {
    action: "viewed",
    path,
  },
});

const followUsClickProperties = (): Record<string, unknown> => ({
  feature: "follow-us",
  data: { action: "clicked" },
});

const followUsPlatformClickProperties = (
  platform: "whatsapp" | "telegram" | "linkedin" | "facebook" | "youtube",
): Record<string, unknown> => ({
  feature: "follow-us",
  data: {
    action: `${platform}-clicked`,
  },
});

const eventDefinitions: Record<string, AnalyticsEventDefinition> = {
  "hero.viewed": {
    eventType: "view",
    buildProperties: pageViewProperties,
  },

  "mentor.me.clicked": {
    eventType: "click",
    buildProperties: () => ({
      feature: "mentor-me",
      data: { action: "clicked" },
    }),
  },

  "mentor.me.viewed": {
    eventType: "view",
    buildProperties: pageViewProperties,
  },

  "mentor.me.submitted": {
    eventType: "click",
    buildProperties: () => ({
      feature: "mentor-me",
      data: { action: "submitted" },
    }),
  },

  "mentor.me.completed": {
    eventType: "click",
    buildProperties: () => ({
      feature: "mentor-me",
      data: { action: "completed" },
    }),
  },

  "hero.right.viewed": {
    eventType: "view",
    buildProperties: pageViewProperties,
  },

  "page.viewed": {
    eventType: "view",
    buildProperties: pageViewProperties,
  },

  "coffee.with.me.viewed": {
    eventType: "view",
    buildProperties: pageViewProperties,
  },

  "navbar.home.clicked": {
    eventType: "click",
    buildProperties: () => ({
      feature: "navbar",
      data: { destination: "/" },
    }),
  },

  "work.with.me.clicked": {
    eventType: "click",
    buildProperties: deliveryProjectProperties,
  },

  "coffee.with.me.clicked": {
    eventType: "click",
    buildProperties: coffeeWithMeProperties,
  },

  "coffee.with.me.submitted": {
    eventType: "click",
    buildProperties: () => ({
      feature: "coffee-with-me",
      data: { action: "submitted" },
    }),
  },

  "coffee.with.me.completed": {
    eventType: "click",
    buildProperties: () => ({
      feature: "coffee-with-me",
      data: { action: "completed" },
    }),
  },

  "deliver.my.project.clicked": {
    eventType: "click",
    buildProperties: deliveryProjectProperties,
  },

  "deliver.my.project.viewed": {
    eventType: "view",
    buildProperties: pageViewProperties,
  },

  "deliver.my.project.completed": {
    eventType: "click",
    buildProperties: deliveryProjectProperties,
  },

  "ownership.audit.clicked": {
    eventType: "click",
    buildProperties: () => ({
      feature: "ownership-audit",
      data: { action: "clicked" },
    }),
  },

  "ownership.audit.viewed": {
    eventType: "view",
    buildProperties: pageViewProperties,
  },

  "ownership.audit.started": {
    eventType: "click",
    buildProperties: () => ({
      feature: "ownership-audit",
      data: { action: "started" },
    }),
  },

  "ownership.audit.completed": {
    eventType: "click",
    buildProperties: () => ({
      feature: "ownership-audit",
      data: { action: "completed" },
    }),
  },

  "ownership.toolkit.clicked": {
    eventType: "click",
    buildProperties: () => ({
      feature: "ownership-toolkit",
      data: { action: "clicked" },
    }),
  },

  "ownership.toolkit.viewed": {
    eventType: "view",
    buildProperties: pageViewProperties,
  },

  "ownership.toolkit.completed": {
    eventType: "click",
    buildProperties: () => ({
      feature: "ownership-toolkit",
      data: { action: "completed" },
    }),
  },

  "ownership.toolkit.downloaded": {
    eventType: "click",
    buildProperties: () => ({
      feature: "ownership-toolkit",
      data: { action: "downloaded" },
    }),
  },

  "ownership.learning.circle.clicked": {
    eventType: "click",
    buildProperties: () => ({
      feature: "ownership-learning-circle",
      data: { action: "open" },
    }),
  },

  "circle.view": {
    eventType: "view",
    buildProperties: pageViewProperties,
  },

  "circle.join.click": {
    eventType: "click",
    buildProperties: () => ({
      feature: "ownership-learning-circle",
      data: { action: "join" },
    }),
  },

  "circle.telegram.redirect": {
    eventType: "click",
    buildProperties: () => ({
      feature: "ownership-learning-circle",
      data: { action: "telegram-redirect" },
    }),
  },

  "testimonials.viewed": {
    eventType: "view",
    buildProperties: testimonialsViewProperties,
  },

  "testimonials.pagination.clicked": {
    eventType: "click",
    buildProperties: testimonialsPaginationProperties,
  },

  "testimonial.helpful.clicked": {
    eventType: "click",
    buildProperties: testimonialHelpfulProperties,
  },

  "testimonial.story.clicked": {
    eventType: "click",
    buildProperties: testimonialStoryProperties,
  },

  "case.studies.viewed": {
    eventType: "view",
    buildProperties: caseStudiesViewProperties,
  },

  "case.studies.pagination.clicked": {
    eventType: "click",
    buildProperties: caseStudiesPaginationProperties,
  },

  "case.study.details.clicked": {
    eventType: "click",
    buildProperties: caseStudyDetailsProperties,
  },

  "follow.us.viewed": {
    eventType: "view",
    buildProperties: followUsViewProperties,
  },

  "follow.us.clicked": {
    eventType: "click",
    buildProperties: followUsClickProperties,
  },

  "follow.us.whatsapp.clicked": {
    eventType: "click",
    buildProperties: () => followUsPlatformClickProperties("whatsapp"),
  },

  "follow.us.telegram.clicked": {
    eventType: "click",
    buildProperties: () => followUsPlatformClickProperties("telegram"),
  },

  "follow.us.linkedin.clicked": {
    eventType: "click",
    buildProperties: () => followUsPlatformClickProperties("linkedin"),
  },

  "follow.us.facebook.clicked": {
    eventType: "click",
    buildProperties: () => followUsPlatformClickProperties("facebook"),
  },

  "follow.us.youtube.clicked": {
    eventType: "click",
    buildProperties: () => followUsPlatformClickProperties("youtube"),
  },
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

  const { name, path } = request.body;

  const eventDefinition =
    typeof name === "string" && Object.hasOwn(eventDefinitions, name)
      ? eventDefinitions[name]
      : undefined;

  const expectedEventType = eventDefinition?.eventType;
  const eventType = expectedEventType;

  const validViewPath =
    expectedEventType !== "view" ||
    (typeof path === "string" &&
      path.startsWith("/") &&
      !path.startsWith("//") &&
      path.length <= 2048);

  const validationDiagnostic = {
    name: typeof name === "string" ? name.slice(0, 128) : null,
    bodyType: typeof request.body,
    eventType:
      typeof request.body.eventType === "string"
        ? request.body.eventType.slice(0, 32)
        : null,
    expectedEventType: expectedEventType ?? null,
    path: typeof path === "string" ? path.slice(0, 2048) : null,
    validViewPath,
    eventTypeIsUndefined: request.body.eventType === undefined,
  };

  if (
    !expectedEventType ||
    (request.body.eventType !== undefined &&
      request.body.eventType !== expectedEventType) ||
    !validViewPath
  ) {
    console.warn(validationDiagnostic);

    response.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "The analytics event is invalid.",
      },
      diagnostic: validationDiagnostic,
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
      properties: eventDefinition.buildProperties(path),
    });

    response.status(202).json({
      data: {
        accepted: true,
      },
    });
  } catch (error) {
    logger.error("Analytics event insert failed.", {
      service: "api",
      operation: "analytics_event_insert",
      eventName: name,
      databaseError: databaseErrorDetails(error),
    });
    next(error);
  }
});

export default router;
