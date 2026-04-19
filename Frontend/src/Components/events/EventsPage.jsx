import React, { useEffect, useMemo, useState } from "react";
import {
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiEye,
  FiFilter,
  FiMapPin,
  FiSearch,
  FiStar,
  FiUser,
  FiUsers,
  FiX,
} from "react-icons/fi";

import { api } from "../../services/api";
import { getSession } from "../../services/session";

function isSameDay(leftDate, rightDate) {
  return (
    leftDate.getFullYear() === rightDate.getFullYear() &&
    leftDate.getMonth() === rightDate.getMonth() &&
    leftDate.getDate() === rightDate.getDate()
  );
}

function formatFullDate(dateValue) {
  return new Date(dateValue).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(dateValue) {
  return new Date(dateValue).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeRequestError(requestError) {
  return requestError.message === "Route not found."
    ? "The backend is still running an older version. Restart the backend server, then reload this page."
    : requestError.message;
}

function buildFallbackEventImage(eventTitle, eventType) {
  const safeTitle = String(eventTitle || "Campus Event")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
  const safeType = String(eventType || "General")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0F172A" />
          <stop offset="100%" stop-color="#F97316" />
        </linearGradient>
      </defs>
      <rect width="1200" height="720" rx="36" fill="url(#g)" />
      <circle cx="1040" cy="110" r="160" fill="rgba(255,255,255,0.10)" />
      <circle cx="220" cy="640" r="210" fill="rgba(255,255,255,0.08)" />
      <text x="60" y="110" fill="rgba(255,255,255,0.82)" font-size="28" font-family="Arial, Helvetica, sans-serif" letter-spacing="6">${safeType.toUpperCase()}</text>
      <text x="60" y="330" fill="#ffffff" font-size="72" font-weight="700" font-family="Arial, Helvetica, sans-serif">${safeTitle}</text>
      <text x="60" y="630" fill="rgba(255,255,255,0.9)" font-size="30" font-family="Arial, Helvetica, sans-serif">EventAura Student Events</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.trim())}`;
}

function getEventImage(event) {
  return event.imageUrl || buildFallbackEventImage(event.eventTitle, event.eventType);
}

function EventsPage() {
  const session = getSession();
  const studentName = session?.user?.fullName || "Student";
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(true);
  const [recommendationError, setRecommendationError] = useState("");
  const [recommendationSource, setRecommendationSource] = useState("popular");
  const [recommendationPrimaryCategory, setRecommendationPrimaryCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeType, setActiveType] = useState("all");
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadPageData() {
      setLoading(true);
      setRecommendationsLoading(true);
      setError("");
      setRecommendationError("");

      const [eventsResult, recommendationsResult] = await Promise.allSettled([
        api.getPublishedEvents(),
        api.getRecommendedEvents(4),
      ]);

      if (!isMounted) {
        return;
      }

      if (eventsResult.status === "fulfilled") {
        setEvents(eventsResult.value.data.events || []);
      } else {
        setError(normalizeRequestError(eventsResult.reason));
      }

      if (recommendationsResult.status === "fulfilled") {
        setRecommendations(recommendationsResult.value.data.events || []);
        setRecommendationSource(recommendationsResult.value.data.source || "popular");
        setRecommendationPrimaryCategory(
          recommendationsResult.value.data.primaryCategory || ""
        );
      } else {
        setRecommendationError(normalizeRequestError(recommendationsResult.reason));
      }

      setLoading(false);
      setRecommendationsLoading(false);
    }

    loadPageData();

    return () => {
      isMounted = false;
    };
  }, []);

  const eventTypes = useMemo(() => {
    const uniqueTypes = Array.from(new Set(events.map((event) => event.eventType).filter(Boolean)));
    return ["all", ...uniqueTypes];
  }, [events]);

  const searchAndTypeFilteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesType = activeType === "all" || event.eventType === activeType;
      const normalizedSearch = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !normalizedSearch ||
        event.eventTitle.toLowerCase().includes(normalizedSearch) ||
        event.organizationName.toLowerCase().includes(normalizedSearch) ||
        event.venue.toLowerCase().includes(normalizedSearch);

      return matchesType && matchesSearch;
    });
  }, [activeType, events, searchTerm]);

  const filteredEvents = useMemo(() => {
    if (!selectedDate) {
      return searchAndTypeFilteredEvents;
    }

    return searchAndTypeFilteredEvents.filter((event) =>
      isSameDay(new Date(event.startDate), selectedDate)
    );
  }, [searchAndTypeFilteredEvents, selectedDate]);

  const featuredEvents = useMemo(
    () => searchAndTypeFilteredEvents.slice(0, 2),
    [searchAndTypeFilteredEvents]
  );

  const thisMonthCount = useMemo(() => {
    return searchAndTypeFilteredEvents.filter((event) => {
      const eventDate = new Date(event.startDate);
      return (
        eventDate.getMonth() === currentMonth.getMonth() &&
        eventDate.getFullYear() === currentMonth.getFullYear()
      );
    }).length;
  }, [currentMonth, searchAndTypeFilteredEvents]);

  const getEventsForDate = (date) =>
    searchAndTypeFilteredEvents.filter((event) =>
      isSameDay(new Date(event.startDate), date)
    );

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const days = [];

    const previousMonthLastDay = new Date(year, month, 0).getDate();
    for (let dayOffset = startingDay - 1; dayOffset >= 0; dayOffset -= 1) {
      days.push({
        date: new Date(year, month - 1, previousMonthLastDay - dayOffset),
        isCurrentMonth: false,
      });
    }

    for (let dayNumber = 1; dayNumber <= daysInMonth; dayNumber += 1) {
      days.push({
        date: new Date(year, month, dayNumber),
        isCurrentMonth: true,
      });
    }

    while (days.length < 42) {
      const nextDay = days.length - (startingDay + daysInMonth) + 1;
      days.push({
        date: new Date(year, month + 1, nextDay),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentMonth]);

  const monthLabel = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const handleDayClick = (date) => {
    setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    setSelectedDate((current) =>
      current && isSameDay(current, date) ? null : date
    );
  };

  async function refreshRecommendations() {
    try {
      setRecommendationsLoading(true);
      setRecommendationError("");
      const response = await api.getRecommendedEvents(4);
      setRecommendations(response.data.events || []);
      setRecommendationSource(response.data.source || "popular");
      setRecommendationPrimaryCategory(response.data.primaryCategory || "");
    } catch (requestError) {
      setRecommendationError(normalizeRequestError(requestError));
    } finally {
      setRecommendationsLoading(false);
    }
  }

  async function recordEventClick(eventId) {
    try {
      await api.trackEventClick(eventId);
      await refreshRecommendations();
    } catch (requestError) {
      setRecommendationError(normalizeRequestError(requestError));
    }
  }

  function handleEventSelection(event) {
    setSelectedEvent(event);
    void recordEventClick(event.id);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F4F6F9" }}>
        <div className="text-center">
          <div
            className="w-14 h-14 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: "#F97316", borderTopColor: "transparent" }}
          />
          <p style={{ color: "#64748B" }}>Loading published events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F4F6F9" }}>
      <section
        className="px-4 py-14"
        style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #F97316 100%)" }}
      >
        <div className="max-w-7xl mx-auto text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-white/70 mb-3">
            Student Events
          </p>
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-end">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Welcome, {studentName}
              </h1>
              <p className="text-lg text-white/80 max-w-3xl">
                Browse approved and published events from organizations across campus.
                Search by title, filter by type, and use the calendar to narrow the list to a specific day.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "Published", value: events.length },
                { label: "This Month", value: thisMonthCount },
                { label: "Filtered", value: filteredEvents.length },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-3xl px-5 py-4 border border-white/15 bg-white/10 backdrop-blur"
                >
                  <p className="text-xs uppercase tracking-[0.25em] text-white/70">
                    {item.label}
                  </p>
                  <p className="text-3xl font-bold mt-2">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error ? (
          <div
            className="mb-6 rounded-3xl border p-4"
            style={{ backgroundColor: "#FEF2F2", borderColor: "#FECACA", color: "#B91C1C" }}
          >
            {error}
          </div>
        ) : null}

        {featuredEvents.length > 0 ? (
          <section className="mb-8 grid gap-4 lg:grid-cols-2">
            {featuredEvents.map((event) => (
              <button
                key={event.id}
                type="button"
                onClick={() => handleEventSelection(event)}
                className="rounded-[28px] border bg-white p-4 text-left shadow-sm hover:shadow-md transition"
                style={{ borderColor: "#E2E8F0" }}
              >
                <div className="mb-5 overflow-hidden rounded-[24px]">
                  <img
                    src={getEventImage(event)}
                    alt={event.eventTitle}
                    className="h-56 w-full object-cover"
                    onError={(currentEvent) => {
                      currentEvent.currentTarget.src = buildFallbackEventImage(
                        event.eventTitle,
                        event.eventType
                      );
                    }}
                  />
                </div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: "#FFF7ED", color: "#C2410C" }}
                  >
                    <FiCalendar size={12} />
                    Featured
                  </span>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: "#F8FAFC", color: "#475569" }}
                  >
                    {event.eventType}
                  </span>
                </div>
                <h2 className="text-2xl font-bold mb-3" style={{ color: "#0F172A" }}>
                  {event.eventTitle}
                </h2>
                <p className="mb-4 line-clamp-2" style={{ color: "#64748B" }}>
                  {event.eventSummary || event.eventDescription}
                </p>
                <div className="grid gap-2 text-sm md:grid-cols-2" style={{ color: "#64748B" }}>
                  <div className="flex items-center gap-2">
                    <FiCalendar size={14} style={{ color: "#F97316" }} />
                    {formatFullDate(event.startDate)}
                  </div>
                  <div className="flex items-center gap-2">
                    <FiMapPin size={14} style={{ color: "#F97316" }} />
                    {event.venue}
                  </div>
                  <div className="flex items-center gap-2">
                    <FiUser size={14} style={{ color: "#F97316" }} />
                    {event.organizationName}
                  </div>
                  <div className="flex items-center gap-2">
                    <FiUsers size={14} style={{ color: "#F97316" }} />
                    {event.expectedAttendees} expected
                  </div>
                </div>
              </button>
            ))}
          </section>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <section>
            <div
              className="bg-white rounded-[28px] border shadow-sm p-5 md:p-6 mb-6"
              style={{ borderColor: "#E2E8F0" }}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-5">
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: "#0F172A" }}>
                    Explore Events
                  </h2>
                  <p style={{ color: "#64748B" }}>
                    Search, filter, and browse published events.
                  </p>
                </div>
                {selectedDate ? (
                  <button
                    type="button"
                    onClick={() => setSelectedDate(null)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium"
                    style={{ backgroundColor: "#FFF7ED", color: "#C2410C" }}
                  >
                    <FiX size={14} />
                    Clear date filter
                  </button>
                ) : null}
              </div>

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
                    placeholder="Search by title, organization, or venue"
                    className="w-full rounded-2xl border py-3 pl-11 pr-4 focus:outline-none focus:ring-2"
                    style={{ borderColor: "#E2E8F0" }}
                  />
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl" style={{ backgroundColor: "#F8FAFC" }}>
                  <FiFilter size={16} style={{ color: "#F97316" }} />
                  <span className="text-sm font-medium" style={{ color: "#475569" }}>
                    {filteredEvents.length} visible
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-5">
                {eventTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setActiveType(type)}
                    className="px-4 py-2 rounded-full text-sm font-medium transition"
                    style={
                      activeType === type
                        ? { backgroundColor: "#F97316", color: "#FFFFFF" }
                        : { backgroundColor: "#F1F5F9", color: "#475569" }
                    }
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-5">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className="bg-white rounded-[28px] border shadow-sm overflow-hidden"
                    style={{ borderColor: "#E2E8F0" }}
                  >
                    <div className="grid lg:grid-cols-[280px_1fr]">
                      <div className="relative min-h-[240px] bg-slate-100">
                        <img
                          src={getEventImage(event)}
                          alt={event.eventTitle}
                          className="h-full w-full object-cover"
                          onError={(currentEvent) => {
                            currentEvent.currentTarget.src = buildFallbackEventImage(
                              event.eventTitle,
                              event.eventType
                            );
                          }}
                        />
                        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                          <span
                            className="px-3 py-1 rounded-full text-xs font-semibold shadow-sm"
                            style={{ backgroundColor: "#FFF7ED", color: "#C2410C" }}
                          >
                            {event.eventType}
                          </span>
                          <span
                            className="px-3 py-1 rounded-full text-xs font-semibold shadow-sm"
                            style={{ backgroundColor: "#ECFDF5", color: "#047857" }}
                          >
                            Published
                          </span>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div>
                            <h3 className="text-2xl font-bold mb-2" style={{ color: "#0F172A" }}>
                              {event.eventTitle}
                            </h3>
                            <p className="line-clamp-3 mb-5" style={{ color: "#64748B" }}>
                              {event.eventSummary || event.eventDescription}
                            </p>
                          </div>

                          <div
                            className="rounded-3xl px-4 py-3 min-w-[180px]"
                            style={{ backgroundColor: "#F8FAFC" }}
                          >
                            <p
                              className="text-xs uppercase tracking-[0.2em] mb-2"
                              style={{ color: "#64748B" }}
                            >
                              Reference
                            </p>
                            <p className="font-semibold break-words" style={{ color: "#0F172A" }}>
                              {event.referenceNumber}
                            </p>
                          </div>
                        </div>

                        <div
                          className="grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-4"
                          style={{ color: "#64748B" }}
                        >
                          <div className="flex items-center gap-2">
                            <FiCalendar size={14} style={{ color: "#F97316" }} />
                            {formatFullDate(event.startDate)}
                          </div>
                          <div className="flex items-center gap-2">
                            <FiClock size={14} style={{ color: "#F97316" }} />
                            {formatTime(event.startDate)} - {formatTime(event.endDate)}
                          </div>
                          <div className="flex items-center gap-2">
                            <FiMapPin size={14} style={{ color: "#F97316" }} />
                            {event.venue}
                          </div>
                          <div className="flex items-center gap-2">
                            <FiUsers size={14} style={{ color: "#F97316" }} />
                            {event.expectedAttendees} attendees
                          </div>
                        </div>

                        <div
                          className="mt-5 border-t pt-5 flex flex-col items-center gap-4 text-center"
                          style={{ borderColor: "#E2E8F0" }}
                        >
                          <span style={{ color: "#475569" }}>
                            Hosted by <strong>{event.organizationName}</strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleEventSelection(event)}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-semibold transition hover:opacity-90"
                            style={{ backgroundColor: "#FFF7ED", color: "#F97316" }}
                          >
                            <FiEye size={17} />
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  className="bg-white rounded-[28px] border shadow-sm p-10 text-center"
                  style={{ borderColor: "#E2E8F0" }}
                >
                  <FiCalendar size={34} className="mx-auto mb-4" style={{ color: "#94A3B8" }} />
                  <h3 className="text-xl font-bold mb-2" style={{ color: "#0F172A" }}>
                    No events match the current filters
                  </h3>
                  <p style={{ color: "#64748B" }}>
                    Try a different search term, change the event type, or clear the selected calendar date.
                  </p>
                </div>
              )}
            </div>
          </section>

          <aside>
            <div
              className="bg-white rounded-[28px] border shadow-sm p-6"
              style={{ borderColor: "#E2E8F0" }}
            >
              <div className="flex items-center justify-between mb-6">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentMonth(
                      (previousMonth) =>
                        new Date(previousMonth.getFullYear(), previousMonth.getMonth() - 1, 1)
                    )
                  }
                  className="p-2 rounded-xl hover:bg-slate-100 transition"
                >
                  <FiChevronLeft size={18} style={{ color: "#475569" }} />
                </button>
                <div className="text-center">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: "#94A3B8" }}>
                    Calendar
                  </p>
                  <h3 className="text-xl font-bold" style={{ color: "#0F172A" }}>
                    {monthLabel}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentMonth(
                      (previousMonth) =>
                        new Date(previousMonth.getFullYear(), previousMonth.getMonth() + 1, 1)
                    )
                  }
                  className="p-2 rounded-xl hover:bg-slate-100 transition"
                >
                  <FiChevronRight size={18} style={{ color: "#475569" }} />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-3">
                {["S", "M", "T", "W", "T", "F", "S"].map((label) => (
                  <div
                    key={label}
                    className="text-center text-xs font-semibold py-2"
                    style={{ color: "#94A3B8" }}
                  >
                    {label}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day) => {
                  const dayEvents = getEventsForDate(day.date);
                  const isSelected = selectedDate ? isSameDay(day.date, selectedDate) : false;
                  const isToday = isSameDay(day.date, new Date());

                  return (
                    <button
                      key={day.date.toISOString()}
                      type="button"
                      onClick={() => handleDayClick(day.date)}
                      className="min-h-[68px] rounded-2xl border px-1 py-2 transition"
                      style={{
                        borderColor: isSelected ? "#F97316" : "#E2E8F0",
                        backgroundColor: isSelected ? "#FFF7ED" : "#FFFFFF",
                        opacity: day.isCurrentMonth ? 1 : 0.38,
                      }}
                    >
                      <div
                        className="text-xs font-semibold mb-2"
                        style={{ color: isToday ? "#F97316" : "#0F172A" }}
                      >
                        {day.date.getDate()}
                      </div>
                      {dayEvents.length > 0 ? (
                        <div className="space-y-1">
                          <div
                            className="w-2 h-2 rounded-full mx-auto"
                            style={{ backgroundColor: "#F97316" }}
                          />
                          <p className="text-[10px] font-medium" style={{ color: "#64748B" }}>
                            {dayEvents.length}
                          </p>
                        </div>
                      ) : null}
                    </button>
                  );
                })}
              </div>

              <div
                className="mt-6 rounded-3xl p-4"
                style={{ backgroundColor: "#F8FAFC" }}
              >
                <h4 className="text-sm font-semibold mb-2" style={{ color: "#0F172A" }}>
                  {selectedDate
                    ? `Events on ${selectedDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}`
                    : "Calendar filter"}
                </h4>

                {selectedDate ? (
                  getEventsForDate(selectedDate).length > 0 ? (
                    <div className="space-y-2">
                      {getEventsForDate(selectedDate).map((event) => (
                        <button
                          key={event.id}
                          type="button"
                          onClick={() => handleEventSelection(event)}
                          className="w-full text-left rounded-2xl bg-white px-3 py-3 border hover:shadow-sm transition"
                          style={{ borderColor: "#E2E8F0" }}
                        >
                          <p className="font-semibold text-sm" style={{ color: "#0F172A" }}>
                            {event.eventTitle}
                          </p>
                          <p className="text-xs mt-1" style={{ color: "#64748B" }}>
                            {formatTime(event.startDate)} at {event.venue}
                          </p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm" style={{ color: "#64748B" }}>
                      No events match the current search/type filters on that day.
                    </p>
                  )
                ) : (
                  <p className="text-sm" style={{ color: "#64748B" }}>
                    Select a date from the calendar to filter the event list to that day.
                  </p>
                )}
              </div>
            </div>

            <div
              className="mt-6 bg-white rounded-[28px] border shadow-sm p-6"
              style={{ borderColor: "#E2E8F0" }}
            >
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FiStar size={16} style={{ color: "#F97316" }} />
                    <p
                      className="text-xs font-semibold uppercase tracking-[0.2em]"
                      style={{ color: "#94A3B8" }}
                    >
                      Recommended
                    </p>
                  </div>
                  <h3 className="text-xl font-bold" style={{ color: "#0F172A" }}>
                    Recommended Events
                  </h3>
                  <p className="text-sm mt-1" style={{ color: "#64748B" }}>
                    {recommendationSource === "personalized"
                      ? recommendationPrimaryCategory
                        ? `Top interest: ${recommendationPrimaryCategory}`
                        : "Based on the events you viewed."
                      : "Popular picks while we learn your interests."}
                  </p>
                </div>
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={
                    recommendationSource === "personalized"
                      ? { backgroundColor: "#FFF7ED", color: "#C2410C" }
                      : { backgroundColor: "#EFF6FF", color: "#1D4ED8" }
                  }
                >
                  {recommendationSource === "personalized" ? "For you" : "Popular"}
                </span>
              </div>

              {recommendationsLoading ? (
                <div className="py-8 text-center">
                  <div
                    className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-3"
                    style={{ borderColor: "#F97316", borderTopColor: "transparent" }}
                  />
                  <p className="text-sm" style={{ color: "#64748B" }}>
                    Loading recommendations...
                  </p>
                </div>
              ) : recommendationError ? (
                <div
                  className="rounded-3xl border p-4 text-sm"
                  style={{
                    backgroundColor: "#FEF2F2",
                    borderColor: "#FECACA",
                    color: "#B91C1C",
                  }}
                >
                  {recommendationError}
                </div>
              ) : recommendations.length > 0 ? (
                <div className="space-y-4">
                  {recommendations.map((event) => (
                    <button
                      key={event.id}
                      type="button"
                      onClick={() => handleEventSelection(event)}
                      className="w-full text-left rounded-[24px] border overflow-hidden hover:shadow-sm transition"
                      style={{ borderColor: "#E2E8F0" }}
                    >
                      <img
                        src={getEventImage(event)}
                        alt={event.eventTitle}
                        className="h-36 w-full object-cover"
                        onError={(currentEvent) => {
                          currentEvent.currentTarget.src = buildFallbackEventImage(
                            event.eventTitle,
                            event.eventType
                          );
                        }}
                      />

                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className="px-3 py-1 rounded-full text-xs font-semibold"
                            style={{ backgroundColor: "#F8FAFC", color: "#475569" }}
                          >
                            {event.eventType}
                          </span>
                          <span
                            className="px-3 py-1 rounded-full text-xs font-semibold"
                            style={
                              event.recommendationGroup?.startsWith("top-category")
                                ? { backgroundColor: "#FFF7ED", color: "#C2410C" }
                                : event.recommendationGroup?.startsWith("other-category")
                                  ? { backgroundColor: "#EFF6FF", color: "#1D4ED8" }
                                  : { backgroundColor: "#F8FAFC", color: "#475569" }
                            }
                          >
                            {event.recommendationReasonLabel || "Popular"}
                          </span>
                          {typeof event.recommendationScore === "number" ? (
                            <span
                              className="px-3 py-1 rounded-full text-xs font-semibold"
                              style={{ backgroundColor: "#ECFDF5", color: "#047857" }}
                            >
                              Match {(Math.min(event.recommendationScore, 1) * 100).toFixed(0)}%
                            </span>
                          ) : null}
                        </div>

                        <h4
                          className="text-base font-bold line-clamp-2 mb-2"
                          style={{ color: "#0F172A" }}
                        >
                          {event.eventTitle}
                        </h4>

                        <div className="space-y-1 text-xs mb-4" style={{ color: "#64748B" }}>
                          <p>{formatFullDate(event.startDate)}</p>
                          <p>{event.venue}</p>
                          {event.recommendationFromHistory ? (
                            <p style={{ color: "#C2410C" }}>
                              Previously clicked by this student
                            </p>
                          ) : null}
                        </div>

                        <div className="flex items-center justify-center">
                          <span
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl font-semibold text-sm"
                            style={{ backgroundColor: "#FFF7ED", color: "#F97316" }}
                          >
                            <FiEye size={15} />
                            View Details
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div
                  className="rounded-3xl p-4 text-sm"
                  style={{ backgroundColor: "#F8FAFC", color: "#64748B" }}
                >
                  Click a few events and this section will personalize suggestions for you.
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

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
                  Published Event
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
              <div className="overflow-hidden rounded-[28px]">
                <img
                  src={getEventImage(selectedEvent)}
                  alt={selectedEvent.eventTitle}
                  className="h-72 w-full object-cover"
                  onError={(currentEvent) => {
                    currentEvent.currentTarget.src = buildFallbackEventImage(
                      selectedEvent.eventTitle,
                      selectedEvent.eventType
                    );
                  }}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: "#FFF7ED", color: "#C2410C" }}
                >
                  {selectedEvent.eventType}
                </span>
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: "#ECFDF5", color: "#047857" }}
                >
                  Visible to Students
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {[
                  {
                    label: "Date",
                    value: formatFullDate(selectedEvent.startDate),
                    icon: FiCalendar,
                  },
                  {
                    label: "Time",
                    value: `${formatTime(selectedEvent.startDate)} - ${formatTime(selectedEvent.endDate)}`,
                    icon: FiClock,
                  },
                  {
                    label: "Venue",
                    value: selectedEvent.venue,
                    icon: FiMapPin,
                  },
                  {
                    label: "Expected Attendees",
                    value: `${selectedEvent.expectedAttendees}`,
                    icon: FiUsers,
                  },
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
                <p style={{ color: "#64748B" }}>
                  {selectedEvent.eventSummary || selectedEvent.eventDescription}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2" style={{ color: "#0F172A" }}>
                  Description
                </h3>
                <p className="leading-7" style={{ color: "#475569" }}>
                  {selectedEvent.eventDescription}
                </p>
              </div>

              <div
                className="rounded-3xl p-5"
                style={{ backgroundColor: "#FFF7ED" }}
              >
                <h3 className="text-lg font-bold mb-2" style={{ color: "#9A3412" }}>
                  Hosted By
                </h3>
                <p style={{ color: "#7C2D12" }}>
                  <strong>{selectedEvent.organizationName}</strong> with event lead{" "}
                  {selectedEvent.organizerName}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default EventsPage;
