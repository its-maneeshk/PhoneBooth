import { Outlet, Link, useLocation } from "react-router-dom";

export default function App() {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-bold text-xl">Gizmo Launches</Link>
          <nav className="flex gap-4 text-sm">
            <Link className={pathname.startsWith("/phones")||pathname==="/" ? "font-semibold" : ""} to="/phones">Phones</Link>
            <Link className={pathname.startsWith("/laptops") ? "font-semibold" : ""} to="/laptops">Laptops</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
      <footer className="border-t bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-gray-500">
          © {new Date().getFullYear()} Gizmo Launches — Admin at <span className="font-mono">/admin/login</span>
        </div>
      </footer>
    </div>
  );
}
