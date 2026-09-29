import { createBrowserRouter } from "react-router-dom";

import { LazyLoadBoundary } from "../performance/LazyLoadBoundary";
import { lazyLoad } from "../performance/lazy";
import AppLayout from "../layouts/AppLayout";
import NotFoundPage from "../pages/NotFoundPage";

const HomePage = lazyLoad(() => import("../pages/HomePage"), "HomePage");
const RouteTestPage = lazyLoad(
  () => import("../pages/RouteTestPage"),
  "RouteTestPage",
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: (
          <LazyLoadBoundary>
            <HomePage />
          </LazyLoadBoundary>
        ),
      },
      {
        path: "route-test",
        element: (
          <LazyLoadBoundary>
            <RouteTestPage />
          </LazyLoadBoundary>
        ),
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
