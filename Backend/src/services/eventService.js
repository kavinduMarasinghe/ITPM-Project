const { randomUUID } = require("crypto");

const { EVENT_STATUSES, ROLES } = require("../config/constants");
const eventInteractionModel = require("../models/EventInteractionModel");
const eventModel = require("../models/EventModel");
const eventRecommendationService = require("./eventRecommendationService");
const { AppError } = require("../utils/errors");

const EVENT_TYPES = [
  "Conference",
  "Cultural Program",
  "Exhibition",
  "Concert",
  "Workshop",
  "Seminar",
  "Sports",
  "General",
];

const REG_NO_REGEX = /^\d{4}[A-Z]{2}\d{3}$/i;
const PHONE_REGEX = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;

const EVENT_IMAGE_BACKGROUNDS = {
  Conference: ["#0F172A", "#F97316"],
  "Cultural Program": ["#7C3AED", "#EC4899"],
  Exhibition: ["#0EA5E9", "#22C55E"],
  Concert: ["#111827", "#EF4444"],
  Workshop: ["#1D4ED8", "#38BDF8"],
  Seminar: ["#475569", "#F59E0B"],
  Sports: ["#14532D", "#22C55E"],
  General: ["#334155", "#F97316"],
};

function buildReferenceNumber() {
  return `EVT-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function normalizeEventType(eventType) {
  const normalizedValue = String(eventType || "").trim();

  if (!normalizedValue) {
    return "General";
  }

  const matchingType = EVENT_TYPES.find(
    (type) => type.toLowerCase() === normalizedValue.toLowerCase()
  );

  return matchingType || normalizedValue;
}

function escapeSvgText(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapSvgText(value, lineLength = 26, maxLines = 2) {
  const words = String(value || "").trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return [""];
  }

  const lines = [];
  let currentLine = "";

  words.forEach((word) => {
    const candidate = currentLine ? `${currentLine} ${word}` : word;

    if (candidate.length <= lineLength) {
      currentLine = candidate;
      return;
    }

    if (currentLine) {
      lines.push(currentLine);
      currentLine = word;
      return;
    }

    lines.push(word.slice(0, lineLength));
    currentLine = word.slice(lineLength);
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.slice(0, maxLines);
}

function buildDefaultEventImage(eventType, eventTitle) {
  const normalizedType = normalizeEventType(eventType);
  const [startColor, endColor] =
    EVENT_IMAGE_BACKGROUNDS[normalizedType] || EVENT_IMAGE_BACKGROUNDS.General;
  const titleLines = wrapSvgText(eventTitle || "Campus Event");
  const titleMarkup = titleLines
    .map(
      (line, index) =>
        `<tspan x="44" dy="${index === 0 ? 0 : 34}">${escapeSvgText(line)}</tspan>`
    )
    .join("");

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720" role="img" aria-label="${escapeSvgText(
      eventTitle || "Campus Event"
    )}">
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${startColor}" />
          <stop offset="100%" stop-color="${endColor}" />
        </linearGradient>
      </defs>
      <rect width="1200" height="720" rx="36" fill="url(#gradient)" />
      <circle cx="1030" cy="110" r="170" fill="rgba(255,255,255,0.10)" />
      <circle cx="210" cy="650" r="220" fill="rgba(255,255,255,0.08)" />
      <rect x="44" y="44" width="222" height="54" rx="27" fill="rgba(255,255,255,0.16)" />
      <text x="155" y="78" fill="#ffffff" font-size="26" font-family="Arial, Helvetica, sans-serif" text-anchor="middle" letter-spacing="4">${escapeSvgText(
        normalizedType.toUpperCase()
      )}</text>
      <text x="44" y="330" fill="#ffffff" font-size="68" font-weight="700" font-family="Arial, Helvetica, sans-serif">${titleMarkup}</text>
      <text x="44" y="620" fill="rgba(255,255,255,0.88)" font-size="28" font-family="Arial, Helvetica, sans-serif">EventAura Student Events</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.trim())}`;
}

function normalizeImageUrl(imageUrl, eventType, eventTitle) {
  const normalizedUrl = String(imageUrl || "").trim();

  if (!normalizedUrl) {
    return buildDefaultEventImage(eventType, eventTitle);
  }

  if (/^https?:\/\//i.test(normalizedUrl) || /^data:image\//i.test(normalizedUrl)) {
    return normalizedUrl;
  }

  throw new AppError(400, "Event image must be a valid image URL.");
}

function buildIsoDate(date, time) {
  const safeDate = String(date || "").trim();
  const safeTime = String(time || "").trim();

  if (!safeDate || !safeTime) {
    return null;
  }

  const normalizedTime = safeTime.length === 5 ? `${safeTime}:00` : safeTime;
  const composedDate = new Date(`${safeDate}T${normalizedTime}`);

  if (Number.isNaN(composedDate.getTime())) {
    return null;
  }

  return composedDate.toISOString();
}

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizeOptionalCount(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const normalizedValue = Number(value);
  return Number.isFinite(normalizedValue) ? normalizedValue : null;
}

function normalizeStudentRoster(items, label) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError(400, `${label} must include at least one student.`);
  }

  return items.map((item, index) => {
    const name = normalizeText(item?.name);
    const regNo = normalizeText(item?.regNo).toUpperCase();
    const year = normalizeText(item?.year);
    const designation = normalizeText(item?.designation);
    const contact = normalizeText(item?.contact);
    const signature = item?.signature || null;

    if (!name) {
      throw new AppError(400, `${label} member ${index + 1} must include a full name.`);
    }

    if (!REG_NO_REGEX.test(regNo)) {
      throw new AppError(
        400,
        `${label} member ${index + 1} must include a valid registration number.`
      );
    }

    if (!PHONE_REGEX.test(contact)) {
      throw new AppError(
        400,
        `${label} member ${index + 1} must include a valid contact number.`
      );
    }

    if (!signature) {
      throw new AppError(400, `${label} member ${index + 1} must include a signature.`);
    }

    return {
      name,
      regNo,
      year,
      designation,
      contact,
      signature,
    };
  });
}

function normalizeStaffRoster(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError(400, "Staff members section must include at least one person.");
  }

  let advisorCount = 0;

  const normalizedStaff = items.map((item, index) => {
    const name = normalizeText(item?.name);
    const designation = normalizeText(item?.designation);
    const contact = normalizeText(item?.contact);
    const signature = item?.signature || null;
    const isAdvisor = Boolean(item?.isAdvisor);

    if (!name) {
      throw new AppError(400, `Staff member ${index + 1} must include a full name.`);
    }

    if (!designation) {
      throw new AppError(400, `Staff member ${index + 1} must include a designation.`);
    }

    if (contact && !PHONE_REGEX.test(contact)) {
      throw new AppError(400, `Staff member ${index + 1} must include a valid contact number.`);
    }

    if (!signature) {
      throw new AppError(400, `Staff member ${index + 1} must include a signature.`);
    }

    if (isAdvisor) {
      advisorCount += 1;
    }

    return {
      name,
      designation,
      contact,
      signature,
      isAdvisor,
    };
  });

  if (advisorCount !== 1) {
    throw new AppError(400, "Exactly one staff member must be marked as the Staff Advisor.");
  }

  return normalizedStaff;
}

function sanitizeEventForClient(event) {
  return {
    id: event.id,
    referenceNumber: event.referenceNumber,
    organizerId: event.organizerId,
    organizerName: event.organizerName,
    organizerEmail: event.organizerEmail || "",
    organizerPhone: event.organizerPhone || "",
    organizationName: event.organizationName || "",
    eventTitle: event.eventTitle,
    eventType: event.eventType,
    societyName: event.societyName || "",
    eventSummary: event.eventSummary || "",
    eventDescription: event.eventDescription || "",
    imageUrl: event.imageUrl || buildDefaultEventImage(event.eventType, event.eventTitle),
    eventDate: event.eventDate,
    eventTime: event.eventTime,
    eventEndTime: event.eventEndTime,
    startDate: event.startDate,
    endDate: event.endDate,
    venue: event.venue,
    venueLocation: event.venueLocation || event.venue,
    venueType: event.venueType || "",
    expectedAttendees: Number(event.expectedAttendees || 0),
    budget: event.budget || "",
    status: event.status,
    submittedDate: event.submittedDate,
    reviewedAt: event.reviewedAt || null,
    reviewedBy: event.reviewedBy || null,
    reviewNotes: event.reviewNotes || "",
    publishedAt: event.publishedAt || null,
    cancelledAt: event.cancelledAt || null,
    canPublish: event.status === EVENT_STATUSES.APPROVED,
    canCancel: event.status === EVENT_STATUSES.APPROVED,
    canDelete: event.status === EVENT_STATUSES.PUBLISHED,
    statusHistory: Array.isArray(event.statusHistory) ? event.statusHistory : [],
    requestDetails: event.requestDetails || {},
  };
}

function validateEventPayload(payload) {
  const eventTitle = normalizeText(payload.eventTitle);
  const eventType = normalizeEventType(payload.eventType);
  const societyName = normalizeText(payload.societyName);
  const societyCategory = normalizeText(payload.societyCategory);
  const eventSummary = normalizeText(payload.eventSummary);
  const eventDescription = normalizeText(payload.eventDescription);
  const imageUrl = normalizeImageUrl(payload.imageUrl, eventType, eventTitle);
  const eventDate = normalizeText(payload.eventDate);
  const eventTime = normalizeText(payload.eventTime);
  const eventEndTime = normalizeText(payload.eventEndTime);
  const duration = normalizeText(payload.duration);
  const setupTime = normalizeText(payload.setupTime);
  const clearTime = normalizeText(payload.clearTime);
  const venue = normalizeText(payload.venue);
  const venueType = normalizeText(payload.venueType);
  const internalAudience = normalizeOptionalCount(payload.internalAudience);
  const externalAudience = normalizeOptionalCount(payload.externalAudience);
  const internalGuests = normalizeText(payload.internalGuests);
  const externalGuests = normalizeText(payload.externalGuests);
  const additionalParking = Boolean(payload.additionalParking);
  const parkingDetails = normalizeText(payload.parkingDetails);
  const fundraisingDetails = normalizeText(payload.fundraisingDetails);
  const budget = normalizeText(payload.budgetDetails || payload.budget);
  const sisFundsRequired = Boolean(payload.sisFundsRequired);
  const seniorTreasurerApproval = Boolean(payload.seniorTreasurerApproval);
  const seniorTreasurerName = normalizeText(payload.seniorTreasurerName);
  const seniorTreasurerDate = normalizeText(payload.seniorTreasurerDate);
  const assistanceExpected = normalizeText(payload.assistanceExpected);
  const virtualPlatforms = normalizeText(payload.virtualPlatforms);
  const externalEquipment = normalizeText(payload.externalEquipment);
  const organizingStudents = normalizeStudentRoster(
    payload.organizingStudents,
    "Organizing students"
  );
  const cleaningInCharge = normalizeStudentRoster(
    payload.cleaningInCharge,
    "Cleaning in charge"
  );
  const staffMembers = normalizeStaffRoster(payload.staffMembers);
  const studentServicesApproval = Boolean(payload.studentServicesApproval);
  const ircApproval = Boolean(payload.ircApproval);
  const proVcApproval = Boolean(payload.proVcApproval);
  const termsAccepted = Boolean(payload.termsAccepted);
  const regulationsAccepted = Boolean(payload.regulationsAccepted);
  const damageResponsibility = Boolean(payload.damageResponsibility);
  const cleaningResponsibility = Boolean(payload.cleaningResponsibility);
  const financialTransparency = Boolean(payload.financialTransparency);
  const expectedAttendees = Number(payload.expectedParticipants || payload.expectedAttendees || 0);
  const startDate = buildIsoDate(eventDate, eventTime);
  const endDate = buildIsoDate(eventDate, eventEndTime);

  if (eventTitle.length < 5) {
    throw new AppError(400, "Event title must be at least 5 characters.");
  }

  if (!societyName || societyName.length < 2) {
    throw new AppError(400, "Organization or society name is required.");
  }

  if (!societyCategory) {
    throw new AppError(400, "Society category is required.");
  }

  if (!eventSummary || eventSummary.length < 20) {
    throw new AppError(400, "Event summary must be at least 20 characters.");
  }

  if (!eventDescription || eventDescription.length < 50) {
    throw new AppError(400, "Event description must be at least 50 characters.");
  }

  if (!eventDate || !startDate || !endDate) {
    throw new AppError(400, "Valid event date and time range are required.");
  }

  const selectedDate = new Date(`${eventDate}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const minimumDate = new Date(today);
  minimumDate.setDate(minimumDate.getDate() + 14);

  if (selectedDate < minimumDate) {
    throw new AppError(400, "Event must be scheduled at least 2 weeks in advance.");
  }

  if (new Date(endDate) <= new Date(startDate)) {
    throw new AppError(400, "Event end time must be after the start time.");
  }

  if (setupTime && eventTime && setupTime >= eventTime) {
    throw new AppError(400, "Setup time must be before the event start time.");
  }

  if (clearTime && eventEndTime && clearTime <= eventEndTime) {
    throw new AppError(400, "Clear time must be after the event end time.");
  }

  if (!venue) {
    throw new AppError(400, "Venue is required.");
  }

  if (!Number.isFinite(expectedAttendees) || expectedAttendees <= 0) {
    throw new AppError(400, "Expected attendees must be greater than 0.");
  }

  if (
    (internalAudience !== null || externalAudience !== null) &&
    Number(internalAudience || 0) + Number(externalAudience || 0) !== expectedAttendees
  ) {
    throw new AppError(
      400,
      "Expected participants must match the combined internal and external audience."
    );
  }

  if (!fundraisingDetails) {
    throw new AppError(400, "Fundraising details are required.");
  }

  if (!assistanceExpected) {
    throw new AppError(400, "Assistance expected from SLIIT is required.");
  }

  if (additionalParking && !parkingDetails) {
    throw new AppError(400, "Parking details are required when additional parking is requested.");
  }

  if (
    !termsAccepted ||
    !regulationsAccepted ||
    !damageResponsibility ||
    !cleaningResponsibility ||
    !financialTransparency
  ) {
    throw new AppError(400, "All event compliance acknowledgements must be accepted.");
  }

  const requestDetails = {
    eventTitle,
    eventType,
    imageUrl,
    societyName,
    societyCategory,
    eventSummary,
    eventDescription,
    organizingStudents,
    cleaningInCharge,
    internalAudience,
    externalAudience,
    expectedParticipants: expectedAttendees,
    internalGuests,
    externalGuests,
    additionalParking,
    parkingDetails,
    fundraisingDetails,
    budgetDetails: budget,
    sisFundsRequired,
    seniorTreasurerApproval,
    seniorTreasurerName,
    seniorTreasurerDate,
    assistanceExpected,
    virtualPlatforms,
    externalEquipment,
    staffMembers,
    eventDate,
    eventTime,
    eventEndTime,
    duration,
    setupTime,
    clearTime,
    venue,
    venueType,
    studentServicesApproval,
    ircApproval,
    proVcApproval,
    termsAccepted,
    regulationsAccepted,
    damageResponsibility,
    cleaningResponsibility,
    financialTransparency,
  };

  return {
    eventTitle,
    eventType,
    societyName,
    eventSummary,
    eventDescription,
    imageUrl,
    eventDate,
    eventTime,
    eventEndTime,
    startDate,
    endDate,
    venue,
    venueLocation: venue,
    venueType,
    expectedAttendees,
    budget,
    requestDetails,
  };
}

class EventService {
  async createEventRequest(payload, organizer) {
    if (!organizer || !organizer.id) {
      throw new AppError(401, "Organizer authentication is required.");
    }

    const now = new Date().toISOString();
    const eventDetails = validateEventPayload(payload);
    const event = {
      id: randomUUID(),
      referenceNumber: buildReferenceNumber(),
      organizerId: organizer.id,
      organizerName: organizer.fullName,
      organizerEmail: organizer.email || "",
      organizerPhone: organizer.phone || "",
      organizationName: organizer.organizationName || eventDetails.societyName,
      ...eventDetails,
      status: EVENT_STATUSES.PENDING,
      submittedDate: now,
      statusHistory: [
        {
          status: EVENT_STATUSES.PENDING,
          date: now,
          by: organizer.fullName,
          notes: "Event request submitted for admin review.",
        },
      ],
    };

    const createdEvent = await eventModel.createEvent(event);
    return sanitizeEventForClient(createdEvent);
  }

  async getOrganizerEvents(organizer) {
    const events = await eventModel.findByOrganizerId(organizer.id);
    return events.map(sanitizeEventForClient);
  }

  async getAdminEvents() {
    const events = await eventModel.getAllEvents();
    return events.map(sanitizeEventForClient);
  }

  async getEventStatsForAdmin() {
    const events = await this.getAdminEvents();

    return {
      total: events.length,
      pending: events.filter((event) => event.status === EVENT_STATUSES.PENDING).length,
      approved: events.filter((event) => event.status === EVENT_STATUSES.APPROVED).length,
      published: events.filter((event) => event.status === EVENT_STATUSES.PUBLISHED).length,
      rejected: events.filter((event) => event.status === EVENT_STATUSES.REJECTED).length,
      cancelled: events.filter((event) => event.status === EVENT_STATUSES.CANCELLED).length,
    };
  }

  async reviewEvent(id, payload, reviewer) {
    const nextStatus = String(payload.status || "").trim().toLowerCase();
    const notes = String(payload.notes || "").trim();

    if (![EVENT_STATUSES.APPROVED, EVENT_STATUSES.REJECTED].includes(nextStatus)) {
      throw new AppError(400, "Review status must be approved or rejected.");
    }

    const updatedEvent = await eventModel.updateEvent(id, (event) => {
      if (!event) {
        return null;
      }

      if (event.status !== EVENT_STATUSES.PENDING) {
        throw new AppError(400, "Only pending event requests can be reviewed.");
      }

      const reviewedAt = new Date().toISOString();
      return {
        ...event,
        status: nextStatus,
        reviewedAt,
        reviewedBy: reviewer.fullName,
        reviewNotes: notes,
        statusHistory: [
          ...(Array.isArray(event.statusHistory) ? event.statusHistory : []),
          {
            status: nextStatus,
            date: reviewedAt,
            by: reviewer.fullName,
            notes:
              notes ||
              (nextStatus === EVENT_STATUSES.APPROVED
                ? "Event request approved."
                : "Event request rejected."),
          },
        ],
      };
    });

    if (!updatedEvent) {
      throw new AppError(404, "Event request not found.");
    }

    return sanitizeEventForClient(updatedEvent);
  }

  async publishEvent(id, organizer) {
    const updatedEvent = await eventModel.updateEvent(id, (event) => {
      if (!event) {
        return null;
      }

      if (event.organizerId !== organizer.id) {
        throw new AppError(403, "You can only publish your own approved event requests.");
      }

      if (event.status !== EVENT_STATUSES.APPROVED) {
        throw new AppError(400, "Only approved event requests can be published.");
      }

      const publishedAt = new Date().toISOString();

      return {
        ...event,
        status: EVENT_STATUSES.PUBLISHED,
        publishedAt,
        statusHistory: [
          ...(Array.isArray(event.statusHistory) ? event.statusHistory : []),
          {
            status: EVENT_STATUSES.PUBLISHED,
            date: publishedAt,
            by: organizer.fullName,
            notes: "Published to the student events page.",
          },
        ],
      };
    });

    if (!updatedEvent) {
      throw new AppError(404, "Event request not found.");
    }

    return sanitizeEventForClient(updatedEvent);
  }

  async cancelEvent(id, organizer) {
    const updatedEvent = await eventModel.updateEvent(id, (event) => {
      if (!event) {
        return null;
      }

      if (event.organizerId !== organizer.id) {
        throw new AppError(403, "You can only cancel your own event requests.");
      }

      if (event.status !== EVENT_STATUSES.APPROVED) {
        throw new AppError(
          400,
          "Only approved events can be cancelled before publishing."
        );
      }

      const cancelledAt = new Date().toISOString();
      return {
        ...event,
        status: EVENT_STATUSES.CANCELLED,
        cancelledAt,
        statusHistory: [
          ...(Array.isArray(event.statusHistory) ? event.statusHistory : []),
          {
            status: EVENT_STATUSES.CANCELLED,
            date: cancelledAt,
            by: organizer.fullName,
            notes: "Event request cancelled by the organizer.",
          },
        ],
      };
    });

    if (!updatedEvent) {
      throw new AppError(404, "Event request not found.");
    }

    return sanitizeEventForClient(updatedEvent);
  }

  async deletePublishedEvent(id, organizer) {
    const event = await eventModel.findById(id);

    if (!event) {
      throw new AppError(404, "Event request not found.");
    }

    if (event.organizerId !== organizer.id) {
      throw new AppError(403, "You can only delete your own published events.");
    }

    if (event.status !== EVENT_STATUSES.PUBLISHED) {
      throw new AppError(400, "Only published events can be deleted.");
    }

    const deletedEvent = await eventModel.deleteEvent(id);

    if (!deletedEvent) {
      throw new AppError(404, "Event request not found.");
    }

    await eventInteractionModel.removeByEventId(id);

    return sanitizeEventForClient(deletedEvent);
  }

  async getPublishedEvents() {
    const events = await eventModel.findByStatus(EVENT_STATUSES.PUBLISHED);

    return events
      .map(sanitizeEventForClient)
      .sort((left, right) => new Date(left.startDate) - new Date(right.startDate));
  }

  async trackStudentEventClick(id, student) {
    if (!student || student.role !== ROLES.STUDENT) {
      throw new AppError(403, "Only students can record event clicks.");
    }

    const event = await eventModel.findById(id);

    if (!event || event.status !== EVENT_STATUSES.PUBLISHED) {
      throw new AppError(404, "Published event not found.");
    }

    return eventInteractionModel.recordClick(student.id, id);
  }

  async getRecommendedEventsForStudent(student, limit = 4) {
    if (!student || student.role !== ROLES.STUDENT) {
      throw new AppError(403, "Only students can access recommendations.");
    }

    const publishedEvents = await this.getPublishedEvents();
    const interactions = await eventInteractionModel.findByUserId(student.id);
    const popularStats = await eventInteractionModel.getPopularEventStats(100);

    return eventRecommendationService.recommendEvents({
      events: publishedEvents,
      interactions,
      popularStats,
      limit,
    });
  }
}

module.exports = new EventService();
