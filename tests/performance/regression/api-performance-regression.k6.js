/* global __ENV */
import http from "k6/http";
import { check } from "k6";

export const options = {
  vus: 1,
  duration: "10s",
  thresholds: {
    http_req_duration: ["p(95)<100"],
  },
};

export default function main() {
  const response = http.get(
    __ENV.API_BASE_URL || "http://localhost:3000/health",
  );

  check(response, {
    "status is 200 or 429": (r) => r.status === 200 || r.status === 429,
  });
}
