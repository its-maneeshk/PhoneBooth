import { Outlet, Link, useLocation } from "react-router-dom";

export default function App() {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-5xl font-dirtylane font-thin">Phone Booth</Link>
          <nav className="flex gap-4 text-sm">
            <Link className={pathname.startsWith("/phones") || pathname === "/" ? "font-semibold" : ""} to="/phones">Phones</Link>
            <Link className={pathname.startsWith("/laptops") ? "font-semibold" : ""} to="/laptops">Laptops</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
      <footer className="border-t bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-gray-500 text-center">
          © {new Date().getFullYear()} Phone Booth — Made with ❤️ by{" "}
          <span className="font-mono font-bold">
            <a
              href="https://www.manishpatel.com.np/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-black"
            >
              Manish Patel
            </a>
          </span>
          <div className="mt-1">
            Wanna contact me?{" "}
            <a
              href="mailto:maneeshkurmii@gmail.com"
              className="underline hover:text-black"
            >
              maneeshkurmii@gmail.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
