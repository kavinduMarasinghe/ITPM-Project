import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { api } from "../../services/api";
import { clearSession, getSession } from "../../services/session";
import OrganizerSidebarLayout from "./OrganizerSidebarLayout";
import "../../pages/FinancialDashboard.css";

const PACKAGE_AMOUNT = { Gold: 200000, Silver: 100000, Bronze: 50000 };

function OrganizerSponsorApplications() {
  const navigate = useNavigate();
  const session = getSession();
  const organizationName = session?.user?.organizationName || "Organization";

  const [loggingOut, setLoggingOut] = useState(false);
  const [applications, setApplications] = useState([]);
  const [sponsorEmails, setSponsorEmails] = useState(() => {
    const saved = localStorage.getItem("sponsorEmails");
    return saved ? JSON.parse(saved) : [];
  });
  const [newSponsorEmail, setNewSponsorEmail] = useState("");

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:5000/api/sponsorship-applications",
          { headers: { "x-dev-role": "organizer" } }
        );
        if (response.ok) {
          const apps = await response.json();
          const formatted = apps.map((app) => ({
            id: app._id,
            name: app.companyName,
            email: app.email,
            event: app.eventName,
            package: app.packageName,
            amount: PACKAGE_AMOUNT[app.packageName] || 0,
            applied: app.createdAt
              ? new Date(app.createdAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : new Date().toLocaleDateString(),
            status: app.status,
          }));
          setApplications(formatted);
        }
      } catch (error) {
        console.error("Failed to fetch applications:", error);
      }
    };
    fetchApplications();
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      setLoggingOut(true);
      if (session?.token) {
        await api.logout();
      }
    } catch (_err) {
      // Clear local session even if backend logout fails.
    } finally {
      clearSession();
      setLoggingOut(false);
      navigate("/login", { replace: true });
    }
  }, [navigate, session]);

  const handleAddSponsorEmail = () => {
    if (!newSponsorEmail || !newSponsorEmail.includes("@")) {
      alert("Please enter a valid email address");
      return;
    }
    if (sponsorEmails.includes(newSponsorEmail)) {
      alert("This email already exists");
      return;
    }
    const updated = [...sponsorEmails, newSponsorEmail];
    setSponsorEmails(updated);
    setNewSponsorEmail("");
    localStorage.setItem("sponsorEmails", JSON.stringify(updated));
  };

  const handleRemoveSponsorEmail = (email) => {
    const updated = sponsorEmails.filter((e) => e !== email);
    setSponsorEmails(updated);
    localStorage.setItem("sponsorEmails", JSON.stringify(updated));
  };

  const handleDeleteApplication = (appId) => {
    if (!confirm("Are you sure you want to delete this application?")) return;
    setApplications((current) => current.filter((app) => app.id !== appId));
    fetch(`http://127.0.0.1:5000/api/sponsorship-applications/${appId}`, {
      method: "DELETE",
      headers: { "x-dev-role": "organizer" },
    }).catch((err) => console.error("Failed to delete from backend:", err));
  };

  return (
    <OrganizerSidebarLayout
      organizationName={organizationName}
      activeSection="sponsorships"
      onSectionChange={(sectionId) => {
        if (sectionId === "events") {
          navigate("/organizerteamdashboard");
        }
      }}
      onLogout={handleLogout}
      loggingOut={loggingOut}
      onShowRules={() => {}}
    >
      <section className="space-y-6">
        <div>
          <h2 className="font-heading font-bold text-gray-900 text-xl">
            Sponsor Applications
          </h2>
          <p className="text-sm" style={{ color: "#9ca3af" }}>
            Review and approve sponsorship requests
          </p>
        </div>

        <div className="glass-card rounded-large p-5">
          <h3 className="font-heading font-bold text-gray-900 mb-4 text-base">
            📧 Add Sponsor Email
          </h3>
          <div className="flex gap-3 mb-4">
            <input
              type="email"
              placeholder="Enter sponsor email address"
              value={newSponsorEmail}
              onChange={(e) => setNewSponsorEmail(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-large text-sm"
              style={{
                background: "#ffffff",
                border: "1.5px solid #e5e7eb",
                color: "#1f2937",
              }}
              onKeyPress={(e) => e.key === "Enter" && handleAddSponsorEmail()}
            />
            <button
              onClick={handleAddSponsorEmail}
              className="px-5 py-2.5 rounded-large text-white font-bold text-sm"
              style={{
                background: "linear-gradient(135deg,#8b5cf6,#ec4899)",
                boxShadow: "0 4px 12px rgba(139,92,246,0.3)",
              }}
            >
              + Add
            </button>
          </div>

          {sponsorEmails.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {sponsorEmails.map((email) => (
                <div
                  key={email}
                  className="flex items-center gap-2 px-3 py-2 rounded-large"
                  style={{
                    background: "rgba(139,92,246,0.1)",
                    border: "1px solid rgba(139,92,246,0.3)",
                  }}
                >
                  <span className="text-sm text-gray-900">{email}</span>
                  <button
                    onClick={() => handleRemoveSponsorEmail(email)}
                    className="text-red-500 hover:text-red-700 font-bold"
                    style={{ fontSize: "16px" }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card rounded-large overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                  {["Sponsor", "Event", "Package", "Amount", "Applied", "Status", "Action"].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left px-5 py-4 font-heading font-semibold text-xs uppercase tracking-wide"
                        style={{ color: "#9ca3af" }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center" style={{ color: "#9ca3af" }}>
                      No applications yet.
                    </td>
                  </tr>
                ) : (
                  applications.map((app, idx) => {
                    const pkgLabels = {
                      Gold: "badge-gold",
                      Silver: "badge-silver",
                      Bronze: "badge-bronze",
                    };
                    const pkgBadge = pkgLabels[app.package] || "badge-gold";
                    return (
                      <tr key={app.id} className={`trow ${idx < 4 ? "pay-row" : ""}`}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={`https://images.unsplash.com/photo-1560250097-0b93528c311a?w=32&h=32&fit=crop&crop=face&sig=${idx}`}
                              alt=""
                              className="w-8 h-8 rounded-large object-cover"
                            />
                            <div>
                              <p className="font-semibold text-gray-900">{app.name}</p>
                              <p className="text-xs" style={{ color: "#a1a5b8" }}>
                                {app.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4" style={{ color: "#6b7280" }}>
                          {app.event}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`${pkgBadge} text-xs px-2.5 py-1 rounded-small font-bold`}
                          >
                            {app.package}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-bold text-gray-900">
                          LKR {app.amount.toLocaleString()}
                        </td>
                        <td className="px-5 py-4 text-xs" style={{ color: "#9ca3af" }}>
                          {app.applied}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className="text-xs font-bold px-2.5 py-1 rounded-small"
                            style={{
                              background:
                                app.status === "Accepted"
                                  ? "rgba(74,222,128,0.15)"
                                  : app.status === "Pending"
                                  ? "rgba(245,158,11,0.15)"
                                  : app.status === "Rejected"
                                  ? "rgba(239,68,68,0.15)"
                                  : "rgba(107,114,128,0.15)",
                              color:
                                app.status === "Accepted"
                                  ? "#4ade80"
                                  : app.status === "Pending"
                                  ? "#fbbf24"
                                  : app.status === "Rejected"
                                  ? "#f87171"
                                  : "#6b7280",
                            }}
                          >
                            {app.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <button
                            className="text-xs font-bold px-3 py-1.5 rounded-small transition-all"
                            style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}
                            onClick={() => handleDeleteApplication(app.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </OrganizerSidebarLayout>
  );
}

export default OrganizerSponsorApplications;
