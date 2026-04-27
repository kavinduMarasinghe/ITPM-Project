import React, { useState } from "react";
import {
  FiArrowRight,
  FiBookOpen,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiUser,
} from "react-icons/fi";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { api } from "../../services/api";
import { getDashboardRouteForRole, saveSession } from "../../services/session";
import { useAuth } from "../../context/AuthContext";

function LoginPage({ defaultPortal = "staff" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSession } = useAuth();
  const [activePortal, setActivePortal] = useState(
    location.state?.portal || defaultPortal
  );
  const [showStudentPassword, setShowStudentPassword] = useState(false);
  const [showStaffPassword, setShowStaffPassword] = useState(false);
  const [showVendorPassword, setShowVendorPassword] = useState(false);
  const [showSponsorPassword, setShowSponsorPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [studentData, setStudentData] = useState({
    studentId: "",
    password: "",
  });
  const [staffData, setStaffData] = useState({
    email: "",
    password: "",
  });
  const [vendorData, setVendorData] = useState({
    email: "",
    password: "",
  });
  const [sponsorData, setSponsorData] = useState({
    email: "",
    password: "",
  });

  const routeMessage = location.state?.message || "";

  const switchPortal = (portal) => {
    setActivePortal(portal);
    setError("");
  };

  const handleStudentChange = (event) => {
    const { name, value } = event.target;
    setStudentData((current) => ({
      ...current,
      [name]: value,
    }));
    setError("");
  };

  const handleStaffChange = (event) => {
    const { name, value } = event.target;
    setStaffData((current) => ({
      ...current,
      [name]: value,
    }));
    setError("");
  };

  const handleVendorChange = (event) => {
    const { name, value } = event.target;
    setVendorData((current) => ({
      ...current,
      [name]: value,
    }));
    setError("");
  };

  const handleSponsorChange = (event) => {
    const { name, value } = event.target;
    setSponsorData((current) => ({
      ...current,
      [name]: value,
    }));
    setError("");
  };

  const finishLogin = (session) => {
    saveSession(session);
    setSession(session);
    const isLegacyStallAdmin =
      session.user.role === "admin" &&
      typeof session.user.id === "string" &&
      session.user.id.startsWith("vendor:");
    const target = isLegacyStallAdmin
      ? "/admin/dashboard"
      : getDashboardRouteForRole(session.user.role);
    navigate(target, { replace: true });
  };

  const handleStudentSubmit = async (event) => {
    event.preventDefault();

    if (!studentData.studentId.trim() || !studentData.password) {
      setError("Student ID and password are required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.login({
        role: "student",
        studentId: studentData.studentId.trim(),
        password: studentData.password,
      });

      finishLogin(response.data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStaffSubmit = async (event) => {
    event.preventDefault();

    if (!staffData.email.trim() || !staffData.password) {
      setError("Email and password are required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.login({
        role: "staff",
        email: staffData.email.trim(),
        password: staffData.password,
      });

      finishLogin(response.data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVendorSubmit = async (event) => {
    event.preventDefault();

    if (!vendorData.email.trim() || !vendorData.password) {
      setError("Email and password are required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.login({
        role: "vendor",
        email: vendorData.email.trim(),
        password: vendorData.password,
      });

      finishLogin(response.data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSponsorSubmit = (event) => {
    event.preventDefault();

    if (!sponsorData.email.trim() || !sponsorData.password) {
      setError("Email and password are required.");
      return;
    }

    setError("");
    navigate("/sponsor/dashboard", { replace: true });
  };

  return (
    <div
      className="relative overflow-hidden px-4 py-14 md:py-20"
      style={{ backgroundColor: "#F4F6F9" }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"
          style={{ backgroundColor: "#F97316" }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"
          style={{ backgroundColor: "#0F172A" }}
        />
        <div
          className="absolute top-40 left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"
          style={{ backgroundColor: "#22C55E" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto">
        <div className="animate-fade-in text-center max-w-3xl mx-auto mb-8 md:mb-10">
          <p
            className="text-sm font-semibold tracking-[0.3em] uppercase mb-3"
            style={{ color: "#F97316" }}
          >
            Unified Login
          </p>
          <h1
            className="text-4xl md:text-5xl font-bold mb-4 tracking-tight"
            style={{ color: "#0F172A" }}
          >
            Sign in to Event<span style={{ color: "#F97316" }}>Aura</span>
          </h1>
          <p className="text-base md:text-lg max-w-2xl mx-auto" style={{ color: "#64748B" }}>
            Explore campus events with ease — students discover latest events, 
            while organizers and staff manage planning, approvals, 
            and publishing through one unified platform.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ backgroundColor: "rgba(255,255,255,0.82)", color: "#C2410C" }}
            >
              <FiBookOpen size={15} />
              Student portal
            </div>
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ backgroundColor: "rgba(255,255,255,0.82)", color: "#0F172A" }}
            >
              <FiMail size={15} />
              Shared staff portal
            </div>
          </div>
        </div>

        <div
          className="rounded-[32px] border p-6 md:p-8 shadow-sm animate-slide-up max-w-2xl mx-auto"
          style={{ backgroundColor: "#FFFFFF", borderColor: "#E2E8F0" }}
        >
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] mb-2" style={{ color: "#F97316" }}>
              Access Portal
            </p>
            <h2 className="text-3xl font-bold" style={{ color: "#0F172A" }}>
              Sign In
            </h2>
          </div>

          <div
            className="grid grid-cols-2 gap-2 p-1 rounded-2xl mb-6"
            style={{ backgroundColor: "#F8FAFC" }}
          >
            <button
              type="button"
              onClick={() => switchPortal("student")}
              className="px-4 py-3 rounded-xl font-semibold transition-all"
              style={{
                backgroundColor: activePortal === "student" ? "#F97316" : "transparent",
                color: activePortal === "student" ? "#FFFFFF" : "#64748B",
              }}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => switchPortal("staff")}
              className="px-4 py-3 rounded-xl font-semibold transition-all"
              style={{
                backgroundColor: activePortal === "staff" ? "#F97316" : "transparent",
                color: activePortal === "staff" ? "#FFFFFF" : "#64748B",
              }}
            >
              Staff
            </button>
            <button
              type="button"
              onClick={() => switchPortal("vendor")}
              className="px-4 py-3 rounded-xl font-semibold transition-all"
              style={{
                backgroundColor: activePortal === "vendor" ? "#F97316" : "transparent",
                color: activePortal === "vendor" ? "#FFFFFF" : "#64748B",
              }}
            >
              Vendor
            </button>
            <button
              type="button"
              onClick={() => switchPortal("sponsor")}
              className="px-4 py-3 rounded-xl font-semibold transition-all"
              style={{
                backgroundColor: activePortal === "sponsor" ? "#F97316" : "transparent",
                color: activePortal === "sponsor" ? "#FFFFFF" : "#64748B",
              }}
            >
              Sponsor
            </button>
          </div>
          {routeMessage && (
            <div
              className="rounded-xl p-3 mb-4"
              style={{ backgroundColor: "#EFF6FF", border: "1px solid #BFDBFE" }}
            >
              <p className="text-sm" style={{ color: "#1D4ED8" }}>
                {routeMessage}
              </p>
            </div>
          )}

          {activePortal === "vendor" ? (
            <>
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2" style={{ color: "#0F172A" }}>
                  Vendor / Admin Login
                </h3>
                <p className="text-sm" style={{ color: "#64748B" }}>
                  Sign in to manage your stalls, reservations, and event participation.
                </p>
              </div>

              <form onSubmit={handleVendorSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "#0F172A" }}>
                    Email Address
                  </label>
                  <div className="relative">
                    <FiMail
                      className="absolute left-3 top-1/2 transform -translate-y-1/2"
                      style={{ color: "#F97316" }}
                      size={18}
                    />
                    <input
                      type="email"
                      name="email"
                      value={vendorData.email}
                      onChange={handleVendorChange}
                      placeholder="your-business@example.com"
                      className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all"
                      style={{
                        borderColor: error ? "#EF4444" : "#E2E8F0",
                        backgroundColor: "#FFFFFF",
                        color: "#0F172A",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "#0F172A" }}>
                    Password
                  </label>
                  <div className="relative">
                    <FiLock
                      className="absolute left-3 top-1/2 transform -translate-y-1/2"
                      style={{ color: "#F97316" }}
                      size={18}
                    />
                    <input
                      type={showVendorPassword ? "text" : "password"}
                      name="password"
                      value={vendorData.password}
                      onChange={handleVendorChange}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all"
                      style={{
                        borderColor: error ? "#EF4444" : "#E2E8F0",
                        backgroundColor: "#FFFFFF",
                        color: "#0F172A",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowVendorPassword((current) => !current)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:opacity-70"
                      style={{ color: "#64748B" }}
                    >
                      {showVendorPassword ? (
                        <FiEyeOff size={18} />
                      ) : (
                        <FiEye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div
                    className="rounded-xl p-3 animate-shake"
                    style={{ backgroundColor: "#FEE2E2", border: "1px solid #EF4444" }}
                  >
                    <p className="text-sm text-center" style={{ color: "#EF4444" }}>
                      {error}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                  style={{ backgroundColor: "#F97316" }}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Continue to Vendor Portal
                      <FiArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              <div
                className="mt-6 pt-5 border-t"
                style={{ borderColor: "#E2E8F0" }}
              >
                <div className="flex flex-wrap justify-center gap-6 text-sm">
                  <Link
                    to="/register-vendor"
                    style={{ color: "#F97316" }}
                    className="font-medium hover:opacity-80"
                  >
                    Vendor registration
                  </Link>
                  <Link
                    to="/register/organization"
                    style={{ color: "#64748B" }}
                    className="font-medium hover:opacity-80"
                  >
                    Organization registration
                  </Link>
                </div>
              </div>
            </>
          ) : activePortal === "student" ? (
            <>
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2" style={{ color: "#0F172A" }}>
                  Student Login
                </h3>
                <p className="text-sm" style={{ color: "#64748B" }}>
                  Access your student portal to explore published events and discover what’s happening on campus.
                </p>
              </div>

              <form onSubmit={handleStudentSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "#0F172A" }}>
                    Student ID
                  </label>
                  <div className="relative">
                    <FiUser
                      className="absolute left-3 top-1/2 transform -translate-y-1/2"
                      style={{ color: "#F97316" }}
                      size={18}
                    />
                    <input
                      type="text"
                      name="studentId"
                      value={studentData.studentId}
                      onChange={handleStudentChange}
                      placeholder="STU001"
                      className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all"
                      style={{
                        borderColor: error ? "#EF4444" : "#E2E8F0",
                        backgroundColor: "#FFFFFF",
                        color: "#0F172A",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "#0F172A" }}>
                    Password
                  </label>
                  <div className="relative">
                    <FiLock
                      className="absolute left-3 top-1/2 transform -translate-y-1/2"
                      style={{ color: "#F97316" }}
                      size={18}
                    />
                    <input
                      type={showStudentPassword ? "text" : "password"}
                      name="password"
                      value={studentData.password}
                      onChange={handleStudentChange}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all"
                      style={{
                        borderColor: error ? "#EF4444" : "#E2E8F0",
                        backgroundColor: "#FFFFFF",
                        color: "#0F172A",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowStudentPassword((current) => !current)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:opacity-70"
                      style={{ color: "#64748B" }}
                    >
                      {showStudentPassword ? (
                        <FiEyeOff size={18} />
                      ) : (
                        <FiEye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div
                    className="rounded-xl p-3 animate-shake"
                    style={{ backgroundColor: "#FEE2E2", border: "1px solid #EF4444" }}
                  >
                    <p className="text-sm text-center" style={{ color: "#EF4444" }}>
                      {error}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                  style={{ backgroundColor: "#F97316" }}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Continue to Student Portal
                      <FiArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              <div
                className="mt-6 pt-5 border-t"
                style={{ borderColor: "#E2E8F0" }}
              >
                <div className="flex flex-wrap justify-center gap-6 text-sm">
                  <Link
                    to="/student/register"
                    style={{ color: "#F97316" }}
                    className="font-medium hover:opacity-80"
                  >
                    Student registration
                  </Link>
                  <Link
                    to="/register/organization"
                    style={{ color: "#64748B" }}
                    className="font-medium hover:opacity-80"
                  >
                    Organization registration
                  </Link>
                  <Link
                    to="/register-vendor"
                    style={{ color: "#64748B" }}
                    className="font-medium hover:opacity-80"
                  >
                    Vendor registration
                  </Link>
                </div>
              </div>
            </>
          ) : activePortal === "sponsor" ? (
            <>
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2" style={{ color: "#0F172A" }}>
                  Sponsor Login
                </h3>
                <p className="text-sm" style={{ color: "#64748B" }}>
                  Sign in to manage your sponsorship packages, applications, and payments.
                </p>
              </div>

              <form onSubmit={handleSponsorSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "#0F172A" }}>
                    Email Address
                  </label>
                  <div className="relative">
                    <FiMail
                      className="absolute left-3 top-1/2 transform -translate-y-1/2"
                      style={{ color: "#F97316" }}
                      size={18}
                    />
                    <input
                      type="email"
                      name="email"
                      value={sponsorData.email}
                      onChange={handleSponsorChange}
                      placeholder="sponsor@example.com"
                      className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all"
                      style={{
                        borderColor: error ? "#EF4444" : "#E2E8F0",
                        backgroundColor: "#FFFFFF",
                        color: "#0F172A",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "#0F172A" }}>
                    Password
                  </label>
                  <div className="relative">
                    <FiLock
                      className="absolute left-3 top-1/2 transform -translate-y-1/2"
                      style={{ color: "#F97316" }}
                      size={18}
                    />
                    <input
                      type={showSponsorPassword ? "text" : "password"}
                      name="password"
                      value={sponsorData.password}
                      onChange={handleSponsorChange}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all"
                      style={{
                        borderColor: error ? "#EF4444" : "#E2E8F0",
                        backgroundColor: "#FFFFFF",
                        color: "#0F172A",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSponsorPassword((current) => !current)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:opacity-70"
                      style={{ color: "#64748B" }}
                    >
                      {showSponsorPassword ? (
                        <FiEyeOff size={18} />
                      ) : (
                        <FiEye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div
                    className="rounded-xl p-3 animate-shake"
                    style={{ backgroundColor: "#FEE2E2", border: "1px solid #EF4444" }}
                  >
                    <p className="text-sm text-center" style={{ color: "#EF4444" }}>
                      {error}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                  style={{ backgroundColor: "#F97316" }}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Continue to Sponsor Portal
                      <FiArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              <div
                className="mt-6 pt-5 border-t"
                style={{ borderColor: "#E2E8F0" }}
              >
                <div className="flex flex-wrap justify-center gap-6 text-sm">
                  <Link
                    to="/register/sponsor"
                    style={{ color: "#F97316" }}
                    className="font-medium hover:opacity-80"
                  >
                    Sponsor registration
                  </Link>
                  <Link
                    to="/register/organization"
                    style={{ color: "#64748B" }}
                    className="font-medium hover:opacity-80"
                  >
                    Organization registration
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2" style={{ color: "#0F172A" }}>
                  Shared Staff Login
                </h3>
                <p className="text-sm" style={{ color: "#64748B" }}>
                  Sign in with your staff account to access the right dashboard automatically.
                </p>
              </div>

              <form onSubmit={handleStaffSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "#0F172A" }}>
                    Email Address
                  </label>
                  <div className="relative">
                    <FiMail
                      className="absolute left-3 top-1/2 transform -translate-y-1/2"
                      style={{ color: "#F97316" }}
                      size={18}
                    />
                    <input
                      type="email"
                      name="email"
                      value={staffData.email}
                      onChange={handleStaffChange}
                      placeholder="admin@eventaura.com or your organization email"
                      className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all"
                      style={{
                        borderColor: error ? "#EF4444" : "#E2E8F0",
                        backgroundColor: "#FFFFFF",
                        color: "#0F172A",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "#0F172A" }}>
                    Password
                  </label>
                  <div className="relative">
                    <FiLock
                      className="absolute left-3 top-1/2 transform -translate-y-1/2"
                      style={{ color: "#F97316" }}
                      size={18}
                    />
                    <input
                      type={showStaffPassword ? "text" : "password"}
                      name="password"
                      value={staffData.password}
                      onChange={handleStaffChange}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all"
                      style={{
                        borderColor: error ? "#EF4444" : "#E2E8F0",
                        backgroundColor: "#FFFFFF",
                        color: "#0F172A",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowStaffPassword((current) => !current)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:opacity-70"
                      style={{ color: "#64748B" }}
                    >
                      {showStaffPassword ? (
                        <FiEyeOff size={18} />
                      ) : (
                        <FiEye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div
                    className="rounded-xl p-3 animate-shake"
                    style={{ backgroundColor: "#FEE2E2", border: "1px solid #EF4444" }}
                  >
                    <p className="text-sm text-center" style={{ color: "#EF4444" }}>
                      {error}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                  style={{ backgroundColor: "#F97316" }}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Continue to Portal
                      <FiArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              <div
                className="mt-6 pt-5 border-t"
                style={{ borderColor: "#E2E8F0" }}
              >
                <div className="flex flex-wrap justify-center gap-6 text-sm">
                  <Link
                    to="/register/organization"
                    style={{ color: "#F97316" }}
                    className="font-medium hover:opacity-80"
                  >
                    Organization registration
                  </Link>
                  <Link
                    to="/register-vendor"
                    style={{ color: "#F97316" }}
                    className="font-medium hover:opacity-80"
                  >
                    Vendor registration
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-slide-up { animation: slide-up 0.5s ease-out; }
        .animate-shake { animation: shake 0.3s ease-in-out; }
      `}</style>
    </div>
  );
}

export default LoginPage;
