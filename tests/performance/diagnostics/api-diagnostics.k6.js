/* global __ENV */
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 1,
  duration: "10s",
  thresholds: {
    http_req_duration: ["p(95)<500", "p(99)<1000"],
    http_req_failed: ["rate<0.01"],
  },
};

export default function healthCheckTest() {
  const response = http.get(
    __ENV.API_BASE_URL || "http://localhost:3000/health",
  );
  check(response, {
    "health endpoint responds": (r) => r.status === 200,
    "health status is ok": (r) => r.json("status") === "ok",
  });
  sleep(1);
}
