import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Mock IntersectionObserver which is missing in JSDOM
class IntersectionObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
  root = null;
  rootMargin = "";
  thresholds = [];
}

vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);
