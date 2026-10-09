import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { ApiClient } from "../../api-clients/apiClient";
describe("ApiClient security foundation", () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });
  it("rejects an empty API base URL", () => {
    expect(
      () =>
        new ApiClient({
          baseUrl: "   ",
        }),
    ).toThrow("API base URL is required.");
  });
  it("rejects an invalid API base URL", () => {
    expect(
      () =>
        new ApiClient({
          baseUrl: "not-a-url",
        }),
    ).toThrow("API base URL must be a valid URL.");
  });
  it("rejects unsupported API URL protocols", () => {
    expect(
      () =>
        new ApiClient({
          baseUrl: "ftp://api.example.com",
        }),
    ).toThrow("API base URL must use HTTP or HTTPS.");
  });
  it("adds a bearer token when an access token is available", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            ok: true,
          },
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );
    const client = new ApiClient({
      baseUrl: "https://api.example.com/",
      getAccessToken: async () => "test-access-token",
    });
    await client.get("/api/v1/profile");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/api/v1/profile",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer test-access-token",
        }),
      }),
    );
  });
  it("does not add an authorization header when no token exists", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            ok: true,
          },
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );
    const client = new ApiClient({
      baseUrl: "https://api.example.com",
      getAccessToken: async () => null,
    });
    await client.get("/health");
    const requestOptions = fetchMock.mock.calls[0]?.[1];
    expect(requestOptions.headers).not.toHaveProperty("Authorization");
  });
  it("parses structured API errors safely", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          error: {
            code: "VALIDATION_ERROR",
            message: "The request contains invalid fields.",
            details: [
              {
                field: "name",
                message: "Name is required.",
              },
            ],
          },
        }),
        {
          status: 422,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );
    const client = new ApiClient({
      baseUrl: "https://api.example.com",
    });
    await expect(client.get("/api/v1/projects")).rejects.toEqual({
      code: "VALIDATION_ERROR",
      message: "The request contains invalid fields.",
      status: 422,
    });
  });
  it("uses a safe fallback for non-JSON API errors", async () => {
    fetchMock.mockResolvedValue(
      new Response("Internal database password: secret", {
        status: 500,
      }),
    );
    const client = new ApiClient({
      baseUrl: "https://api.example.com",
    });
    await expect(client.get("/api/v1/projects")).rejects.toEqual({
      code: "API_REQUEST_FAILED",
      message: "The request could not be completed.",
      status: 500,
    });
  });
  it("does not expose sensitive server details in fallback errors", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        "Database password=secret123 stack trace /internal/server.ts",
        {
          status: 500,
        },
      ),
    );
    const client = new ApiClient({
      baseUrl: "https://api.example.com",
    });
    const error = await client
      .get("/api/v1/projects")
      .catch((requestError) => requestError);
    expect(error.message).toBe(
      "The request could not be completed.",
    );
    expect(error.message).not.toContain("secret123");
    expect(error.message).not.toContain("stack trace");
  });
  it("returns undefined for a 204 response", async () => {
    fetchMock.mockResolvedValue(
      new Response(null, {
        status: 204,
      }),
    );
    const client = new ApiClient({
      baseUrl: "https://api.example.com",
    });
    await expect(
      client.delete("/api/v1/projects/project-123"),
    ).resolves.toBeUndefined();
  });
  it("serializes request bodies as JSON", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            id: "project-123",
          },
        }),
        {
          status: 201,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );
    const client = new ApiClient({
      baseUrl: "https://api.example.com",
    });
    await client.post("/api/v1/projects", {
      name: "Build Me",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/api/v1/projects",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          name: "Build Me",
        }),
      }),
    );
  });
});
