import express from "express";

import authRoutes from "./routes/auth.js";
import foundationCheckinRoutes from "./routes/foundation-checkins.js";
import healthRoutes from "./routes/health.js";

import {
  apiRateLimiter,
  errorHandler,
  securityHeaders,
} from "./middleware/index.js";

const app = express();

app.set("trust proxy", 1);
app.disable("x-powered-by");

// Prevent API responses from being stored or cached.
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

app.use(securityHeaders);

app.use(
  express.json({
    limit: "1mb",
  }),
);

app.use(
  express.urlencoded({
    extended: false,
    limit: "1mb",
  }),
);

app.use(apiRateLimiter);

app.get("/", (_req, res) => {
  res.json({
    name: "Build Me API",
    status: "running",
  });
});

app.use("/health", healthRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/foundation-checkins", foundationCheckinRoutes);

app.use((_request, _response, next) => {
  next(new Error("NOT_FOUND"));
});

app.use(errorHandler);

export default app;
