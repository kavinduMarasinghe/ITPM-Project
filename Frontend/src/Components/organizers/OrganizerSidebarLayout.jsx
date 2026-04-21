import React, { useState } from "react";
import {
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiClipboard,
  FiLogOut,
  FiMenu,
  FiPackage,
  FiShield,
  FiUsers,
  FiX,
  FiZap,
} from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";

const MENU_ITEMS = [
  { id: "events", label: "Events", icon: FiCalendar, live: true },
  { id: "tasks", label: "Tasks", icon: FiClipboard, route: "/tasks" },
  { id: "stalls", label: "Stalls", icon: FiPackage, route: "/stalls" },
  { id: "sponsorships", label: "Sponsorships", icon: FiShield, route: "/sponsorships" },
  { id: "users", label: "Users", icon: FiUsers, route: "/users" },
];

function OrganizerSidebarLayout({
  activeSection,
  children,
  //headerMeta = "",
  loggingOut = false,
  onLogout,
  onSectionChange,
  organizationName,
  onShowRules,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeLabel =
    MENU_ITEMS.find((item) => item.id === activeSection)?.label || "Organizer Portal";
  const hideTextOnDesktop = isCollapsed ? "lg:hidden" : "";
  const desktopWidthClass = isCollapsed ? "lg:w-24" : "lg:w-[280px]";

  const handleSectionChange = (sectionId) => {
    onSectionChange(sectionId);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen lg:flex" style={{ backgroundColor: "#F4F6F9" }}>
      {mobileMenuOpen ? (
        <button
          type="button"
          aria-label="Close organizer menu overlay"
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/35 lg:hidden"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] -translate-x-full flex-col border-r bg-white transition-all duration-300 ease-out lg:sticky lg:top-0 lg:h-screen lg:self-start lg:translate-x-0 ${desktopWidthClass} ${
          mobileMenuOpen ? "translate-x-0" : ""
        }`}
        style={{ borderColor: "#E2E8F0" }}
      >
        <div className="border-b px-5 py-6" style={{ borderColor: "#E2E8F0" }}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                style={{ backgroundColor: "#F97316", color: "#FFFFFF" }}
              >
                <FiZap size={20} />
              </div>
              <div className={`min-w-0 ${hideTextOnDesktop}`}>
                <h1 className="truncate text-2xl font-bold" style={{ color: "#0F172A" }}>
                  Event<span style={{ color: "#F97316" }}>Aura</span>
                </h1>
                <p className="truncate text-sm" style={{ color: "#64748B" }}>
                  {organizationName || "Organizer Portal"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCollapsed((current) => !current)}
                className="hidden h-9 w-9 items-center justify-center rounded-xl lg:inline-flex"
                style={{ color: "#64748B" }}
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isCollapsed ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
              </button>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl lg:hidden"
                style={{ color: "#64748B" }}
                aria-label="Close organizer menu"
              >
                <FiX size={18} />
              </button>
            </div>
          </div>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <div className="flex flex-col gap-2">
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = item.live
                ? activeSection === item.id
                : location.pathname === item.route;
              const sharedClassName = `flex items-center gap-3 rounded-2xl px-4 py-3 font-semibold transition-all ${
                isCollapsed ? "lg:justify-center lg:px-3" : ""
              }`;
              const sharedStyle = {
                backgroundColor: isActive ? "#F97316" : "transparent",
                color: isActive ? "#FFFFFF" : "#64748B",
                boxShadow: isActive ? "0 16px 30px rgba(249, 115, 22, 0.22)" : "none",
              };

              if (item.live) {
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSectionChange(item.id)}
                    className={sharedClassName}
                    style={sharedStyle}
                    title={item.label}
                  >
                    <Icon size={18} />
                    <span className={hideTextOnDesktop}>{item.label}</span>
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    navigate(item.route);
                    setMobileMenuOpen(false);
                  }}
                  className={sharedClassName}
                  style={sharedStyle}
                  title={item.label}
                >
                  <Icon size={18} />
                  <span className={hideTextOnDesktop}>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <div
          className="mt-auto border-t px-4 pb-5 pt-4"
          style={{ borderColor: "#E2E8F0", backgroundColor: "#FFFFFF" }}
        >
          <button
            type="button"
            onClick={onLogout}
            disabled={loggingOut}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 font-semibold text-white disabled:opacity-70 ${
              isCollapsed ? "lg:px-3" : ""
            }`}
            style={{ backgroundColor: "#F97316" }}
            title="Sign Out"
          >
            <FiLogOut size={18} />
            <span className={hideTextOnDesktop}>
              {loggingOut ? "Signing Out..." : "Sign Out"}
            </span>
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1 lg:min-h-screen">
        <header
            className="sticky top-0 z-30 border-b bg-white"
            style={{ borderColor: "#E2E8F0" }}
          >
            <div className="flex items-center justify-between px-6 py-5 lg:px-8">

              {/* LEFT SIDE */}
              <div>
                <p className="text-xs font-semibold tracking-[0.25em] text-orange-500 mb-1">
                  ORGANIZER DASHBOARD
                </p>
                <h2 className="text-2xl font-bold text-slate-900">
                  {organizationName}
                </h2>
              </div>

              {/* RIGHT SIDE */}
              <div className="flex items-center gap-3">

               <button
                  onClick={() => onShowRules()}
                  className="px-5 py-2.5 rounded-2xl font-semibold text-white"
                  style={{ backgroundColor: "#F97316" }}
                >
                  Event Rules
                </button>
                <button
                  onClick={() => window.location.href="/eventrequest"}
                  className="px-5 py-2.5 rounded-2xl font-semibold text-white"
                  style={{ backgroundColor: "#F97316" }}
                >
                  + Create Event Request
                </button>
              </div>
            </div>
          </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}

export default OrganizerSidebarLayout;
