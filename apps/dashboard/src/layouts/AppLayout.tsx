import { Link, Outlet } from "react-router-dom";
export default function AppLayout() {
  return (
    <div className="min-h-screen">
      <header className="border-b p-4">
        <nav className="flex gap-4">
          <Link to="/">Dashboard</Link>
        </nav>
      </header>
      <main className="p-8">
        <Outlet />
      </main>
    </div>
  );
}
