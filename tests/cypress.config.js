import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    specPattern: "tests/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: false,
    baseUrl: "http://localhost:5173",

    setupNodeEvents(on, config) {
      return config;
    },
  },
});
