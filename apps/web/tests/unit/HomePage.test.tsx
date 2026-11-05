import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import HomePage from "../../src/pages/HomePage";

const originalFetch = globalThis.fetch;

const analyticsCalls = (fetchMock: ReturnType<typeof vi.fn>) =>
  fetchMock.mock.calls.filter((call) =>
    String(call[0]).includes("/api/v1/analytics/events"),
  );

const eventNameOf = (call: unknown[]) => {
  const options = call[1] as { body?: URLSearchParams } | undefined;
  const body = options?.body;

  return body instanceof URLSearchParams ? body.get("name") : undefined;
};

describe("HomePage", () => {
  afterEach(() => {
    // Only the fetch stub is restored. `vi.unstubAllGlobals()` would also
    // remove the IntersectionObserver stub installed by the test setup, which
    // the hero components rely on.
    vi.stubGlobal("fetch", originalFetch);
  });

  it("renders exactly one primary Work With Me call to action", () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    const callToAction = screen.getByRole("button", { name: "Work With Me" });

    expect(callToAction).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: "Work With Me" }),
    ).toHaveLength(1);
  });

  it("does not render the Impact Card before the call to action is used", () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /Deliver My Project/i }),
    ).not.toBeInTheDocument();
  });

  it("tracks work.with.me.clicked when the call to action is used", () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Work With Me" }));

    const calls = analyticsCalls(fetchMock);

    expect(calls).toHaveLength(1);
    expect(eventNameOf(calls[0])).toBe("work.with.me.clicked");
  });

  it("opens the Impact Card when the call to action is used", () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Work With Me" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Deliver My Project/i }),
    ).toBeInTheDocument();
  });

  it("tracks deliver.my.project.clicked when the Deliver My Project choice is used", () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Work With Me" }));
    fireEvent.click(screen.getByRole("link", { name: /Deliver My Project/i }));

    const names = analyticsCalls(fetchMock).map(eventNameOf);

    expect(names).toContain("deliver.my.project.clicked");
  });

  it("does not track the Work With Me events before the call to action is used", () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(analyticsCalls(fetchMock)).toHaveLength(0);
  });

  it("opens the Deliver My Project journey when the choice is used", () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/deliver-my-project"
            element={<h1>Deliver My Project journey</h1>}
          />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Work With Me" }));
    fireEvent.click(screen.getByRole("link", { name: /Deliver My Project/i }));

    expect(
      screen.getByRole("heading", { name: "Deliver My Project journey" }),
    ).toBeInTheDocument();
  });

  it("does not create a delivery request from the Work With Me call to action", () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Work With Me" }));

    const requestCalls = fetchMock.mock.calls.filter((call) =>
      String(call[0]).includes("/api/v1/delivery-project-requests"),
    );

    expect(requestCalls).toHaveLength(0);
  });
});
