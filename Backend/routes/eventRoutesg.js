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

const { protect } = require("../middleware/authMiddlewareg");

router.get("/", protect, getEvents);
router.get("/:id/risk-summary", protect, getRiskSummary);
router.get("/:id/performance", protect, getPerformanceSummary);
router.get("/:id/report", protect, getEventReport);
router.get("/:id/live-summary", protect, getLiveSummary);
router.get("/:id/dashboard", protect, getDashboardSummary);
router.post("/", protect, createEvent);
router.put("/:id", protect, updateEvent);
router.delete("/:id", protect, deleteEvent);

module.exports = router;