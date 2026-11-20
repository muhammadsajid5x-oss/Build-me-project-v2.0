import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import Testimonials from "../../src/components/Testimonials";

const originalFetch = globalThis.fetch;

const testimonialsPageOne = {
  data: [
    {
      id: "1",
      name: "Ayesha Khan",
      role: "Product Manager",
      company: "Tech Company",
      avatar: null,
      category: "Technology",
      content: "Excellent collaboration and strong technical delivery.",
      rating: 5,
      helpfulCount: 3,
      storyUrl: null,
      verified: true,
      published: true,
      createdAt: "2026-10-01T00:00:00.000Z",
    },
    {
      id: "2",
      name: "Bilal Ahmed",
      role: "Founder",
      company: "Startup",
      avatar: null,
      category: "Technology",
      content: "Professional, reliable, and technically strong.",
      rating: 5,
      helpfulCount: 2,
      storyUrl: null,
      verified: true,
      published: true,
      createdAt: "2026-10-02T00:00:00.000Z",
    },
    {
      id: "3",
      name: "Sarah Malik",
      role: "Engineering Lead",
      company: "Software Company",
      avatar: null,
      category: "Engineering",
      content: "A great technical partner from planning through delivery.",
      rating: 5,
      helpfulCount: 5,
      storyUrl: null,
      verified: true,
      published: true,
      createdAt: "2026-10-03T00:00:00.000Z",
    },
    {
      id: "4",
      name: "Usman Raza",
      role: "CTO",
      company: "Digital Company",
      avatar: null,
      category: "Technology",
      content: "Strong ownership and dependable engineering execution.",
      rating: 5,
      helpfulCount: 1,
      storyUrl: null,
      verified: true,
      published: true,
      createdAt: "2026-10-04T00:00:00.000Z",
    },
  ],
  pagination: {
    page: 1,
    limit: 4,
    total: 6,
    totalPages: 2,
  },
};

const testimonialsPageTwo = {
  data: [
    {
      id: "5",
      name: "Hassan Ali",
      role: "Business Owner",
      company: "Business",
      avatar: null,
      category: "Delivery",
      content: "Clear communication and excellent delivery.",
      rating: 5,
      helpfulCount: 4,
      storyUrl: null,
      verified: true,
      published: true,
      createdAt: "2026-10-05T00:00:00.000Z",
    },
    {
      id: "6",
      name: "Maria Iqbal",
      role: "Project Lead",
      company: "Technology Company",
      avatar: null,
      category: "Engineering",
      content: "A reliable and thoughtful technical collaborator.",
      rating: 5,
      helpfulCount: 2,
      storyUrl: null,
      verified: true,
      published: true,
      createdAt: "2026-10-06T00:00:00.000Z",
    },
  ],
  pagination: {
    page: 2,
    limit: 4,
    total: 6,
    totalPages: 2,
  },
};

const createTestimonialsFetchMock = () =>
  vi.fn().mockImplementation(async (input: RequestInfo | URL) => {
    const url = String(input);

    if (url.includes("/api/v1/testimonials")) {
      if (url.includes("page=2")) {
        return {
          ok: true,
          json: async () => testimonialsPageTwo,
        };
      }

      return {
        ok: true,
        json: async () => testimonialsPageOne,
      };
    }

    if (url.includes("/api/v1/analytics/events")) {
      return {
        ok: true,
      };
    }

    return {
      ok: true,
    };
  });

const analyticsCalls = (fetchMock: ReturnType<typeof vi.fn>) =>
  fetchMock.mock.calls.filter((call) =>
    String(call[0]).includes("/api/v1/analytics/events"),
  );

const eventNameOf = (call: unknown[]) => {
  const options = call[1] as { body?: URLSearchParams } | undefined;
  const body = options?.body;

  return body instanceof URLSearchParams ? body.get("name") : undefined;
};

describe("Testimonials", () => {
  afterEach(() => {
    vi.stubGlobal("fetch", originalFetch);
  });

  it("renders four testimonial cards on the first page", async () => {
    const fetchMock = createTestimonialsFetchMock();

    vi.stubGlobal("fetch", fetchMock);

    render(<Testimonials />);

    expect(await screen.findByText("Ayesha Khan")).toBeInTheDocument();
    expect(screen.getByText("Bilal Ahmed")).toBeInTheDocument();
    expect(screen.getByText("Sarah Malik")).toBeInTheDocument();
    expect(screen.getByText("Usman Raza")).toBeInTheDocument();

    expect(screen.queryByText("Hassan Ali")).not.toBeInTheDocument();
    expect(screen.queryByText("Maria Iqbal")).not.toBeInTheDocument();
  });

  it("requests the first page with a page size of four", async () => {
    const fetchMock = createTestimonialsFetchMock();

    vi.stubGlobal("fetch", fetchMock);

    render(<Testimonials />);

    await screen.findByText("Ayesha Khan");

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/testimonials?page=1&limit=4"),
      expect.any(Object),
    );
  });

  it("disables Previous on the first page", async () => {
    const fetchMock = createTestimonialsFetchMock();

    vi.stubGlobal("fetch", fetchMock);

    render(<Testimonials />);

    await screen.findByText("Ayesha Khan");

    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();

    expect(screen.getByRole("button", { name: "Next" })).not.toBeDisabled();
  });

  it("loads the second page when Next is clicked", async () => {
    const fetchMock = createTestimonialsFetchMock();

    vi.stubGlobal("fetch", fetchMock);

    render(<Testimonials />);

    await screen.findByText("Ayesha Khan");

    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(await screen.findByText("Hassan Ali")).toBeInTheDocument();
    expect(screen.getByText("Maria Iqbal")).toBeInTheDocument();

    expect(screen.queryByText("Ayesha Khan")).not.toBeInTheDocument();

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/testimonials?page=2&limit=4"),
      expect.any(Object),
    );
  });

  it("disables Next on the last page and enables Previous", async () => {
    const fetchMock = createTestimonialsFetchMock();

    vi.stubGlobal("fetch", fetchMock);

    render(<Testimonials />);

    await screen.findByText("Ayesha Khan");

    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    await screen.findByText("Hassan Ali");

    expect(screen.getByRole("button", { name: "Previous" })).not.toBeDisabled();

    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });

  it("returns to the first page when Previous is clicked", async () => {
    const fetchMock = createTestimonialsFetchMock();

    vi.stubGlobal("fetch", fetchMock);

    render(<Testimonials />);

    await screen.findByText("Ayesha Khan");

    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    await screen.findByText("Hassan Ali");

    fireEvent.click(screen.getByRole("button", { name: "Previous" }));

    expect(await screen.findByText("Ayesha Khan")).toBeInTheDocument();
    expect(screen.queryByText("Hassan Ali")).not.toBeInTheDocument();

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/testimonials?page=1&limit=4"),
      expect.any(Object),
    );
  });

  it("shows the empty state when no testimonials are available", async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(async (input: RequestInfo | URL) => {
        const url = String(input);

        if (url.includes("/api/v1/testimonials")) {
          return {
            ok: true,
            json: async () => ({
              data: [],
              pagination: {
                page: 1,
                limit: 4,
                total: 0,
                totalPages: 0,
              },
            }),
          };
        }

        return {
          ok: true,
        };
      });

    vi.stubGlobal("fetch", fetchMock);

    render(<Testimonials />);

    expect(
      await screen.findByText("No testimonials are currently available."),
    ).toBeInTheDocument();
  });

  it("shows the error state when the testimonials request fails", async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(async (input: RequestInfo | URL) => {
        const url = String(input);

        if (url.includes("/api/v1/testimonials")) {
          return {
            ok: false,
          };
        }

        return {
          ok: true,
        };
      });

    vi.stubGlobal("fetch", fetchMock);

    render(<Testimonials />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Testimonials are temporarily unavailable.",
    );
  });

  it("tracks testimonials.pagination.clicked when pagination is used", async () => {
    const fetchMock = createTestimonialsFetchMock();

    vi.stubGlobal("fetch", fetchMock);

    render(<Testimonials />);

    await screen.findByText("Ayesha Khan");

    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    await screen.findByText("Hassan Ali");

    await waitFor(() => {
      const names = analyticsCalls(fetchMock).map(eventNameOf);

      expect(names).toContain("testimonials.pagination.clicked");
    });
  });
});
