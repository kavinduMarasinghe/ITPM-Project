const crypto = require("crypto");
const StallBooking = require("../models/stallBookingModel");
const Stall = require("../models/stallModel");

const ADVANCE_MIN = 5000;
const ADVANCE_MAX = 10000;

// Vendor creates a booking request (FCFS Atomic Action)
const createBooking = async (req, res) => {
  try {
    // Check vendor stall limitation (Max 3 stalls rule)
    const vendorBookingsCount = await StallBooking.countDocuments({ 
      vendorName: req.body.vendorName,
      status: { $in: ["Pending", "PreApproved", "Confirmed", "Approved"] }
    });

    if (vendorBookingsCount >= 3) {
      return res.status(400).json({ success: false, message: "Booking Limit Exceeded: One vendor can only book a maximum of 3 stalls." });
    }

    // Atomic update prevents race conditions
    // We set reservedUntil 7 days in the future to keep it reserved until Admin accepts
    const farFuture = new Date(Date.now() + 7 * 24 * 60 * 60000);
    const stall = await Stall.findOneAndUpdate(
      { _id: req.body.stallId, status: "Available" },
      { $set: { status: "Reserved", reservedUntil: farFuture } },
      { returnDocument: 'after' }
    );

    if (!stall) {
      return res.status(400).json({ success: false, message: "Stall is not available for booking. It may have just been reserved by someone else!" });
    }

    const booking = new StallBooking({
      ...req.body,
      stallName: stall.stallName,
      stallNumber: stall.stallNumber,
      eventName: stall.eventName,
    });
    await booking.save();

    res.status(201).json({ success: true, message: "Stall Reserved! You have 15 minutes to confirm booking/payment.", data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating booking", error: error.message });
  }
};

// Admin: get all bookings
const getAllBookings = async (req, res) => {
  try {
    const bookings = await StallBooking.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching bookings", error: error.message });
  }
};

// Vendor: get my bookings by vendor name
const getMyBookings = async (req, res) => {
  try {
    const { vendor } = req.query;
    const bookings = await StallBooking.find({ vendorName: vendor }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching bookings", error: error.message });
  }
};

// Admin: approve booking (Locks the stall) — legacy step if booking stayed "Confirmed" after older flows
const approveBooking = async (req, res) => {
  try {
    const booking = await StallBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    if (booking.status === "Approved" && booking.advancePaid) {
      return res.status(200).json({ success: true, message: "Booking is already locked.", data: booking });
    }

    if (booking.status !== "Confirmed") {
      return res.status(400).json({
        success: false,
        message: "Admin lock applies only to advance-paid bookings still awaiting final lock (legacy status).",
      });
    }

    booking.status = "Approved";
    await booking.save();

    await Stall.findByIdAndUpdate(booking.stallId, { status: "Booked", reservedUntil: null });

    res.status(200).json({ success: true, message: "Booking locked and approved successfully.", data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error approving booking", error: error.message });
  }
};

// Admin: reject booking
const rejectBooking = async (req, res) => {
  try {
    const booking = await StallBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    booking.status = "Rejected";
    await booking.save();

    // Revert stall status to Available
    await Stall.findByIdAndUpdate(booking.stallId, { status: "Available" });

    res.status(200).json({ success: true, message: "Booking rejected", data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error rejecting booking", error: error.message });
  }
};

// Delete booking
const deleteBooking = async (req, res) => {
  try {
    const booking = await StallBooking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    res.status(200).json({ success: true, message: "Booking deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting booking", error: error.message });
  }
};

// Update booking
const updateBooking = async (req, res) => {
  try {
    const booking = await StallBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    if (booking.status !== "Pending") return res.status(400).json({ success: false, message: "Only pending requests can be updated" });

    const { contactNumber, businessName, itemsToSell, notes } = req.body;
    if (contactNumber) booking.contactNumber = contactNumber;
    if (businessName) booking.businessName = businessName;
    if (itemsToSell) booking.itemsToSell = itemsToSell;
    if (notes !== undefined) booking.notes = notes;

    await booking.save();
    res.status(200).json({ success: true, message: "Booking updated", data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating booking", error: error.message });
  }
};

// Vendor: confirm advance payment — locks stall, issues unique QR token (max LKR 10,000)
const confirmBooking = async (req, res) => {
  try {
    const booking = await StallBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    if (booking.status !== "PreApproved") {
      return res.status(400).json({ success: false, message: "Request must be accepted by admin before payment is allowed." });
    }

    const raw = req.body?.advanceAmount ?? req.body?.amount;
    const advanceAmount = Number(raw);
    if (!Number.isFinite(advanceAmount) || advanceAmount < ADVANCE_MIN || advanceAmount > ADVANCE_MAX) {
      return res.status(400).json({
        success: false,
        message: `Advance must be between LKR ${ADVANCE_MIN.toLocaleString()} and LKR ${ADVANCE_MAX.toLocaleString()} to lock the stall.`,
      });
    }

    booking.advancePaid = true;
    booking.advanceAmountPaid = advanceAmount;
    booking.status = "Approved";
    if (!booking.barcodeToken) {
      booking.barcodeToken = crypto.randomBytes(16).toString("hex");
      booking.barcodeGeneratedAt = new Date();
    }

    await booking.save();
    await Stall.findByIdAndUpdate(booking.stallId, { status: "Booked", reservedUntil: null });

    const fresh = await StallBooking.findById(booking._id);
    res.status(200).json({
      success: true,
      message: "Advance verified. Stall locked. Your unique check-in QR is ready.",
      data: fresh,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error confirming payment", error: error.message });
  }
};

// Admin: Accept booking (Starts the 15-minute Vendor countdown)
const acceptBooking = async (req, res) => {
  try {
    const booking = await StallBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    booking.status = "PreApproved";
    const days = Number(process.env.PAYMENT_DEADLINE_DAYS ?? 5);
    const safeDays = Number.isFinite(days) && days > 0 ? days : 5;
    booking.paymentDeadline = new Date(Date.now() + safeDays * 24 * 60 * 60000);
    await booking.save();

    res.status(200).json({ success: true, message: `Booking accepted. Vendor now has ${safeDays} days to pay advance.`, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error accepting booking", error: error.message });
  }
};

module.exports = { createBooking, getAllBookings, getMyBookings, acceptBooking, approveBooking, rejectBooking, deleteBooking, updateBooking, confirmBooking };
