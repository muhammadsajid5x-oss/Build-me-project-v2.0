import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

import { getApiBaseUrl } from "../../src/api-url";
import Navbar from "../../src/components/Navbar/Navbar";

describe("Navbar", () => {
  it("removes trailing slashes from the configured API URL", () => {
    expect(getApiBaseUrl("https://api.example.com///")).toBe(
      "https://api.example.com",
    );
  });

  it("renders the Cup&Commit logo", () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );

    const logo = screen.getByRole("img", { name: "Cup&Commit" });
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("src", "/Logo.png");
  });

  it("provides Home navigation through the logo", () => {
    render(
      <MemoryRouter initialEntries={["/route-test"]}>
        <Navbar />
      </MemoryRouter>,
    );

    const homeLink = screen.getByRole("link", { name: "Go to Home" });

    expect(homeLink).toHaveAttribute("href", "/");
  });

  it("tracks Home navigation without waiting for analytics", () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    try {
      render(
        <MemoryRouter initialEntries={["/route-test"]}>
          <Navbar />
        </MemoryRouter>,
      );

      fireEvent.click(screen.getByRole("link", { name: "Go to Home" }));

      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:3000/api/v1/analytics/events",
        {
          method: "POST",
          body: new URLSearchParams({ name: "navbar.home.clicked" }),
          keepalive: true,
        },
      );
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("uses sticky positioning", () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );

    const navbar = screen.getByRole("banner");

    expect(navbar).toHaveClass("sticky");
    expect(navbar).toHaveClass("top-0");
  });

  it("keeps the logo within the responsive navigation layout", () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );

    const logo = screen.getByRole("img", { name: "Cup&Commit" });

    expect(logo).toHaveClass("w-auto");
    expect(logo).toHaveClass("max-w-50");
  });
});
