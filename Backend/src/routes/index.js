const authRoutes = require("./authRoutes");
const eventRoutes = require("./eventRoutes");
const organizerRoutes = require("./organizerRoutes");
const studentRoutes = require("./studentRoutes");

module.exports = [...authRoutes, ...studentRoutes, ...organizerRoutes, ...eventRoutes];
