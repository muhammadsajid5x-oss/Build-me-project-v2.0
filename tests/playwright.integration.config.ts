import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "@playwright/test";

const isCI = process.env.CI === "true";
const localEnvPath = fileURLToPath(
  new URL("../.env.test.local", import.meta.url),
);

if (!isCI && !process.env.TEST_DATABASE_URL && existsSync(localEnvPath)) {
  process.loadEnvFile(localEnvPath);
}

const databaseUrl = isCI
  ? process.env.DATABASE_URL
  : process.env.TEST_DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    isCI
      ? "DATABASE_URL must point to the CI test database."
      : "TEST_DATABASE_URL must point to a disposable local test database.",
  );
}

if (
  !isCI &&
  !["localhost", "127.0.0.1", "[::1]"].includes(
    new URL(databaseUrl).hostname.toLowerCase(),
  )
) {
  throw new Error("TEST_DATABASE_URL must use a local PostgreSQL host.");
}

process.env.DATABASE_URL = databaseUrl;

export default defineConfig({
  testDir: "../tests/integration",
  testMatch: "**/*.integration.spec.ts",
  webServer: {
    command: "pnpm --filter @build-me/api exec tsx src/server.ts",
    url: "http://127.0.0.1:3000/health",
    env: {
      NODE_ENV: "test",
      PORT: "3000",
      DATABASE_URL: databaseUrl,
    },
    reuseExistingServer: isCI,
    timeout: 120_000,
  },
});
