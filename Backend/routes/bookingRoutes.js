const express = require("express");
const router = express.Router();
const {
  createBooking,
  getAllBookings,
  getMyBookings,
  approveBooking,
  acceptBooking,
  rejectBooking,
  deleteBooking,
  updateBooking,
  confirmBooking
} = require("../controllers/bookingController");

router.post("/", createBooking);
router.get("/", getAllBookings);
router.get("/my", getMyBookings);
router.put("/:id/accept", acceptBooking);
router.put("/:id/approve", approveBooking);
router.put("/:id/reject", rejectBooking);
router.put("/:id/confirm", confirmBooking);
router.put("/:id", updateBooking);
router.delete("/:id", deleteBooking);

module.exports = router;
