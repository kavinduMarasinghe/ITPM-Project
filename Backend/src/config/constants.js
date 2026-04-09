const DEFAULT_PORT = 5000;
const DEFAULT_MONGODB_DB_NAME = "eventAuraDB";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;

const ROLES = {
  ADMIN: "admin",
  HOD: "hod",
  ORGANIZER: "organizer",
  STUDENT: "student",
};

const USER_STATUSES = {
  ACTIVE: "active",
  APPROVED: "approved",
  PENDING: "pending",
  REJECTED: "rejected",
};

const EVENT_STATUSES = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  PUBLISHED: "published",
  CANCELLED: "cancelled",
};

module.exports = {
  DEFAULT_MONGODB_DB_NAME,
  DEFAULT_PORT,
  EVENT_STATUSES,
  ROLES,
  SESSION_TTL_MS,
  USER_STATUSES,
};
