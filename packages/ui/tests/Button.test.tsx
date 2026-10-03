import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "../src";

describe("Button", () => {
  it("renders button text", () => {
    render(<Button>Click Me</Button>);

    expect(
      screen.getByRole("button", { name: "Click Me" }),
    ).toBeInTheDocument();
  });
});
