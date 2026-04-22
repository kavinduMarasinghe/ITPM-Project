import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Zap,
  ClipboardList,
  Calendar,
  Store,
  HandCoins,
  Users,
  ArrowRight,
} from "lucide-react";

import heroBg from "../../assets/hero-bg.png";

const Homepage = () => {
  const navigate = useNavigate();

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const stats = [
    { value: "500+", label: "Events Managed" },
    { value: "2,000+", label: "Tasks Completed" },
    { value: "350+", label: "Stalls Allocated" },
    { value: "LKR 10M+", label: "Revenue Tracked" },
  ];

  const features = [
    {
      icon: ClipboardList,
      title: "Task Management",
      description:
        "Trello-style boards to track decorations, rehearsals, setup, and volunteer coordination.",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
    },
    {
      icon: Calendar,
      title: "Event Scheduling",
      description:
        "Create events, book halls, validate conflicts, and manage the full event lifecycle.",
      iconBg: "bg-orange-50",
      iconColor: "text-orange-500",
    },
    {
      icon: Store,
      title: "Stall Allocation",
      description:
        "First-come-first-serve stall reservations with zone-based pricing and auto-expiry.",
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      icon: HandCoins,
      title: "Sponsorship & Payments",
      description:
        "Manage sponsorship packages, process payments, and generate revenue reports.",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
  ];

  const roles = [
    {
      icon: Users,
      title: "Organizers",
      description:
        "Create events, manage tasks, set up stall zones, and review sponsorship applications.",
      route: "/register/organization",
    },
    {
      icon: Store,
      title: "Vendors",
      description:
        "Browse events, reserve stalls on a first-come-first-serve basis, and manage payments.",
      route: "/login",
      portal: "vendor",
    },
    {
      icon: HandCoins,
      title: "Sponsors",
      description:
        "Explore sponsorship packages, apply to sponsor events, and track payments.",
      route: "/login",
      portal: "staff",
    },
  ];

  const goToRole = (role) => {
    if (role.portal) {
      navigate(role.route, { state: { portal: role.portal } });
    } else {
      navigate(role.route);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ───────────────────────── NAVBAR ───────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 group"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md shadow-orange-500/30 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 text-white" fill="white" />
            </div>
            <span className="text-xl font-bold text-gray-900">EventAura</span>
          </button>

          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("features")}
              className="text-gray-700 hover:text-orange-600 font-medium transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("stats")}
              className="text-gray-700 hover:text-orange-600 font-medium transition-colors"
            >
              Stats
            </button>
            <button
              onClick={() => scrollToSection("roles")}
              className="text-gray-700 hover:text-orange-600 font-medium transition-colors"
            >
              Roles
            </button>
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            <button
              onClick={() => navigate("/login")}
              className="text-gray-900 font-medium hover:text-orange-600 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/student/register")}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-md shadow-orange-500/25"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ───────────────────────── HERO ───────────────────────── */}
      <section className="relative pt-20 bg-gray-950 overflow-hidden">
        <div
          className="absolute inset-0 bg-no-repeat bg-cover bg-center pointer-events-none"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950/95 via-gray-950/75 to-gray-950/20 pointer-events-none" />
        <div className="absolute inset-0 opacity-80 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(251,146,60,0.18),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(249,115,22,0.12),transparent_55%)]" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Zap className="w-4 h-4" fill="currentColor" />
            University Event Management
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-[1.05] tracking-tight">
            Plan. Organize.
            <br />
            <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
              Execute.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed">
            The complete platform for managing university events, stall
            allocations, sponsorships, and team tasks — all in one place.
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => navigate("/login")}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-7 py-4 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5"
            >
              Sign In to Dashboard
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollToSection("features")}
              className="inline-flex items-center gap-2 border border-gray-600 text-white px-7 py-4 rounded-lg font-semibold hover:bg-white/5 hover:border-gray-400 transition-all"
            >
              Explore Features
            </button>
          </div>
        </div>
      </section>

      {/* ───────────────────────── STATS ───────────────────────── */}
      <section id="stats" className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2 tracking-tight">
                  {stat.value}
                </div>
                <div className="text-gray-500 text-sm md:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── FEATURES ───────────────────────── */}
      <section id="features" className="py-20 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              Everything You Need
            </h2>
            <p className="text-lg text-gray-500">
              Four powerful modules working together seamlessly.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-8 hover:shadow-xl hover:-translate-y-1 transition-all border border-gray-100 group"
                >
                  <div
                    className={`w-14 h-14 rounded-xl ${feature.iconBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className={`w-7 h-7 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────────────────────── ROLES ───────────────────────── */}
      <section id="roles" className="py-20 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              Built for Every Role
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Role-based access control for organizers, vendors, sponsors, and
              admins.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {roles.map((role, i) => {
              const Icon = role.icon;
              return (
                <button
                  key={i}
                  onClick={() => goToRole(role)}
                  className="bg-gray-50 rounded-2xl p-8 text-center hover:shadow-md hover:-translate-y-1 transition-all border border-gray-100 group"
                >
                  <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <Icon className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {role.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed">
                    {role.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────────────────────── CTA ───────────────────────── */}
      <section
        className="py-20 md:py-28 relative overflow-hidden"
        style={{
          background: "linear-gradient(90deg, #0f172a 0%, #1e293b 40%, #c56a2d 100%)",
        }}
      >
        
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Ready to Transform Your Events?
          </h2>
          <p className="text-lg text-gray-300 mb-10">
            Start organizing smarter with UniEvent today.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/40 hover:shadow-orange-500/60 hover:-translate-y-0.5"
          >
            Get Started Now
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* ───────────────────────── FOOTER ───────────────────────── */}
      <footer className="py-8 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" fill="white" />
            </div>
            <span className="font-bold text-gray-900">EventAura</span>
          </button>
          <p className="text-gray-500 text-sm">
            © 2026 University Event Management System
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
