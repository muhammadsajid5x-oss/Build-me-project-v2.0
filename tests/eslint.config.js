import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import tseslint from "typescript-eslint";

const configDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.turbo/**",
      "**/coverage/**",
      "**/storybook-static/**",
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: path.resolve(configDir, ".."),
      },
    },
  },
);
