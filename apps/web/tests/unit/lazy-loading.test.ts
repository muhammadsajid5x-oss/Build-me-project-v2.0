import { describe, expect, it, vi } from "vitest";

import { measureLazyLoad } from "../../src/performance/measurement";

describe("Lazy loading performance", () => {
  it("loads the feature and measures its duration", async () => {
    const consoleInfo = vi.spyOn(console, "info").mockImplementation(() => {});

    const loader = measureLazyLoad("HomePage", async () => "loaded");

    await expect(loader()).resolves.toBe("loaded");

    expect(consoleInfo).toHaveBeenCalledWith(
      expect.stringMatching(/^\[LazyLoad\] HomePage: \d+\.\d{2}ms$/),
    );

    consoleInfo.mockRestore();
  });
});
