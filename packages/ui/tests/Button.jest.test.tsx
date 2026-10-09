import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { Button } from "../src";
describe("Button component states", () => {
  it("renders the primary state", () => {
    render(
      <Button variant="primary">
        Primary Button
      </Button>,
    );
    expect(
      screen.getByRole("button", { name: "Primary Button" }),
    ).toBeInTheDocument();
  });
  it("renders the secondary state", () => {
    render(
      <Button variant="secondary">
        Secondary Button
      </Button>,
    );
    expect(
      screen.getByRole("button", { name: "Secondary Button" }),
    ).toBeInTheDocument();
  });
});
