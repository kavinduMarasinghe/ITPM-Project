const { ROLES } = require("../config/constants");
const organizerController = require("../controllers/organizerController");

module.exports = [
  {
    method: "POST",
    path: "/api/organizers/register",
    handler: organizerController.registerOrganizer,
  },
  {
    method: "GET",
    path: "/api/organizers/stats",
    roles: [ROLES.ADMIN, ROLES.HOD],
    handler: organizerController.getOrganizerStats,
  },
  {
    method: "GET",
    path: "/api/organizers",
    roles: [ROLES.ADMIN, ROLES.HOD],
    handler: organizerController.getOrganizers,
  },
  {
    method: "GET",
    path: "/api/organizers/:id",
    roles: [ROLES.ADMIN, ROLES.HOD],
    handler: organizerController.getOrganizerById,
  },
  {
    method: "PUT",
    path: "/api/organizers/:id/status",
    roles: [ROLES.ADMIN, ROLES.HOD],
    handler: organizerController.updateOrganizerStatus,
  },
];
