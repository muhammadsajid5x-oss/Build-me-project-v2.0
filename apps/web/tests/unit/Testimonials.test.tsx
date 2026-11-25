import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import Testimonials from "../../src/components/Testimonials";
import testimonialsContent from "../../src/content/testimonials.json";

const originalFetch = globalThis.fetch;
const originalRequestAnimationFrame = globalThis.requestAnimationFrame;

const createContentWithReviews = (reviewCount: number) => ({
  ...testimonialsContent,
  reviews: Array.from({ length: reviewCount }, (_, index) => ({
    ...testimonialsContent.reviews[0],
    id: `review-${index + 1}`,
    name: `Review ${index + 1}`,
    content: `Review content ${index + 1}`,
  })),
});

afterEach(() => {
  vi.stubGlobal("fetch", originalFetch);
  vi.stubGlobal("requestAnimationFrame", originalRequestAnimationFrame);
});

describe("Testimonials", () => {
  it("keeps the overall rating and starter review together in one card", () => {
    render(<Testimonials content={testimonialsContent} />);

    const reviewCard = screen.getByText("Starter Review").closest("article");

    expect(reviewCard).not.toBeNull();
    if (!reviewCard) {
      throw new Error("The starter review card was not rendered.");
    }

    expect(within(reviewCard).getByText("Overall Rating")).toBeInTheDocument();
    expect(within(reviewCard).getByText("5.0")).toBeInTheDocument();
    expect(
      within(reviewCard).getAllByLabelText("5 out of 5 stars"),
    ).toHaveLength(2);
    expect(reviewCard.querySelector("blockquote")).toHaveTextContent(
      testimonialsContent.reviews[0].content,
    );
  });

  it("renders four JSON reviews per page and paginates dynamically", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("requestAnimationFrame", vi.fn());

    render(<Testimonials content={createContentWithReviews(6)} />);

    expect(screen.getAllByRole("article")).toHaveLength(4);
    expect(screen.getByText("Review 1")).toBeInTheDocument();
    expect(screen.getByText("Review 4")).toBeInTheDocument();
    expect(screen.queryByText("Review 5")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "2" }));

    expect(await screen.findByText("Review 5")).toBeInTheDocument();
    expect(screen.getByText("Review 6")).toBeInTheDocument();
    expect(screen.queryByText("Review 1")).not.toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(2);
    expect(
      fetchMock.mock.calls.some(([url]) =>
        String(url).includes("/api/v1/testimonials"),
      ),
    ).toBe(false);

    await waitFor(() => {
      const analyticsRequest = fetchMock.mock.calls.find(([url]) =>
        String(url).includes("/api/v1/analytics/events"),
      );
      const body = analyticsRequest?.[1]?.body as URLSearchParams | undefined;

      expect(body?.get("name")).toBe("testimonials.pagination.clicked");
    });
  });

  it("hides pagination when the JSON source fits on one page", () => {
    render(<Testimonials content={testimonialsContent} />);

    expect(
      screen.queryByRole("navigation", { name: "Testimonials pagination" }),
    ).not.toBeInTheDocument();
  });
});
