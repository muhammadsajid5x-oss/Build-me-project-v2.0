import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
}));

vi.mock("../../src/auth/AuthContext", () => ({
  useAuth: mocks.useAuth,
}));

import ProtectedRoute from "../../src/auth/ProtectedRoute";

function renderProtectedRoute(user: { id: string; app_metadata?: Record<string, unknown> } | null) {
  mocks.useAuth.mockReturnValue({
    loading: false,
    user,
    error: null,
    signOut: vi.fn(),
  });

  return render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/login" element={<p>Login page</p>} />
        <Route path="/" element={<ProtectedRoute />}>
          <Route index element={<p>Dashboard content</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects signed-out visitors to login", () => {
    renderProtectedRoute(null);

    expect(screen.getByText("Login page")).toBeTruthy();
  });

  it("denies signed-in users without the admin claim", () => {
    renderProtectedRoute({ id: "user-1", app_metadata: { role: "user" } });

    expect(screen.getByText("Access denied")).toBeTruthy();
    expect(screen.queryByText("Dashboard content")).toBeNull();
  });

  it("renders the dashboard for an admin claim", () => {
    renderProtectedRoute({ id: "admin-1", app_metadata: { role: "admin" } });

    expect(screen.getByText("Dashboard content")).toBeTruthy();
  });
});