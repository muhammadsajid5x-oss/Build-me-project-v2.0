import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import Testimonials from "../../src/components/Testimonials";
import testimonialsContent from "../../src/content/testimonials.json";

const originalFetch = globalThis.fetch;
const originalIntersectionObserver = globalThis.IntersectionObserver;

const createReview = (index: number) => ({
  id: `review-${index + 1}`,
  name: `Review ${index + 1}`,
  role: null,
  company: null,
  location: null,
  source: "client-work",
  category: "Deliver My Project",
  tags: ["Project Delivery", "Technical Execution", "Delivery Clarity"],
  rating: 5,
  communications: null,
  timelines: null,
  knowledge: null,
  value: null,
  content: `Review content ${index + 1}`,
  outcome: "30% Faster Delivery Planning",
  verified: true,
});

const createContentWithReviews = (reviewCount: number) => ({
  ...testimonialsContent,
  reviews: Array.from({ length: reviewCount }, (_, index) =>
    createReview(index),
  ),
});

afterEach(() => {
  vi.stubGlobal("fetch", originalFetch);
  vi.stubGlobal("IntersectionObserver", originalIntersectionObserver);
  vi.restoreAllMocks();
});

describe("Testimonials", () => {
  it("shows the empty testimonial state when there are no live reviews", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: [],
        }),
      }),
    );

    render(<Testimonials content={testimonialsContent} />);

    expect(
      await screen.findByText("No approved testimonials yet."),
    ).toBeInTheDocument();

    expect(screen.queryByText("Demo Sample")).not.toBeInTheDocument();
  });

  it("renders four live reviews per page and paginates dynamically", async () => {
    const reviews = Array.from({ length: 6 }, (_, index) =>
      createReview(index),
    );

    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/api/v1/testimonials")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            data: reviews,
          }),
        });
      }

      if (url.includes("/api/v1/case-studies")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            data: [],
          }),
        });
      }

      if (url.includes("/api/v1/analytics/events")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({}),
        });
      }

      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<Testimonials content={createContentWithReviews(0)} />);

    expect(await screen.findByText("Review 1")).toBeInTheDocument();
    expect(screen.getByText("Review 4")).toBeInTheDocument();
    expect(screen.queryByText("Review 5")).not.toBeInTheDocument();

    expect(screen.getAllByRole("article")).toHaveLength(4);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Go to page 2",
      }),
    );

    expect(await screen.findByText("Review 5")).toBeInTheDocument();
    expect(screen.getByText("Review 6")).toBeInTheDocument();

    expect(screen.queryByText("Review 1")).not.toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(2);

    await waitFor(() => {
      const analyticsRequest = fetchMock.mock.calls.find(([url]) =>
        String(url).includes("/api/v1/analytics/events"),
      );

      expect(analyticsRequest).toBeDefined();
    });
  });

  it("shows the calculated average rating from live reviews", async () => {
    const reviews = [
      {
        ...createReview(0),
        rating: 5,
      },
      {
        ...createReview(1),
        rating: 4,
      },
    ];

    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.includes("/api/v1/testimonials")) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              data: reviews,
            }),
          });
        }

        if (url.includes("/api/v1/case-studies")) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              data: [],
            }),
          });
        }

        return Promise.resolve({
          ok: true,
          json: async () => ({}),
        });
      }),
    );

    render(<Testimonials content={testimonialsContent} />);

    expect(await screen.findByText("4.5")).toBeInTheDocument();
    expect(screen.getByText("2 Reviews")).toBeInTheDocument();
  });

  it("does not render a demo testimonial", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: [],
        }),
      }),
    );

    render(<Testimonials content={testimonialsContent} />);

    await waitFor(() => {
      expect(
        screen.getByText("No approved testimonials yet."),
      ).toBeInTheDocument();
    });

    expect(screen.queryByText("Starter Review")).not.toBeInTheDocument();
    expect(screen.queryByText("Demo Sample")).not.toBeInTheDocument();
  });
});
