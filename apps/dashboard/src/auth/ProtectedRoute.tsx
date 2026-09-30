import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute() {
  const { loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return <output>Checking authentication...</output>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user.app_metadata?.role !== "admin") {
    return (
      <main>
        <h1>Access denied</h1>
        <p>An administrator account is required to access this dashboard.</p>
      </main>
    );
  }

  return <Outlet />;
}
