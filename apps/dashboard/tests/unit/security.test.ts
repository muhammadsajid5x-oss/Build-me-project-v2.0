import { describe, expect, it } from "vitest";
import {
  getSafeErrorMessage,
  isUnauthorizedError,
  setSafeStorageItem,
  isSensitiveStorageKey,
} from "@build-me/utils";

describe("Frontend Security Foundation", () => {
  describe("safe error handling", () => {
    it("returns a safe fallback for unknown errors", () => {
      expect(getSafeErrorMessage(null)).toBe(
        "Something went wrong. Please try again.",
      );
    });

    it("returns a safe error message", () => {
      expect(
        getSafeErrorMessage({
          message: "Unable to complete the request.",
        }),
      ).toBe("Unable to complete the request.");
    });

    it("identifies unauthorized API errors", () => {
      expect(
        isUnauthorizedError({
          code: "UNAUTHORIZED",
        }),
      ).toBe(true);
    });

    it("does not expose arbitrary error values", () => {
      expect(
        getSafeErrorMessage({
          databasePassword: "secret-password",
        }),
      ).toBe("Something went wrong. Please try again.");
    });
  });

  describe("browser storage protection", () => {
    it("identifies sensitive storage keys", () => {
      expect(isSensitiveStorageKey("access_token")).toBe(true);
      expect(isSensitiveStorageKey("refresh_token")).toBe(true);
      expect(isSensitiveStorageKey("password")).toBe(true);
      expect(isSensitiveStorageKey("api_key")).toBe(true);
    });

    it("allows non-sensitive application data", () => {
      expect(isSensitiveStorageKey("theme")).toBe(false);
      expect(isSensitiveStorageKey("dashboard_view")).toBe(false);
    });

    it("rejects sensitive values from browser storage", () => {
      const storage = new Map<string, string>();

      const mockStorage = {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => {
          storage.set(key, value);
        },
        removeItem: (key: string) => {
          storage.delete(key);
        },
        clear: () => {
          storage.clear();
        },
        key: (index: number) => Array.from(storage.keys())[index] ?? null,
        get length() {
          return storage.size;
        },
      } as Storage;

      expect(() =>
        setSafeStorageItem(mockStorage, "access_token", "secret"),
      ).toThrow("must not be stored in browser storage");
    });

    it("allows safe values in browser storage", () => {
      const storage = new Map<string, string>();

      const mockStorage = {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => {
          storage.set(key, value);
        },
        removeItem: (key: string) => {
          storage.delete(key);
        },
        clear: () => {
          storage.clear();
        },
        key: (index: number) => Array.from(storage.keys())[index] ?? null,
        get length() {
          return storage.size;
        },
      } as Storage;

      setSafeStorageItem(mockStorage, "dashboard_view", "overview");

      expect(storage.get("dashboard_view")).toBe("overview");
    });
  });
});
