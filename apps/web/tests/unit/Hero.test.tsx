import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import HeroLeft from "../../src/components/Hero/hero-left";

describe("HeroLeft", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the Technology Ownership hero content", () => {
    class MockIntersectionObserver {
      observe = vi.fn();
      disconnect = vi.fn();

      constructor() {}
    }

    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

    render(<HeroLeft />);

    expect(screen.getByText("TECHNOLOGY OWNERSHIP")).toBeInTheDocument();
    expect(screen.getByText("Build Better")).toBeInTheDocument();
    expect(screen.getByText("Digital Experiences")).toBeInTheDocument();
    expect(
      screen.getByText(/Simple, fast, and beautiful platforms/),
    ).toBeInTheDocument();
  });

  it("tracks hero.viewed when the hero becomes visible", () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    let intersectionCallback: IntersectionObserverCallback | undefined;

    class MockIntersectionObserver {
      observe = vi.fn();
      disconnect = vi.fn();

      constructor(callback: IntersectionObserverCallback) {
        intersectionCallback = callback;
      }
    }

    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

    render(<HeroLeft />);

    intersectionCallback?.(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/v1/analytics/events",
      {
        method: "POST",
        body: new URLSearchParams({
          name: "hero.viewed",
          eventType: "view",
          path: "/",
        }),
        keepalive: true,
      },
    );
  });
});
