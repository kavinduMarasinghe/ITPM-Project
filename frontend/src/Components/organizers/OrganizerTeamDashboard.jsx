import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiAlertTriangle,
  FiCalendar,
  FiClock,
  FiEye,
  FiFilePlus,
  FiMapPin,
  FiSearch,
  FiSend,
  FiSlash,
  FiTrash2,
  FiUser,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import { api } from "../../services/api";
import { clearSession, getSession } from "../../services/session";
import EventRequestDetailsSections from "../events/EventRequestDetailsSections";
import OrganizerSidebarLayout from "./OrganizerSidebarLayout";

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

function OrganizerTeamDashboard() {
  const navigate = useNavigate();
  const session = getSession();
  const organizerName = session?.user?.fullName || "Organizer";
  const organizationName = session?.user?.organizationName || "Organization";

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [actingEventId, setActingEventId] = useState("");
  const [deleteTargetEvent, setDeleteTargetEvent] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [showRules, setShowRules] = useState(false);

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

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.getMyEvents();
      setEvents(response.data.events || []);
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
    loadEvents();
  }, [loadEvents]);

  const stats = useMemo(() => computeStats(events), [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesStatus =
        statusFilter === "all" || event.status === statusFilter;
      const normalizedSearch = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !normalizedSearch ||
        event.eventTitle.toLowerCase().includes(normalizedSearch) ||
        event.referenceNumber.toLowerCase().includes(normalizedSearch) ||
        event.venue.toLowerCase().includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [events, searchTerm, statusFilter]);

  const updateEventInState = (updatedEvent) => {
    setEvents((current) =>
      current.map((event) => (event.id === updatedEvent.id ? updatedEvent : event))
    );
    setSelectedEvent((current) =>
      current && current.id === updatedEvent.id ? updatedEvent : current
    );
  };

  const removeEventFromState = (eventId) => {
    setEvents((current) => current.filter((event) => event.id !== eventId));
    setSelectedEvent((current) => (current && current.id === eventId ? null : current));
  };

  const handlePublish = async (eventId) => {
    try {
      setActingEventId(eventId);
      setError("");
      setActionMessage("");
      const response = await api.publishEvent(eventId);
      updateEventInState(response.data.event);
      setActionMessage(
        "Event published successfully. Students can now see it in the events portal."
      );
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setActingEventId("");
    }
  };

  const handleCancel = async (eventId) => {
    try {
      setActingEventId(eventId);
      setError("");
      setActionMessage("");
      const response = await api.cancelEvent(eventId);
      updateEventInState(response.data.event);
      setActionMessage("Event cancelled successfully.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setActingEventId("");
    }
  };

  const openDeleteModal = (eventId) => {
    const eventToDelete = events.find((event) => event.id === eventId);

    if (!eventToDelete) {
      return;
    }

    setDeleteError("");
    setDeleteTargetEvent(eventToDelete);
  };

  const closeDeleteModal = () => {
    if (actingEventId === deleteTargetEvent?.id) {
      return;
    }

    setDeleteError("");
    setDeleteTargetEvent(null);
  };

  const handleDelete = async () => {
    if (!deleteTargetEvent) {
      return;
    }

    const eventId = deleteTargetEvent.id;

    try {
      setActingEventId(eventId);
      setError("");
      setActionMessage("");
      setDeleteError("");
      await api.deleteEvent(eventId);
      removeEventFromState(eventId);
      setDeleteTargetEvent(null);
      setActionMessage("Published event deleted successfully.");
    } catch (requestError) {
      setDeleteError(requestError.message);
    } finally {
      setActingEventId("");
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
          <p style={{ color: "#64748B" }}>Loading organizer dashboard...</p>
        </div>
      </div>
    );
  }

  const renderEventsSection = () => (
    <div>
      <div
        className="rounded-[32px] p-6 md:p-8 text-white mb-8"
        style={{ background: "linear-gradient(135deg, #F97316 0%, #0F172A 100%)" }}
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-white/70 text-sm uppercase tracking-[0.25em] mb-3">Events Desk</p>
            <h2 className="text-3xl font-bold mb-3">Welcome back, {organizerName}</h2>
            <p className="text-white/85 max-w-3xl">
              Submit event requests, wait for admin approval, and publish approved events when you
              are ready for students to see them. Approved requests can also be cancelled before publishing.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/eventrequest")}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-semibold text-white"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.16)", border: "1px solid rgba(255, 255, 255, 0.28)" }}
          >
            <FiFilePlus size={16} />
            Create Event Request
          </button>
        </div>
      </div>

      {error ? (
        <div
          className="mb-4 rounded-3xl border p-4"
          style={{ backgroundColor: "#FEF2F2", borderColor: "#FECACA", color: "#B91C1C" }}
        >
          {error}
        </div>
      ) : null}
      {actionMessage ? (
        <div
          className="mb-6 rounded-3xl border p-4"
          style={{ backgroundColor: "#ECFDF5", borderColor: "#BBF7D0", color: "#166534" }}
        >
          {actionMessage}
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
              placeholder="Search by event title, venue, or reference number"
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
                    {event.eventSummary}
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
                    Admin Notes
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

              <div className="flex flex-col sm:flex-row gap-3 mt-5">
                <button
                  type="button"
                  onClick={() => setSelectedEvent(event)}
                  className="flex-1 px-4 py-3 rounded-2xl border font-semibold inline-flex items-center justify-center gap-2"
                  style={{ borderColor: "#E2E8F0", color: "#0F172A" }}
                >
                  <FiEye size={16} />
                  View Details
                </button>

                {event.canPublish ? (
                  <>
                    <button
                      type="button"
                      disabled={actingEventId === event.id}
                      onClick={() => handlePublish(event.id)}
                      className="flex-1 px-4 py-3 rounded-2xl font-semibold text-white inline-flex items-center justify-center gap-2 disabled:opacity-70"
                      style={{ backgroundColor: "#16A34A" }}
                    >
                      <FiSend size={16} />
                      {actingEventId === event.id ? "Publishing..." : "Publish"}
                    </button>
                    <button
                      type="button"
                      disabled={actingEventId === event.id}
                      onClick={() => handleCancel(event.id)}
                      className="px-4 py-3 rounded-2xl font-semibold text-white inline-flex items-center justify-center gap-2 disabled:opacity-70"
                      style={{ backgroundColor: "#64748B" }}
                    >
                      <FiSlash size={16} />
                      Cancel
                    </button>
                  </>
                ) : null}

                {event.canDelete ? (
                  <button
                    type="button"
                    disabled={actingEventId === event.id}
                    onClick={() => openDeleteModal(event.id)}
                    className="px-4 py-3 rounded-2xl font-semibold text-white inline-flex items-center justify-center gap-2 disabled:opacity-70"
                    style={{ backgroundColor: "#DC2626" }}
                  >
                    <FiTrash2 size={16} />
                    {actingEventId === event.id ? "Deleting..." : "Delete"}
                  </button>
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
          <FiFilePlus size={34} className="mx-auto mb-4" style={{ color: "#94A3B8" }} />
          <h3 className="text-xl font-bold mb-2" style={{ color: "#0F172A" }}>
            No event requests found
          </h3>
          <p className="mb-6" style={{ color: "#64748B" }}>
            Create a new event request to start the approval flow.
          </p>
          <button
            type="button"
            onClick={() => navigate("/eventrequest")}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-white font-semibold"
            style={{ backgroundColor: "#F97316" }}
          >
            <FiFilePlus size={16} />
            Create Event Request
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F4F6F9" }}>
      <OrganizerSidebarLayout
        organizationName={organizationName}
        activeSection="events"
        //headerMeta={session?.user?.email || organizationName}
        onSectionChange={() => {}}
        onLogout={() => handleLogout()}
        loggingOut={loggingOut}
        onShowRules={() => setShowRules(true)}
      >
        {renderEventsSection()}
      </OrganizerSidebarLayout>

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
                  Event Request
                </p>
                <h2 className="text-2xl font-bold" style={{ color: "#0F172A" }}>
                  {selectedEvent.eventTitle}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
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
                  { label: "Reference", value: selectedEvent.referenceNumber, icon: FiUser },
                  { label: "Organization", value: selectedEvent.organizationName, icon: FiUser },
                  { label: "Date", value: selectedEvent.eventDate, icon: FiCalendar },
                  { label: "Time", value: `${selectedEvent.eventTime} - ${selectedEvent.eventEndTime}`, icon: FiClock },
                  { label: "Venue", value: selectedEvent.venue, icon: FiMapPin },
                  { label: "Expected Attendees", value: `${selectedEvent.expectedAttendees}`, icon: FiUsers },
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

              {selectedEvent.reviewNotes ? (
                <div
                  className="rounded-3xl p-5"
                  style={{
                    backgroundColor:
                      selectedEvent.status === "rejected" ? "#FEF2F2" : "#EFF6FF",
                  }}
                >
                  <h3 className="text-lg font-bold mb-2" style={{ color: "#0F172A" }}>
                    Review Notes
                  </h3>
                  <p
                    style={{
                      color:
                        selectedEvent.status === "rejected" ? "#B91C1C" : "#1D4ED8",
                    }}
                  >
                    {selectedEvent.reviewNotes}
                  </p>
                </div>
              ) : null}

              <div>
                <h3 className="text-lg font-bold mb-3" style={{ color: "#0F172A" }}>
                  Status Timeline
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

              {selectedEvent.canDelete ? (
                <div className="border-t pt-6" style={{ borderColor: "#E2E8F0" }}>
                  <button
                    type="button"
                    disabled={actingEventId === selectedEvent.id}
                    onClick={() => openDeleteModal(selectedEvent.id)}
                    className="w-full px-5 py-3 rounded-2xl font-semibold text-white inline-flex items-center justify-center gap-2 disabled:opacity-70"
                    style={{ backgroundColor: "#DC2626" }}
                  >
                    <FiTrash2 size={16} />
                    {actingEventId === selectedEvent.id
                      ? "Deleting Published Event..."
                      : "Delete Published Event"}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {deleteTargetEvent ? (
        <div className="fixed inset-0 bg-black/55 z-[60] p-4 flex items-center justify-center">
          <div
            className="w-full max-w-lg bg-white rounded-[32px] border shadow-2xl"
            style={{ borderColor: "#E2E8F0" }}
          >
            <div className="p-6 md:p-7">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                style={{ backgroundColor: "#FEF2F2", color: "#DC2626" }}
              >
                <FiAlertTriangle size={26} />
              </div>

              <p
                className="text-sm font-semibold uppercase tracking-[0.22em] mb-2"
                style={{ color: "#F97316" }}
              >
                Confirm Delete
              </p>
              <h3 className="text-2xl font-bold mb-3" style={{ color: "#0F172A" }}>
                Remove published event?
              </h3>
              <p className="leading-7" style={{ color: "#475569" }}>
                Delete <span className="font-semibold">"{deleteTargetEvent.eventTitle}"</span> from
                the published events list. This will remove it from the student portal.
              </p>

              <div
                className="mt-5 rounded-3xl p-4"
                style={{ backgroundColor: "#FFF7ED", border: "1px solid #FED7AA" }}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] mb-2" style={{ color: "#C2410C" }}>
                  Event Reference
                </p>
                <p className="font-semibold" style={{ color: "#7C2D12" }}>
                  {deleteTargetEvent.referenceNumber}
                </p>
              </div>

              {deleteError ? (
                <div
                  className="mt-5 rounded-3xl border p-4"
                  style={{ backgroundColor: "#FEF2F2", borderColor: "#FECACA", color: "#B91C1C" }}
                >
                  {deleteError}
                </div>
              ) : null}

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  disabled={actingEventId === deleteTargetEvent.id}
                  className="flex-1 px-5 py-3 rounded-2xl font-semibold border disabled:opacity-70"
                  style={{ borderColor: "#E2E8F0", color: "#0F172A" }}
                >
                  Keep Event
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={actingEventId === deleteTargetEvent.id}
                  className="flex-1 px-5 py-3 rounded-2xl font-semibold text-white inline-flex items-center justify-center gap-2 disabled:opacity-70"
                  style={{ backgroundColor: "#DC2626" }}
                >
                  <FiTrash2 size={16} />
                  {actingEventId === deleteTargetEvent.id ? "Deleting..." : "Delete Event"}
                </button>
                
              </div>
            </div>
          </div>
        </div>
      ) : null}
                {showRules && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">

            {/* MODAL */}
            <div className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl transform transition-all duration-300 scale-100">

              {/* HEADER */}
              <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white rounded-t-3xl">
                <h2 className="text-2xl font-bold">
                  SLIIT Event Rules & Guidelines
                </h2>
                <button
                  onClick={() => setShowRules(false)}
                  className="text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              {/* CONTENT */}
              <div className="p-6">

                {/* SCROLL AREA (NO LIBRARY) */}
                <div className="h-[500px] overflow-y-auto rounded-lg border p-4 bg-gray-50 space-y-6">

                  {/* Header */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-orange-500 text-lg">📄</span>
                      <h3 className="text-lg font-bold">
                        STUDENT EVENT APPLICATION FORM
                      </h3>
                    </div>

                    <span className="inline-block mt-2 px-3 py-1 text-xs rounded-full bg-gray-200 font-semibold">
                      Version – January 2026
                    </span>
                  </div>

                  {/* Important Guidelines */}
                  <div className="rounded-lg border bg-yellow-50 p-3">
                    <div className="flex items-center gap-2 text-yellow-700 font-semibold text-sm">
                      ⚠️ Important Guidelines
                    </div>

                    <ul className="text-sm space-y-1.5 list-disc pl-5 mt-2">
                      <li>The completed Event Form should be submitted to the approving Authority minimum <strong>two weeks in advance</strong> to the proposed event.</li>
                      <li>All requirements should be included in this form and any additional item requested later will not be entertained.</li>
                      <li>If an event requires SIS funding, the completed event form must reach the Student Services Division <strong>8 weeks in advance</strong>.</li>
                      <li>Sections with an asterisk (*) indicates compulsory information.</li>
                      <li>Incomplete and late event forms will <strong>not</strong> be processed.</li>
                    </ul>
                  </div>

                  {/* Event Details */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-500">📘</span>
                      <h4 className="font-semibold">Required Event Details</h4>
                    </div>

                    <ol className="text-sm space-y-1 list-decimal pl-5 mt-2">
                      <li>Event Title *</li>
                      <li>Name of the Student Community/Society/Club hosting the event *</li>
                      <li>Club category type (Student Interactive Society, Faculty Student Community, Faculty Specialization, Cross-discipline, World-wide membership)</li>
                      <li>Event Details: Date, Venue, Time, Event categorization</li>
                      <li>Statement about the function and objectives</li>
                      <li>Internal & External Audience details</li>
                      <li>Expected number of participants (guests + participants)</li>
                      <li>Vehicle parking requirements</li>
                    </ol>
                  </div>

                  {/* Organizing Students */}
                  <div>
                    <h4 className="font-semibold">Details of Organizing Students</h4>
                    <p className="text-sm mt-2">
                      Must include: Name, Registration No., Current Year/Semester, Designation, Contact No., and Signature.
                      The President of the Club/Society <strong>must</strong> be a signatory.
                      Students in charge of cleaning the premises must also be listed.
                    </p>
                  </div>

                  {/* Fund Management */}
                  <div>
                    <h4 className="font-semibold">Fundraising & Fund Management</h4>
                    <ul className="text-sm list-disc pl-5 mt-2 space-y-1">
                      <li>All event accounts are subject to auditing by SLIIT.</li>
                      <li>All funds must be deposited & all payments made from the SLIIT-approved Community/Society/Club's bank account.</li>
                      <li>Budget must be certified by Senior Treasurer/Staff Advisor (SLIIT staff member).</li>
                      <li>Finalized accounts must be published to maintain financial transparency.</li>
                      <li>Accounts for the event must be submitted within two weeks of conclusion.</li>
                    </ul>
                  </div>

                  {/* Resources */}
                  <div>
                    <h4 className="font-semibold">Use of SLIIT Resources</h4>
                    <ul className="text-sm list-disc pl-5 mt-2 space-y-1">
                      <li>Playground, Lecture Halls, Auditorium, or other SLIIT premises</li>
                      <li>Electricity, Audio Visual Equipment (must be quantified)</li>
                      <li>Approval to sell tickets, assemble stalls, seek sponsorships, invite outsiders</li>
                      <li>Use of SLIIT virtual platforms (Teams, SLIIT Tube)</li>
                      <li>External equipment/companies/vendors coming onto campus must be detailed</li>
                    </ul>
                  </div>

                  {/* Staff */}
                  <div>
                    <h4 className="font-semibold">Staff Members Responsible</h4>
                    <p className="text-sm mt-2">
                      Staff members undertake responsibility to oversee the entire event, act as advisors and confirm presence at the venue.
                      One signatory MUST be the assigned Staff Advisor of the Club/Society.
                      The form should reach staff at least 2 weeks prior.
                    </p>
                  </div>

                  {/* Approval */}
                  <div>
                    <h4 className="font-semibold">Approval Chain</h4>
                    <ol className="text-sm list-decimal pl-5 mt-2 space-y-1">
                      <li>Student Services — checks date/time availability vs. annual plan</li>
                      <li>Instructional Resources Center (IRC) — venue/lecture hall reservation</li>
                      <li>Manager Facilities Management</li>
                      <li>Director Campus Security and Safety</li>
                      <li>Senior/Director Administration</li>
                      <li>Director Marketing</li>
                      <li>Senior Manager ITSD</li>
                      <li>Medical Officer (for physical activity events)</li>
                      <li>Relevant Faculty Dean/Director Academic Affairs</li>
                    </ol>
                  </div>

                  {/* Terms */}
                  <div className="rounded-lg border bg-red-50 p-3">
                    <div className="flex items-center gap-2 font-semibold">
                      🛡️ Terms & Conditions
                    </div>

                    <ol className="text-sm list-[lower-roman] pl-5 mt-2 space-y-2">
                      <li>All Clubs and Societies must review Annex documents.</li>
                      <li>SLIIT reserves the right to take immediate action.</li>
                      <li>You are responsible for protecting property.</li>
                      <li>No alterations without permission.</li>
                      <li>Approval required for decorations.</li>
                      <li>Damages are your responsibility.</li>
                      <li>No deviation from approvals.</li>
                      <li>Sound permits required.</li>
                      <li>Drone approval required.</li>
                      <li>Cleaning is mandatory.</li>
                      <li>SLIIT can adjust sound.</li>
                      <li>Event may be terminated.</li>
                      <li>Sponsorships must be ethical.</li>
                    </ol>
                  </div>

                </div>
              </div>

              {/* FOOTER */}
              <div className="p-6 border-t flex justify-end">
                <button
                  onClick={() => setShowRules(false)}
                  className="px-5 py-2 rounded-xl bg-orange-500 text-white font-semibold hover:opacity-90"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        )}
    </div>
  );
}

export default OrganizerTeamDashboard;