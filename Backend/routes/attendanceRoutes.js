const express = require("express");
const router = express.Router();
const {
  authenticate,
  requireAdmin,
  requireStaff,
} = require("../middleware/authMiddleware");

const {
  generateBarcodeForBooking,
  scanAttendance,
  getAttendanceLogs,
} = require("../controllers/attendanceController");

// Vendor (owner) or admin: load QR pass for a booking
router.get("/generate/:bookingId", authenticate, generateBarcodeForBooking);

// Admin only: scan vendor QR — triggers admin-side notifications / logs only
router.post("/scan", authenticate, requireAdmin, scanAttendance);

// Admin + organizer/hod: attendance feed for dashboard & notification bell
router.get("/logs", authenticate, requireStaff, getAttendanceLogs);

module.exports = router;