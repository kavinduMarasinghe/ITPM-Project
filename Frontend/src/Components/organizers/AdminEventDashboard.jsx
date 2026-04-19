import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiEye,
  FiFileText,
  FiLogOut,
  FiMapPin,
  FiSearch,
  FiUser,
  FiUsers,
  FiX,
  FiXCircle,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import { api } from "../../services/api";
import { clearSession, getSession } from "../../services/session";
import EventRequestDetailsSections from "../events/EventRequestDetailsSections";

function computeStats(events) {
  return {
    total: events.length,
    pending: events.filter((event) => event.status === "pending").length,
    approved: events.filter((event) => event.status === "approved").length,
    published: events.filter((event) => event.status === "published").length,
    rejected: events.filter((event) => event.status === "rejected").length,
    cancelled: events.filter((event) => event.status === "cancelled").length,
  };
}

function getStatusStyles(status) {
  switch (status) {
    case "approved":
      return { backgroundColor: "#DBEAFE", color: "#1D4ED8" };
    case "published":
      return { backgroundColor: "#DCFCE7", color: "#166534" };
    case "rejected":
      return { backgroundColor: "#FEE2E2", color: "#B91C1C" };
    case "cancelled":
      return { backgroundColor: "#F1F5F9", color: "#475569" };
    default:
      return { backgroundColor: "#FEF3C7", color: "#B45309" };
  }
}

function AdminEventDashboard() {
  const navigate = useNavigate();
  const session = getSession();
  const adminName = session?.user?.fullName || "Admin";

  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(computeStats([]));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [reviewNotes, setReviewNotes] = useState("");

  const handleLogout = useCallback(
    async (message) => {
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
    },
    [navigate, session?.token]
  );

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [eventsResponse, statsResponse] = await Promise.all([
        api.getAdminEvents(),
        api.getAdminEventStats(),
      ]);

      const nextEvents = eventsResponse.data.events || [];
      setEvents(nextEvents);
      setStats(statsResponse.data.stats || computeStats(nextEvents));
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

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesStatus =
        statusFilter === "all" || event.status === statusFilter;
      const normalizedSearch = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !normalizedSearch ||
        event.eventTitle.toLowerCase().includes(normalizedSearch) ||
        event.organizationName.toLowerCase().includes(normalizedSearch) ||
        event.referenceNumber.toLowerCase().includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [events, searchTerm, statusFilter]);

  const handleReview = async (status) => {
    if (!selectedEvent) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await api.reviewEvent(selectedEvent.id, {
        status,
        notes: reviewNotes,
      });
      const updatedEvent = response.data.event;

      setEvents((current) => {
        const nextEvents = current.map((event) =>
          event.id === updatedEvent.id ? updatedEvent : event
        );
        setStats(computeStats(nextEvents));
        return nextEvents;
      });

      setSelectedEvent(null);
      setReviewNotes("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F4F6F9" }}>
        <div className="text-center">
          <div
            className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: "#F97316", borderTopColor: "transparent" }}
          />
          <p style={{ color: "#64748B" }}>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F4F6F9" }}>
      <header className="bg-white border-b sticky top-0 z-40" style={{ borderColor: "#E2E8F0" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: "#F97316" }}>
              Admin Approval Desk
            </p>
            <h1 className="text-xl font-bold" style={{ color: "#0F172A" }}>
              Event Request Management
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold" style={{ color: "#0F172A" }}>
                {adminName}
              </p>
              <p className="text-xs" style={{ color: "#64748B" }}>
                Administrator
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
        <div
          className="rounded-[32px] p-6 md:p-8 text-white mb-8"
          style={{ background: "linear-gradient(135deg, #0F172A 0%, #F97316 100%)" }}
        >
          <p className="text-white/70 text-sm uppercase tracking-[0.25em] mb-3">Approval Flow</p>
          <h2 className="text-3xl font-bold mb-3">Review organizer event requests</h2>
          <p className="text-white/85 max-w-3xl">
            Head Organizer handles organization registrations. Admin reviews event requests,
            approves or rejects them, and organizers can publish approved events when ready.
          </p>
        </div>

        {error ? (
          <div
            className="mb-6 rounded-3xl border p-4"
            style={{ backgroundColor: "#FEF2F2", borderColor: "#FECACA", color: "#B91C1C" }}
          >
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6 mb-8">
          {[
            { label: "Total", value: stats.total, color: "#F97316" },
            { label: "Pending", value: stats.pending, color: "#D97706" },
            { label: "Approved", value: stats.approved, color: "#2563EB" },
            { label: "Published", value: stats.published, color: "#16A34A" },
            { label: "Rejected", value: stats.rejected, color: "#DC2626" },
            { label: "Cancelled", value: stats.cancelled, color: "#64748B" },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white rounded-3xl border p-4 shadow-sm"
              style={{ borderColor: "#E2E8F0" }}
            >
              <p className="text-sm" style={{ color: "#64748B" }}>
                {item.label}
              </p>
              <p className="text-3xl font-bold mt-2" style={{ color: item.color }}>
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div
          className="bg-white rounded-[28px] border p-5 md:p-6 shadow-sm mb-6"
          style={{ borderColor: "#E2E8F0" }}
        >
          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <div className="relative">
              <FiSearch
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: "#64748B" }}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by title, organization, or reference number"
                className="w-full rounded-2xl border py-3 pl-11 pr-4 focus:outline-none focus:ring-2"
                style={{ borderColor: "#E2E8F0" }}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-2xl border px-4 py-3 focus:outline-none focus:ring-2"
              style={{ borderColor: "#E2E8F0" }}
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="published">Published</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {filteredEvents.length > 0 ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-[28px] border p-6 shadow-sm"
                style={{ borderColor: "#E2E8F0" }}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-2" style={{ color: "#94A3B8" }}>
                      {event.referenceNumber}
                    </p>
                    <h3 className="text-2xl font-bold" style={{ color: "#0F172A" }}>
                      {event.eventTitle}
                    </h3>
                    <p className="mt-1" style={{ color: "#64748B" }}>
                      {event.organizationName}
                    </p>
                  </div>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold capitalize"
                    style={getStatusStyles(event.status)}
                  >
                    {event.status}
                  </span>
                </div>

                <div className="grid gap-3 text-sm md:grid-cols-2" style={{ color: "#64748B" }}>
                  <div className="flex items-center gap-2">
                    <FiCalendar size={14} style={{ color: "#F97316" }} />
                    {event.eventDate}
                  </div>
                  <div className="flex items-center gap-2">
                    <FiClock size={14} style={{ color: "#F97316" }} />
                    {event.eventTime} - {event.eventEndTime}
                  </div>
                  <div className="flex items-center gap-2">
                    <FiMapPin size={14} style={{ color: "#F97316" }} />
                    {event.venue}
                  </div>
                  <div className="flex items-center gap-2">
                    <FiUsers size={14} style={{ color: "#F97316" }} />
                    {event.expectedAttendees} expected
                  </div>
                </div>

                {event.reviewNotes ? (
                  <div
                    className="mt-4 rounded-3xl p-4"
                    style={{
                      backgroundColor: event.status === "rejected" ? "#FEF2F2" : "#EFF6FF",
                    }}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-2" style={{ color: "#64748B" }}>
                      Review Notes
                    </p>
                    <p
                      style={{
                        color: event.status === "rejected" ? "#B91C1C" : "#1D4ED8",
                      }}
                    >
                      {event.reviewNotes}
                    </p>
                  </div>
                ) : null}

                <div className="flex gap-3 mt-5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedEvent(event);
                      setReviewNotes(event.reviewNotes || "");
                    }}
                    className="flex-1 px-4 py-3 rounded-2xl border font-semibold inline-flex items-center justify-center gap-2"
                    style={{ borderColor: "#E2E8F0", color: "#0F172A" }}
                  >
                    <FiEye size={16} />
                    View Details
                  </button>
                  {event.status === "pending" ? (
                    <div
                      className="px-4 py-3 rounded-2xl text-sm font-semibold"
                      style={{ backgroundColor: "#FFF7ED", color: "#C2410C" }}
                    >
                      Needs Review
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="bg-white rounded-[28px] border p-10 text-center shadow-sm"
            style={{ borderColor: "#E2E8F0" }}
          >
            <FiFileText size={34} className="mx-auto mb-4" style={{ color: "#94A3B8" }} />
            <h3 className="text-xl font-bold mb-2" style={{ color: "#0F172A" }}>
              No event requests found
            </h3>
            <p style={{ color: "#64748B" }}>
              Try adjusting the filters or wait for a new organizer submission.
            </p>
          </div>
        )}
      </main>

      {selectedEvent ? (
        <div className="fixed inset-0 bg-black/50 z-50 p-4 flex items-center justify-center">
          <div
            className="w-full max-w-3xl bg-white rounded-[32px] border shadow-2xl max-h-[90vh] overflow-y-auto"
            style={{ borderColor: "#E2E8F0" }}
          >
            <div
              className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between"
              style={{ borderColor: "#E2E8F0" }}
            >
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: "#F97316" }}>
                  Admin Review
                </p>
                <h2 className="text-2xl font-bold" style={{ color: "#0F172A" }}>
                  {selectedEvent.eventTitle}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedEvent(null);
                  setReviewNotes("");
                }}
                className="p-2 rounded-xl hover:bg-slate-100 transition"
              >
                <FiX size={20} style={{ color: "#475569" }} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex flex-wrap gap-2">
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: "#FFF7ED", color: "#C2410C" }}
                >
                  {selectedEvent.eventType}
                </span>
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold capitalize"
                  style={getStatusStyles(selectedEvent.status)}
                >
                  {selectedEvent.status}
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { label: "Reference", value: selectedEvent.referenceNumber, icon: FiCheckCircle },
                  { label: "Organization", value: selectedEvent.organizationName, icon: FiUser },
                  { label: "Organizer", value: selectedEvent.organizerName, icon: FiUser },
                  { label: "Expected Attendees", value: `${selectedEvent.expectedAttendees}`, icon: FiUsers },
                  { label: "Date", value: selectedEvent.eventDate, icon: FiCalendar },
                  { label: "Venue", value: selectedEvent.venue, icon: FiMapPin },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className="rounded-3xl p-4"
                      style={{ backgroundColor: "#F8FAFC" }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon size={15} style={{ color: "#F97316" }} />
                        <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "#64748B" }}>
                          {item.label}
                        </p>
                      </div>
                      <p className="font-semibold" style={{ color: "#0F172A" }}>
                        {item.value}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2" style={{ color: "#0F172A" }}>
                  Summary
                </h3>
                <p style={{ color: "#64748B" }}>{selectedEvent.eventSummary}</p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2" style={{ color: "#0F172A" }}>
                  Description
                </h3>
                <p className="leading-7" style={{ color: "#475569" }}>
                  {selectedEvent.eventDescription}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-3" style={{ color: "#0F172A" }}>
                  Extended Request Details
                </h3>
                <EventRequestDetailsSections event={selectedEvent} />
              </div>

              <div>
                <h3 className="text-lg font-bold mb-3" style={{ color: "#0F172A" }}>
                  Timeline
                </h3>
                <div className="space-y-3">
                  {(selectedEvent.statusHistory || []).map((item, index) => (
                    <div key={`${item.status}-${item.date}-${index}`} className="flex gap-3">
                      <div
                        className="w-2.5 h-2.5 rounded-full mt-2"
                        style={{ backgroundColor: "#F97316" }}
                      />
                      <div>
                        <p className="font-semibold capitalize" style={{ color: "#0F172A" }}>
                          {item.status}
                        </p>
                        <p className="text-xs" style={{ color: "#64748B" }}>
                          {new Date(item.date).toLocaleString()} by {item.by}
                        </p>
                        <p className="text-sm mt-1" style={{ color: "#475569" }}>
                          {item.notes}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedEvent.status === "pending" ? (
                <div className="border-t pt-5" style={{ borderColor: "#E2E8F0" }}>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "#0F172A" }}>
                    Review Notes
                  </label>
                  <textarea
                    value={reviewNotes}
                    onChange={(event) => setReviewNotes(event.target.value)}
                    rows="4"
                    className="w-full rounded-2xl border px-4 py-3 focus:outline-none focus:ring-2 resize-none"
                    style={{ borderColor: "#E2E8F0" }}
                    placeholder="Optional notes for the organizer"
                  />

                  <div className="flex flex-col sm:flex-row gap-3 mt-4">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => handleReview("approved")}
                      className="flex-1 px-5 py-3 rounded-2xl font-semibold text-white inline-flex items-center justify-center gap-2 disabled:opacity-70"
                      style={{ backgroundColor: "#16A34A" }}
                    >
                      <FiCheckCircle size={16} />
                      {saving ? "Saving..." : "Approve Request"}
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => handleReview("rejected")}
                      className="flex-1 px-5 py-3 rounded-2xl font-semibold text-white inline-flex items-center justify-center gap-2 disabled:opacity-70"
                      style={{ backgroundColor: "#DC2626" }}
                    >
                      <FiXCircle size={16} />
                      {saving ? "Saving..." : "Reject Request"}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default AdminEventDashboard;
