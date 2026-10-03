const path = require("node:path");

module.exports = {
  rootDir: path.resolve(__dirname, ".."),
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "jsdom",
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  roots: ["<rootDir>/tests", "<rootDir>/packages/ui/tests"],
  testMatch: ["**/*.jest.test.ts", "**/*.jest.test.tsx"],
  setupFiles: ["<rootDir>/tests/jest.setup.ts"],
  resolver: "<rootDir>/tests/jest.resolver.cjs",
  moduleNameMapper: {
    "^@build-me/utils/logging$":
      "<rootDir>/packages/utils/src/logging/logger.ts",
    "^.+\\.(css|scss|sass)$": "<rootDir>/tests/integration/mocks/styleMock.js",
  },
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/storybook-static/"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "<rootDir>/tests/tsconfig.jest.json",
      },
    ],
  },
};
