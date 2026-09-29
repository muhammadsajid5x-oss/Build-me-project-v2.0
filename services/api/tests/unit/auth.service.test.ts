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
    });
  });

  it("throws when SUPABASE_URL is not configured", async () => {
    process.env.SUPABASE_URL = "";
    process.env.SUPABASE_KEY = "test-key";
    vi.resetModules();

    await expect(import("../../src/auth/auth.service.js")).rejects.toThrow(
      "SUPABASE_URL is not configured.",
    );
  });

  it("throws when SUPABASE_KEY is not configured", async () => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_KEY = "";
    vi.resetModules();

    await expect(import("../../src/auth/auth.service.js")).rejects.toThrow(
      "SUPABASE_KEY is not configured.",
    );
  });
});
