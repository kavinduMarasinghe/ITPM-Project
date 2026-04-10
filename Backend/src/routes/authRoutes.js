const { ROLES } = require("../config/constants");
const authController = require("../controllers/authController");
const healthController = require("../controllers/healthController");

module.exports = [
  {
    method: "GET",
    path: "/api/health",
    handler: healthController.getHealth,
  },
  {
    method: "POST",
    path: "/api/auth/login",
    handler: authController.login,
  },
  {
    method: "GET",
    path: "/api/auth/me",
    roles: [ROLES.ADMIN, ROLES.HOD, ROLES.ORGANIZER, ROLES.STUDENT],
    handler: authController.me,
  },
  {
    method: "POST",
    path: "/api/auth/logout",
    roles: [ROLES.ADMIN, ROLES.HOD, ROLES.ORGANIZER, ROLES.STUDENT],
    handler: authController.logout,
  },
];
