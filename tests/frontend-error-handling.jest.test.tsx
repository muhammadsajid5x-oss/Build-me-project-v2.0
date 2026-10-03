import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import EmptyState from "../apps/web/src/components/EmptyState";
import ErrorState from "../apps/web/src/components/ErrorState";
import LoadingState from "../apps/web/src/components/LoadingState";
describe("Frontend error handling states", () => {
  it("shows the loading state", () => {
    render(<LoadingState />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading...");
  });
  it("shows the empty state", () => {
    render(<EmptyState />);
    expect(screen.getByRole("status")).toHaveTextContent("No data available.");
  });
  it("shows the error state", () => {
    render(<ErrorState message="Failed to load data." />);
    expect(screen.getByRole("alert")).toHaveTextContent("Failed to load data.");
  });
  it("supports retry from the error state", () => {
    const onRetry = jest.fn();
    render(<ErrorState message="Failed to load data." onRetry={onRetry} />);
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
