const express = require("express");
const router = express.Router();

const {
  generateBarcodeForBooking,
  scanAttendance,
  getAttendanceLogs,
} = require("../controllers/attendanceController");

// Generate QR / barcode token for a booking
router.get("/generate/:bookingId", generateBarcodeForBooking);

// Scan QR and confirm attendance
router.post("/scan", scanAttendance);

// Admin attendance logs
router.get("/logs", getAttendanceLogs);

module.exports = router;