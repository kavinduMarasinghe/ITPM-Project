import React from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { getDashboardRouteForRole, getSession } from "../../services/session";
import unieventIcon from "./unievent-icon.png";

function getPortalLabel(role) {
  switch (role) {
    case "student":
      return "Student Events";
    case "organizer":
      return "Organizer Dashboard";
    case "admin":
      return "Admin Dashboard";
    case "hod":
      return "HO Dashboard";
    default:
      return "Portal";
  }
}

function Footer() {
  const session = getSession();
  const isSignedIn = Boolean(session?.token);
  const portalRoute = getDashboardRouteForRole(session?.user?.role);
  const portalLabel = getPortalLabel(session?.user?.role);

  return (
    <footer className="bg-white border-t border-gray-200">
      {!isSignedIn ? (
        <div
          className="py-16 text-white"
          style={{
            background: "linear-gradient(90deg, #0f172a 0%, #1e293b 40%, #c56a2d 100%)",
          }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Events?
            </h2>

            <p className="text-lg text-gray-200 mb-8 max-w-2xl mx-auto">
              Start organizing smarter with EventAura today.
            </p>

            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-all duration-200 group"
            >
              Go to Portals
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      ) : null}

      <div className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-center md:text-left">
              <img
                src={unieventIcon}
                alt="EventAura Logo"
                className="h-8 w-8 md:h-10 md:w-10 object-contain"
              />
              <span className="text-2xl font-bold text-gray-900 tracking-tight">
                Event<span className="text-orange-500">Aura</span>
              </span>
            </div>

            <div className="text-center">
              <p className="text-gray-500 text-sm">
                (C) 2026 University Event Management System
              </p>
            </div>

            {isSignedIn ? (
              <div className="flex gap-6">
                <Link
                  to={portalRoute}
                  className="text-gray-500 hover:text-orange-500 transition-colors text-sm"
                >
                  {portalLabel}
                </Link>
              </div>
            ) : (
              <div className="flex gap-6">
                <Link
                  to="/student/register"
                  className="text-gray-500 hover:text-orange-500 transition-colors text-sm"
                >
                  Student Register
                </Link>
                <Link
                  to="/"
                  className="text-gray-500 hover:text-orange-500 transition-colors text-sm"
                >
                  Organization Register
                </Link>
                <Link
                  to="/login"
                  className="text-gray-500 hover:text-orange-500 transition-colors text-sm"
                >
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
