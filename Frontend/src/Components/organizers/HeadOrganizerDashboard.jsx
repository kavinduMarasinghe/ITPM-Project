import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiBriefcase,
  FiCheckCircle,
  FiClock,
  FiEye,
  FiFilter,
  FiLogOut,
  FiMail,
  FiPhone,
  FiSearch,
  FiUser,
  FiUsers,
  FiXCircle,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import { api } from "../../services/api";
import { clearSession, getSession } from "../../services/session";

const emptyStats = {
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
};

function HeadOrganizerDashboard() {
  const navigate = useNavigate();
  const session = getSession();
  const [organizers, setOrganizers] = useState([]);
  const [stats, setStats] = useState(emptyStats);
  const [selectedOrganizer, setSelectedOrganizer] = useState(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  const viewerName = session?.user?.fullName || "Head Organizer";
  const viewerRole = session?.user?.role === "admin" ? "Administrator" : "Head Organizer";

  const filteredOrganizers = useMemo(() => {
    return organizers.filter((organizer) => {
      const matchesStatus =
        filterStatus === "all" || organizer.status === filterStatus;
      const matchesSearch =
        !searchTerm ||
        organizer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        organizer.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        organizer.email.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [filterStatus, organizers, searchTerm]);

  const handleLogout = useCallback(async (message) => {
    try {
      setLoggingOut(true);

      if (session?.token) {
        await api.logout();
      }
    } catch (requestError) {
      // Clear the local session even if the backend session is already gone.
    } finally {
      clearSession();
      setLoggingOut(false);
      navigate("/login", {
        replace: true,
        state: message ? { message } : undefined,
      });
    }
  }, [navigate, session?.token]);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [organizersResponse, statsResponse] = await Promise.all([
        api.getOrganizerApplications(),
        api.getOrganizerStats(),
      ]);

      setOrganizers(organizersResponse.data.organizers);
      setStats(statsResponse.data.stats);
    } catch (requestError) {
      if (/session|token|permission/i.test(requestError.message)) {
        handleLogout("Your session expired. Please sign in again.");
        return;
      }

      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [handleLogout]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleStatusUpdate = async (status) => {
    if (!selectedOrganizer) {
      return;
    }

    try {
      setSaving(true);
      const response = await api.updateOrganizerStatus(selectedOrganizer.id, {
        status,
        notes: reviewNotes,
      });

      const updatedOrganizer = response.data.organizer;

      setOrganizers((current) => {
        const nextOrganizers = current.map((organizer) =>
          organizer.id === updatedOrganizer.id ? updatedOrganizer : organizer
        );

        setStats({
          total: nextOrganizers.length,
          pending: nextOrganizers.filter((organizer) => organizer.status === "pending")
            .length,
          approved: nextOrganizers.filter((organizer) => organizer.status === "approved")
            .length,
          rejected: nextOrganizers.filter((organizer) => organizer.status === "rejected")
            .length,
        });

        return nextOrganizers;
      });

      setReviewNotes("");
      setSelectedOrganizer(null);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const getStatusStyles = (status) => {
    if (status === "approved") {
      return "bg-green-100 text-green-700 border-green-200";
    }

    if (status === "rejected") {
      return "bg-red-100 text-red-700 border-red-200";
    }

    return "bg-amber-100 text-amber-700 border-amber-200";
  };

  const canReviewSelectedOrganizer =
    selectedOrganizer?.status === "pending";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F4F6F9" }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p style={{ color: "#64748B" }}>Loading approval dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F4F6F9" }}>
      <header className="bg-white border-b sticky top-0 z-40" style={{ borderColor: "#E2E8F0" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: "#F97316" }}
            >
              <FiBriefcase size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: "#0F172A" }}>
                EventAura Approval Desk
              </h1>
              <p className="text-xs" style={{ color: "#64748B" }}>
                {viewerRole}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold" style={{ color: "#0F172A" }}>
                {viewerName}
              </p>
              <p className="text-xs" style={{ color: "#64748B" }}>
                {viewerRole}
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleLogout()}
              disabled={loggingOut}
              className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 py-2 rounded-lg font-medium shadow-sm hover:bg-accent/90 transition-all duration-200 hover:shadow-md disabled:opacity-70"
            >
              <FiLogOut size={16} />
              {loggingOut ? "Signing Out..." : "Sign Out"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 rounded-2xl p-4 border" style={{ backgroundColor: "#FEF2F2", borderColor: "#FECACA", color: "#B91C1C" }}>
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Applications", value: stats.total, icon: FiUsers, color: "#F97316" },
            { label: "Pending Review", value: stats.pending, icon: FiClock, color: "#F59E0B" },
            { label: "Approved", value: stats.approved, icon: FiCheckCircle, color: "#22C55E" },
            { label: "Rejected", value: stats.rejected, icon: FiXCircle, color: "#EF4444" },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="bg-white rounded-2xl border p-5 shadow-sm"
                style={{ borderColor: "#E2E8F0" }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm" style={{ color: "#64748B" }}>
                      {item.label}
                    </p>
                    <p className="text-3xl font-bold mt-2" style={{ color: "#0F172A" }}>
                      {item.value}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${item.color}15` }}>
                    <Icon size={22} style={{ color: item.color }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div
          className="bg-white rounded-2xl border p-4 shadow-sm mb-6 flex flex-col md:flex-row gap-4"
          style={{ borderColor: "#E2E8F0" }}
        >
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#64748B" }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by organizer, organization, or email"
              className="w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
              style={{ borderColor: "#E2E8F0" }}
            />
          </div>
          <div className="relative md:w-64">
            <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#64748B" }} />
            <select
              value={filterStatus}
              onChange={(event) => setFilterStatus(event.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border appearance-none focus:outline-none focus:ring-2"
              style={{ borderColor: "#E2E8F0" }}
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {filteredOrganizers.length === 0 ? (
          <div className="bg-white rounded-2xl border p-10 text-center shadow-sm" style={{ borderColor: "#E2E8F0" }}>
            <p className="text-lg font-semibold mb-2" style={{ color: "#0F172A" }}>
              No organizer applications found
            </p>
            <p style={{ color: "#64748B" }}>
              Try changing the search or filter to see more registrations.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredOrganizers.map((organizer) => (
              <div
                key={organizer.id}
                className="bg-white rounded-2xl border p-6 shadow-sm h-full flex flex-col"
                style={{ borderColor: "#E2E8F0" }}
              >
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <h2 className="text-xl font-bold" style={{ color: "#0F172A" }}>
                      {organizer.fullName}
                    </h2>
                    <p className="text-sm" style={{ color: "#64748B" }}>
                      {organizer.position || "Organizer"}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusStyles(organizer.status)}`}>
                    {organizer.status.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-2 mb-5">
                  <div className="flex items-center gap-2 text-sm" style={{ color: "#64748B" }}>
                    <FiMail size={14} style={{ color: "#F97316" }} />
                    {organizer.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm" style={{ color: "#64748B" }}>
                    <FiPhone size={14} style={{ color: "#F97316" }} />
                    {organizer.phone || "Phone not provided"}
                  </div>
                  <div className="flex items-center gap-2 text-sm" style={{ color: "#64748B" }}>
                    <FiUser size={14} style={{ color: "#F97316" }} />
                    {organizer.organizationName}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="rounded-xl p-3" style={{ backgroundColor: "#F8FAFC" }}>
                    <p className="text-xs mb-1" style={{ color: "#64748B" }}>
                      Experience
                    </p>
                    <p className="font-semibold" style={{ color: "#0F172A" }}>
                      {organizer.yearsOfExperience} years
                    </p>
                  </div>
                  <div className="rounded-xl p-3" style={{ backgroundColor: "#F8FAFC" }}>
                    <p className="text-xs mb-1" style={{ color: "#64748B" }}>
                      Submitted
                    </p>
                    <p className="font-semibold" style={{ color: "#0F172A" }}>
                      {new Date(organizer.submittedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {organizer.reviewNotes && (
                  <div className="mb-5 rounded-xl p-3" style={{ backgroundColor: "#FFF7ED" }}>
                    <p className="text-xs font-semibold mb-1" style={{ color: "#C2410C" }}>
                      Review Notes
                    </p>
                    <p className="text-sm" style={{ color: "#7C2D12" }}>
                      {organizer.reviewNotes}
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setSelectedOrganizer(organizer);
                    setReviewNotes(organizer.reviewNotes || "");
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 text-white py-3 rounded-xl font-semibold mt-auto"
                  style={{ backgroundColor: "#F97316" }}
                >
                  <FiEye size={16} />
                  Review Application
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {selectedOrganizer && (
        <div className="fixed inset-0 bg-black/50 p-4 flex items-center justify-center z-50">
          <div className="w-full max-w-3xl bg-white rounded-3xl border shadow-2xl max-h-[90vh] overflow-y-auto" style={{ borderColor: "#E2E8F0" }}>
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between" style={{ borderColor: "#E2E8F0" }}>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: "#0F172A" }}>
                  {selectedOrganizer.fullName}
                </h2>
                <p className="text-sm" style={{ color: "#64748B" }}>
                  {selectedOrganizer.organizationName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrganizer(null)}
                className="text-slate-500 hover:text-slate-800"
              >
                <FiXCircle size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl p-4" style={{ backgroundColor: "#F8FAFC" }}>
                  <p className="text-xs mb-1" style={{ color: "#64748B" }}>Email</p>
                  <p className="font-semibold" style={{ color: "#0F172A" }}>{selectedOrganizer.email}</p>
                </div>
                <div className="rounded-2xl p-4" style={{ backgroundColor: "#F8FAFC" }}>
                  <p className="text-xs mb-1" style={{ color: "#64748B" }}>Phone</p>
                  <p className="font-semibold" style={{ color: "#0F172A" }}>{selectedOrganizer.phone || "Not provided"}</p>
                </div>
                <div className="rounded-2xl p-4" style={{ backgroundColor: "#F8FAFC" }}>
                  <p className="text-xs mb-1" style={{ color: "#64748B" }}>Organization Type</p>
                  <p className="font-semibold" style={{ color: "#0F172A" }}>{selectedOrganizer.organizationType || "Not provided"}</p>
                </div>
                <div className="rounded-2xl p-4" style={{ backgroundColor: "#F8FAFC" }}>
                  <p className="text-xs mb-1" style={{ color: "#64748B" }}>Years of Experience</p>
                  <p className="font-semibold" style={{ color: "#0F172A" }}>{selectedOrganizer.yearsOfExperience}</p>
                </div>
              </div>

              <div className="rounded-2xl p-5" style={{ backgroundColor: "#FFF7ED" }}>
                <h3 className="text-lg font-bold mb-3" style={{ color: "#9A3412" }}>
                  Application Snapshot
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm" style={{ color: "#7C2D12" }}>
                  <p><strong>Organization Email:</strong> {selectedOrganizer.organizationEmail || "Not provided"}</p>
                  <p><strong>Organization Phone:</strong> {selectedOrganizer.organizationPhone || "Not provided"}</p>
                  <p><strong>Position:</strong> {selectedOrganizer.position || "Not provided"}</p>
                  <p><strong>Status:</strong> {selectedOrganizer.status}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#0F172A" }}>
                  {canReviewSelectedOrganizer ? "Review Notes" : "Decision Notes"}
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(event) => setReviewNotes(event.target.value)}
                  rows="4"
                  className="w-full rounded-2xl border px-4 py-3 focus:outline-none focus:ring-2"
                  style={{ borderColor: "#E2E8F0" }}
                  placeholder={
                    canReviewSelectedOrganizer
                      ? "Add notes for approval or rejection"
                      : "This application has already been reviewed."
                  }
                  disabled={!canReviewSelectedOrganizer}
                />
              </div>

              {canReviewSelectedOrganizer ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleStatusUpdate("approved")}
                    className="flex-1 text-white py-3 rounded-2xl font-semibold disabled:opacity-60"
                    style={{ backgroundColor: "#22C55E" }}
                  >
                    {saving ? "Saving..." : "Approve Organizer"}
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleStatusUpdate("rejected")}
                    className="flex-1 text-white py-3 rounded-2xl font-semibold disabled:opacity-60"
                    style={{ backgroundColor: "#EF4444" }}
                  >
                    {saving ? "Saving..." : "Reject Organizer"}
                  </button>
                </div>
              ) : (
                <div
                  className="rounded-2xl border px-4 py-3 text-sm font-medium"
                  style={{
                    backgroundColor: "#F8FAFC",
                    borderColor: "#E2E8F0",
                    color: "#475569",
                  }}
                >
                  This application has already been {selectedOrganizer.status}.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HeadOrganizerDashboard;
