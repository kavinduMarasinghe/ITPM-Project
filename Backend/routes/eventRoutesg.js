const express = require("express");
const router = express.Router();
const {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getRiskSummary,
  getPerformanceSummary,
  getEventReport,
  getLiveSummary,
  getDashboardSummary,
} = require("../controllers/eventControllerg");

router.get("/", getEvents);
router.get("/:id/risk-summary", getRiskSummary);
router.get("/:id/performance", getPerformanceSummary);
router.get("/:id/report", getEventReport);
router.get("/:id/live-summary", getLiveSummary);
router.get("/:id/dashboard", getDashboardSummary);
router.post("/", createEvent);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);

module.exports = router;