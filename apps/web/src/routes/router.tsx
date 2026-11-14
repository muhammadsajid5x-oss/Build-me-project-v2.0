import { createBrowserRouter } from "react-router-dom";

import { LazyLoadBoundary } from "../performance/LazyLoadBoundary";
import { lazyLoad } from "../performance/lazy";
import AppLayout from "../layouts/AppLayout";
import NotFoundPage from "../pages/NotFoundPage";

const HomePage = lazyLoad(() => import("../pages/HomePage"), "HomePage");

const FoundationTestPage = lazyLoad(
  () => import("../pages/FoundationTestPage"),
  "FoundationTestPage",
);

const RouteTestPage = lazyLoad(
  () => import("../pages/RouteTestPage"),
  "RouteTestPage",
);

const DeliverMyProjectPage = lazyLoad(
  () => import("../pages/DeliverMyProjectPage"),
  "DeliverMyProjectPage",
);

const MentorMePage = lazyLoad(
  () => import("../pages/MentorMePage"),
  "MentorMePage",
);

const CoffeeWithMePage = lazyLoad(
  () => import("../pages/CoffeeWithMePage"),
  "CoffeeWithMePage",
);

const OwnershipToolkitPage = lazyLoad(
  () => import("../pages/OwnershipToolkitPage"),
  "OwnershipToolkitPage",
);

const AboutPage = lazyLoad(() => import("../pages/AboutPage"), "AboutPage");

const TermsAndConditionsPage = lazyLoad(
  () => import("../pages/TermsAndConditionsPage"),
  "TermsAndConditionsPage",
);

const PrivacyPolicyPage = lazyLoad(
  () => import("../pages/PrivacyPolicyPage"),
  "PrivacyPolicyPage",
);

const CookiePolicyPage = lazyLoad(
  () => import("../pages/CookiePolicyPage"),
  "CookiePolicyPage",
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
        path: "foundation-test",
        element: (
          <LazyLoadBoundary>
            <FoundationTestPage />
          </LazyLoadBoundary>
        ),
      },
      {
        path: "deliver-my-project",
        element: (
          <LazyLoadBoundary>
            <DeliverMyProjectPage />
          </LazyLoadBoundary>
        ),
      },
      {
        path: "mentor-me",
        element: (
          <LazyLoadBoundary>
            <MentorMePage />
          </LazyLoadBoundary>
        ),
      },
      {
        path: "coffee-with-me",
        element: (
          <LazyLoadBoundary>
            <CoffeeWithMePage />
          </LazyLoadBoundary>
        ),
      },
      {
        path: "ownership-toolkit",
        element: (
          <LazyLoadBoundary>
            <OwnershipToolkitPage />
          </LazyLoadBoundary>
        ),
      },
      {
        path: "about",
        element: (
          <LazyLoadBoundary>
            <AboutPage />
          </LazyLoadBoundary>
        ),
      },
      {
        path: "terms-and-conditions",
        element: (
          <LazyLoadBoundary>
            <TermsAndConditionsPage />
          </LazyLoadBoundary>
        ),
      },
      {
        path: "privacy-policy",
        element: (
          <LazyLoadBoundary>
            <PrivacyPolicyPage />
          </LazyLoadBoundary>
        ),
      },
      {
        path: "cookie-policy",
        element: (
          <LazyLoadBoundary>
            <CookiePolicyPage />
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
