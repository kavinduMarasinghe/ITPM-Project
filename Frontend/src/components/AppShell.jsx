import { Link, useLocation } from "react-router-dom";
import footerBg from "../assets/b.jpeg";


export default function AppShell({ children }) {
  const { pathname } = useLocation();

  // Allow certain pages to take over the full viewport and provide their own chrome
  const isFullPage =
    pathname.startsWith("/organizer/dashboard") ||
    pathname.startsWith("/sponsor/dashboard") ||
    pathname.startsWith("/login");

  if (isFullPage) {
    return <>{children}</>;
  }

  const NavItem = ({ to, label }) => {
    const active = pathname === to;
    return (
      <Link
        to={to}
        className={`px-3 py-2 rounded-xl text-sm font-semibold transition ${
          active
            ? "bg-white/15 text-white"
            : "text-white/80 hover:text-white hover:bg-white/10"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)", color: "var(--color-primary)" }}>
      <header className="sticky top-0 z-20 border-b border-black/10" style={{ background: "#331C22", color: "#FFFFFF" }}>
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div>
            <div className="text-lg font-bold tracking-tight">Financial Management</div>
            <div className="text-xs" style={{ color: '#F7A910' }}>Sponsorship & Payment</div>
          </div>

          <nav className="flex gap-2">
            <NavItem to="/sponsor/apply" label="Sponsor Apply" />
            <NavItem to="/organizer/dashboard" label="Organizer Dashboard" />
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>

      <footer
        className="relative border-t border-black/10 py-10 text-center text-xs overflow-hidden"
        style={{ backgroundImage: `url(${footerBg})`, backgroundSize: "cover", backgroundPosition: "center", color: "#616162" }}
      >
        <div className="absolute inset-0" style={{ background: "rgba(56,67,78,0.82)" }} aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-4" />
      </footer>
    </div>
  );
}
