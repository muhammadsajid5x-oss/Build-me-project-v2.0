import { Outlet } from "react-router-dom";

import Navbar from "../components/Navbar/Navbar";

export default function AppLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="p-8">
        <Outlet />
      </main>
    </div>
  );
}
