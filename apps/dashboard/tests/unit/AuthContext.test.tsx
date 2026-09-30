import { act, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("@build-me/services/integrations", () => ({
  getSession: mocks.getSession,
  onAuthStateChange: mocks.onAuthStateChange,
  signOut: mocks.signOut,
}));

import { AuthProvider, useAuth } from "../../src/auth/AuthContext";

function AuthConsumer() {
  const { loading, user, error } = useAuth();

  if (loading) {
    return <div>Loading authentication...</div>;
  }

  if (error) {
    return <div role="alert">{error}</div>;
  }

  return <div>{user ? `Authenticated: ${user.id}` : "Unauthenticated"}</div>;
}

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.getSession.mockResolvedValue(null);

    mocks.onAuthStateChange.mockReturnValue({
      data: {
        subscription: {
          unsubscribe: vi.fn(),
        },
      },
    });
  });

  it("starts in a loading state", () => {
    mocks.getSession.mockImplementation(() => new Promise(() => undefined));

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    expect(screen.getByText("Loading authentication...")).toBeTruthy();
  });

  it("loads an unauthenticated state when no session exists", async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Unauthenticated")).toBeTruthy();
    });
  });

  it("loads an authenticated session", async () => {
    mocks.getSession.mockResolvedValue({
      access_token: "test-token",
      user: {
        id: "user-123",
        email: "user@example.com",
      },
    });

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Authenticated: user-123")).toBeTruthy();
    });
  });

  it("uses a safe error when session loading fails", async () => {
    mocks.getSession.mockRejectedValue(
      new Error("Database password: super-secret"),
    );

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByText("Unable to load your session. Please try again."),
      ).toBeTruthy();
    });

    expect(screen.queryByText(/super-secret/)).toBeNull();
  });

  it("does not update state when unmounted before the session resolves", async () => {
    let resolveSession: (value: unknown) => void = () => undefined;
    mocks.getSession.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSession = resolve;
        }),
    );

    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const { unmount } = render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    unmount();

    await act(async () => {
      resolveSession({
        access_token: "late-token",
        user: { id: "user-999" },
      });
    });

    const stateUpdateWarnings = consoleError.mock.calls.filter((call) =>
      String(call[0]).includes(
        "state update on an unmounted component",
      ),
    );

    expect(stateUpdateWarnings).toHaveLength(0);

    consoleError.mockRestore();
  });

  it("unsubscribes from auth state changes on unmount", () => {
    const unsubscribe = vi.fn();
    mocks.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe } },
    });

    const { unmount } = render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    unmount();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
