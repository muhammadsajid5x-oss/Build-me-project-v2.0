import React from "react";
import ReactDOM from "react-dom/client";
import { logger } from "@build-me/utils";
import App from "./App";
import "./index.css";

const handleWindowError = (event: ErrorEvent) => {
  logger.error("Uncaught Web runtime error.", {
    service: "web",
    error: event.error,
    filename: event.filename,
    line: event.lineno,
    column: event.colno,
  });
};

const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
  logger.error("Unhandled Web promise rejection.", {
    service: "web",
    error: event.reason instanceof Error ? event.reason : undefined,
    reasonType:
      event.reason instanceof Error ? event.reason.name : typeof event.reason,
  });
};

window.addEventListener("error", handleWindowError);
window.addEventListener("unhandledrejection", handleUnhandledRejection);

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    window.removeEventListener("error", handleWindowError);
    window.removeEventListener("unhandledrejection", handleUnhandledRejection);
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
