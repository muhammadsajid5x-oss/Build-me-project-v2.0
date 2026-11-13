import { createBrowserRouter } from "react-router-dom";

import ProtectedRoute from "../auth/ProtectedRoute";
import AppLayout from "../layouts/AppLayout";
import AnalyticsPage from "../pages/AnalyticsPage";
import BookingsPage from "../pages/BookingsPage";
import DashboardPage from "../pages/DashboardPage";
import InvoicesPage from "../pages/InvoicesPage";
import LoginPage from "../pages/LoginPage";
import NotFoundPage from "../pages/NotFoundPage";
import RequestsPage from "../pages/RequestsPage";
import SettingsPage from "../pages/SettingsPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        errorElement: <NotFoundPage />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: "analytics",
            element: <AnalyticsPage />,
          },
          {
            path: "requests",
            element: <RequestsPage />,
          },
          {
            path: "bookings",
            element: <BookingsPage />,
          },
          {
            path: "invoices",
            element: <InvoicesPage />,
          },
          {
            path: "settings",
            element: <SettingsPage />,
          },
          {
            path: "*",
            element: <NotFoundPage />,
          },
        ],
      },
    ],
  },
]);
