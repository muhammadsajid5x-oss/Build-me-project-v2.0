import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import tseslint from "typescript-eslint";

const configDir = path.dirname(fileURLToPath(import.meta.url));

const nodeGlobals = {
  process: "readonly",
  console: "readonly",
  URL: "readonly",
  fetch: "readonly",
  AbortSignal: "readonly",
  __dirname: "readonly",
  module: "readonly",
  require: "readonly",
  exports: "readonly",
};

export default defineConfig(
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.turbo/**",
      "**/.vercel/**",
      "**/coverage/**",
      "**/storybook-static/**",
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: nodeGlobals,
      parserOptions: {
        tsconfigRootDir: path.resolve(configDir, ".."),
      },
    },
  },
);
