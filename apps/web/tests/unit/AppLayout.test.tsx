import { render, waitFor } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import AppLayout from "../../src/layouts/AppLayout";

test("AppLayout tracks a page view with its route", async () => {
  const fetchMock = vi.fn().mockResolvedValue({ ok: true });
  vi.stubGlobal("fetch", fetchMock);

  try {
    render(
      <MemoryRouter initialEntries={["/route-test"]}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/route-test" element={<div>Route test</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/v1/analytics/events",
      {
        method: "POST",
        body: new URLSearchParams({
          name: "page.viewed",
          eventType: "view",
          path: "/route-test",
        }),
        keepalive: true,
      },
    );
  } finally {
    vi.unstubAllGlobals();
  }
});
