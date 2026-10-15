import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "../../src/App";

describe("Web App", () => {
  it("renders the home page at the root route", async () => {
    window.history.pushState({}, "", "/");

    render(<App />);

    expect(
      await screen.findByRole("heading", { name: /Build Better/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Simple, fast, and beautiful platforms/i),
    ).toBeInTheDocument();
  });
});
