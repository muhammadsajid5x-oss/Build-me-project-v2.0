/* global __ENV */
import http from "k6/http";
import { check } from "k6";

export const options = {
  vus: 1,
  iterations: 105,
};

export default function performanceTest() {
  const response = http.get(
    __ENV.API_BASE_URL || "http://localhost:3000/health",
  );
  check(response, {
    "request returns 200 or 429": (r) => r.status === 200 || r.status === 429,
  });
}
