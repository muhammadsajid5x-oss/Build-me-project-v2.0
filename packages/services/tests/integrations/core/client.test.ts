import { describe, expect, it, vi } from "vitest";

import {
  requestIntegration,
  type IntegrationResponse,
} from "../../../integrations/core/client";
import { IntegrationError } from "../../../integrations/core/errors";

describe("requestIntegration", () => {
  it("returns successful JSON responses", async () => {
    const mockResponse = new Response(JSON.stringify({ id: 1, name: "Test" }), {
      status: 200,
      headers: {
        "content-type": "application/json",
      },
    });

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse));

    const result = await requestIntegration<{ id: number; name: string }>({
      url: "https://example.com/test",
    });

    const typedResult: IntegrationResponse<{
      id: number;
      name: string;
    }> = result;

    expect(typedResult.data).toEqual({
      id: 1,
      name: "Test",
    });
    expect(typedResult.status).toBe(200);
    expect(fetch).toHaveBeenCalledWith(
      "https://example.com/test",
      expect.objectContaining({
        method: "GET",
      }),
    );
  });

  it("throws IntegrationError for failed responses", async () => {
    const mockResponse = new Response("Not found", {
      status: 404,
    });

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse));

    await expect(
      requestIntegration({
        url: "https://example.com/missing",
      }),
    ).rejects.toMatchObject({
      name: "IntegrationError",
      code: "INTEGRATION_REQUEST_FAILED",
      status: 404,
    });
  });

  it("wraps unexpected request failures", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Network failure")),
    );

    await expect(
      requestIntegration({
        url: "https://example.com/test",
      }),
    ).rejects.toBeInstanceOf(IntegrationError);
  });
});
