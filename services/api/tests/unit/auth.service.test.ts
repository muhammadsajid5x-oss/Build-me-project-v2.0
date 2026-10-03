import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const getUser = vi.fn();

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    auth: { getUser },
  })),
}));

const originalEnv = { ...process.env };

async function importAuthService() {
  vi.resetModules();
  process.env.SUPABASE_URL = "https://example.supabase.co";
  process.env.SUPABASE_KEY = "test-key";
  return import("../../src/auth/auth.service.js");
}

describe("authenticateAccessToken", () => {
  beforeEach(() => {
    getUser.mockReset();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("returns null when supabase reports an error", async () => {
    const { authenticateAccessToken } = await importAuthService();
    getUser.mockResolvedValue({
      data: { user: null },
      error: { message: "invalid token" },
    });

    await expect(authenticateAccessToken("bad-token")).resolves.toBeNull();
    expect(getUser).toHaveBeenCalledWith("bad-token");
  });

  it("returns null when no user is returned", async () => {
    const { authenticateAccessToken } = await importAuthService();
    getUser.mockResolvedValue({ data: { user: null }, error: null });

    await expect(authenticateAccessToken("token")).resolves.toBeNull();
  });

  it("omits the email property when the user has none", async () => {
    const { authenticateAccessToken } = await importAuthService();
    getUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });

    await expect(authenticateAccessToken("token")).resolves.toEqual({
      id: "user-1",
      isAdmin: false,
    });
  });

  it("returns the id and email on success", async () => {
    const { authenticateAccessToken } = await importAuthService();
    getUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "user@example.com" } },
      error: null,
    });

    await expect(authenticateAccessToken("token")).resolves.toEqual({
      id: "user-1",
      email: "user@example.com",
      isAdmin: false,
    });
  });

  it("derives admin access from server-managed app metadata only", async () => {
    const { authenticateAccessToken } = await importAuthService();
    getUser.mockResolvedValue({
      data: {
        user: {
          id: "admin-1",
          app_metadata: { role: "admin" },
          user_metadata: { role: "admin" },
        },
      },
      error: null,
    });

    await expect(authenticateAccessToken("token")).resolves.toEqual({
      id: "admin-1",
      isAdmin: true,
    });
  });

  it("throws when SUPABASE_URL is not configured", async () => {
    process.env.SUPABASE_URL = "";
    process.env.SUPABASE_KEY = "test-key";
    vi.resetModules();

    const { authenticateAccessToken } =
      await import("../../src/auth/auth.service.js");

    await expect(authenticateAccessToken("token")).rejects.toThrow(
      "SUPABASE_URL is not configured.",
    );
  });

  it("throws when SUPABASE_KEY is not configured", async () => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_KEY = "";
    vi.resetModules();

    const { authenticateAccessToken } =
      await import("../../src/auth/auth.service.js");

    await expect(authenticateAccessToken("token")).rejects.toThrow(
      "SUPABASE_KEY is not configured.",
    );
  });
});
