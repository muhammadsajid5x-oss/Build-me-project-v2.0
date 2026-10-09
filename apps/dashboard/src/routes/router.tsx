import { createBrowserRouter } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import DashboardPage from "../pages/DashboardPage";
import LoginPage from "../pages/LoginPage";
import NotFoundPage from "../pages/NotFoundPage";
import ProtectedRoute from "../auth/ProtectedRoute";
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
            path: "*",
            element: <NotFoundPage />,
          },
        ],
      },
    ],
  },
]);
