import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: "**/*.spec.ts",
  workers: 1,
  use: {
    extraHTTPHeaders: {
      "x-security-test": "true",
    },
  },
});
