import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "../tests/integration",
  testMatch: "**/*.integration.spec.ts",
  webServer: {
    command: "pnpm --filter @build-me/api exec tsx src/server.ts",
    url: "http://127.0.0.1:3000/health",
    env: {
      NODE_ENV: "test",
      PORT: "3000",
    },
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
