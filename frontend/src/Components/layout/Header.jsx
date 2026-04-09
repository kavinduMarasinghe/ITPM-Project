import React, { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { FiLogOut } from "react-icons/fi";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { api } from "../../services/api";
import { clearSession, getSession } from "../../services/session";
import unieventIcon from "./unievent-icon.png";

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [session, setSession] = useState(() => getSession());
  const [loggingOut, setLoggingOut] = useState(false);

  const isAuthenticated = Boolean(session?.token && session?.user);

  useEffect(() => {
    setSession(getSession());
    setIsMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const syncSession = () => {
      setSession(getSession());
    };

    window.addEventListener("storage", syncSession);

    return () => {
      window.removeEventListener("storage", syncSession);
    };
  }, []);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      if (session?.token) {
        await api.logout();
      }
    } catch (error) {
      // Clear the local session even if the backend session is already gone.
    } finally {
      clearSession();
      setSession(null);
      setLoggingOut(false);
      setIsMenuOpen(false);
      navigate("/login", {
        replace: true,
        state: {
          message: "Signed out successfully.",
        },
      });
    }
  };

  return (
    <header className="w-full bg-white/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center space-x-2">
            <img
              src={unieventIcon}
              alt="EventAura Logo"
              className="h-8 w-8 md:h-10 md:w-10 object-contain"
            />
            <span className="text-2xl font-bold text-foreground tracking-tight">
              Event<span className="text-accent">Aura</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 py-2 rounded-lg font-medium shadow-sm hover:bg-accent/90 transition-all duration-200 hover:shadow-md disabled:opacity-70"
              >
                <FiLogOut size={16} />
                {loggingOut ? "Signing Out..." : "Sign Out"}
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-muted-foreground hover:text-foreground transition-colors font-medium px-4 py-2"
                >
                  Sign In
                </Link>
                <Link
                  to="/student/register"
                  className="bg-accent text-accent-foreground px-6 py-2 rounded-lg font-medium shadow-sm hover:bg-accent/90 transition-all duration-200 hover:shadow-md"
                >
                  Student Register
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setIsMenuOpen((current) => !current)}
            type="button"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-3">
              <div className="pt-2 flex flex-col space-y-3">
                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground px-6 py-2 rounded-lg font-medium text-center disabled:opacity-70"
                  >
                    <FiLogOut size={16} />
                    {loggingOut ? "Signing Out..." : "Sign Out"}
                  </button>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2 text-left"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/student/register"
                      onClick={() => setIsMenuOpen(false)}
                      className="bg-accent text-accent-foreground px-6 py-2 rounded-lg font-medium text-center"
                    >
                      Student Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
