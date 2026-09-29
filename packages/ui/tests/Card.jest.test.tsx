import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { Card, CardBody, CardFooter, CardHeader } from "../src/components/Card";

describe("Card component", () => {
  it("renders its header, body, and footer content", () => {
    render(
      <Card>
        <CardHeader>Card heading</CardHeader>
        <CardBody>Card content</CardBody>
        <CardFooter>Card footer</CardFooter>
      </Card>,
    );

    expect(screen.getByRole("article")).toBeInTheDocument();
    expect(screen.getByText("Card heading")).toBeInTheDocument();
    expect(screen.getByText("Card content")).toBeInTheDocument();
    expect(screen.getByText("Card footer")).toBeInTheDocument();
  });

  it.each(["default", "loading", "empty", "error", "disabled"] as const)(
    "supports the %s state",
    (state) => {
      render(<Card state={state}>State content</Card>);

      const card = screen.getByRole("article");
      expect(card).toHaveAttribute("data-state", state);
      expect(card).toHaveClass(`ui-card--${state}`);

      if (state === "loading") {
        expect(card).toHaveAttribute("aria-busy", "true");
      }

      if (state === "disabled") {
        expect(card).toHaveAttribute("inert");
      }
    },
  );

  it.each(["small", "medium", "large"] as const)(
    "supports the %s size",
    (size) => {
      render(<Card size={size}>Sized content</Card>);

      const card = screen.getByRole("article");
      expect(card).toHaveAttribute("data-size", size);
      expect(card).toHaveClass(`ui-card--${size}`);
    },
  );

  it("allows actions in the footer to respond to clicks", () => {
    const onAction = jest.fn();
    render(
      <Card>
        <CardBody>Content</CardBody>
        <CardFooter>
          <button type="button" onClick={onAction}>
            Continue
          </button>
        </CardFooter>
      </Card>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
