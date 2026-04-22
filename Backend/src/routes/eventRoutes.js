const { ROLES } = require("../config/constants");
const eventController = require("../controllers/eventController");

module.exports = [
  {
    method: "POST",
    path: "/api/events",
    roles: [ROLES.ORGANIZER],
    handler: eventController.createEventRequest,
  },
  {
    method: "GET",
    path: "/api/events/my-events",
    roles: [ROLES.ORGANIZER],
    handler: eventController.getOrganizerEvents,
  },
  {
    method: "GET",
    path: "/api/events/admin",
    roles: [ROLES.ADMIN],
    handler: eventController.getAdminEvents,
  },
  {
    method: "GET",
    path: "/api/events/admin/stats",
    roles: [ROLES.ADMIN],
    handler: eventController.getAdminEventStats,
  },
  
  {
    method: "PUT",
    path: "/api/events/:id/cancel",
    roles: [ROLES.ORGANIZER],
    handler: eventController.cancelEvent,
  },
  {
    method: "DELETE",
    path: "/api/events/:id",
    roles: [ROLES.ORGANIZER],
    handler: eventController.deletePublishedEvent,
  },
  {
    method: "GET",
    path: "/api/events/published",
    roles: [ROLES.STUDENT],
    handler: eventController.getPublishedEvents,
  },
  {
    method: "GET",
    path: "/api/events/recommended",
    roles: [ROLES.STUDENT],
    handler: eventController.getRecommendedEvents,
  },
  {
    method: "POST",
    path: "/api/events/:id/click",
    roles: [ROLES.STUDENT],
    handler: eventController.trackEventClick,
  },
];
