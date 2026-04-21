const crypto = require("crypto");
const StallBooking = require("../models/stallBookingModel");

// Helper: check whether today is the event day
const isEventDay = (eventDate) => {
  if (!eventDate) return false;

  const today = new Date();
  const event = new Date(eventDate);

  return (
    today.getFullYear() === event.getFullYear() &&
    today.getMonth() === event.getMonth() &&
    today.getDate() === event.getDate()
  );
};

// 1. Generate QR token only for confirmed booking on event day
exports.generateBarcodeForBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await StallBooking.findById(bookingId).populate("stallId");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (!booking.advancePaid) {
      return res.status(400).json({
        message: "Advance payment must be completed before generating QR code",
      });
    }

    if (!["Confirmed", "Approved"].includes(booking.status)) {
      return res.status(400).json({
        message: "QR can only be generated for approved bookings",
      });
    }

    if (!isEventDay(booking.eventDate)) {
      return res.status(400).json({
        message: "QR code can only be generated on the event day",
      });
    }

    if (!booking.barcodeToken) {
      booking.barcodeToken = crypto.randomBytes(16).toString("hex");
      booking.barcodeGeneratedAt = new Date();
      await booking.save();
    }

    return res.status(200).json({
      message: "QR token generated successfully",
      bookingId: booking._id,
      barcodeToken: booking.barcodeToken,
      vendorName: booking.vendorName,
      stallName: booking.stallName,
      stallNumber: booking.stallNumber,
      eventName: booking.eventName,
      eventDate: booking.eventDate,
    });
  } catch (error) {
    console.error("Generate QR error:", error);
    return res.status(500).json({ message: "Server error while generating QR token" });
  }
};

// 2. Scan QR and mark attendance
exports.scanAttendance = async (req, res) => {
  try {
    const { barcodeToken, scannedBy } = req.body;

    if (!barcodeToken) {
      return res.status(400).json({ message: "Barcode token is required" });
    }

    const booking = await StallBooking.findOne({ barcodeToken }).populate("stallId");

    if (!booking) {
      return res.status(404).json({ message: "Invalid QR code" });
    }

    if (!isEventDay(booking.eventDate)) {
      return res.status(400).json({
        message: "Attendance can only be confirmed on the event day",
      });
    }

    if (booking.attendanceConfirmed) {
      return res.status(400).json({
        message: "Attendance already confirmed for this vendor",
        booking,
      });
    }

    booking.attendanceConfirmed = true;
    booking.attendanceConfirmedAt = new Date();

    booking.scanLogs.push({
      scannedAt: new Date(),
      scannedBy: scannedBy || "Admin",
      ipAddress: req.ip,
      emailSent: false,
    });

    await booking.save();

    return res.status(200).json({
      message: "Attendance marked successfully",
      booking: {
        id: booking._id,
        vendorName: booking.vendorName,
        vendorEmail: booking.vendorEmail,
        stallName: booking.stallName,
        stallNumber: booking.stallNumber,
        eventName: booking.eventName,
        attendanceConfirmed: booking.attendanceConfirmed,
        attendanceConfirmedAt: booking.attendanceConfirmedAt,
      },
    });
  } catch (error) {
    console.error("Scan attendance error:", error);
    return res.status(500).json({ message: "Server error while scanning QR code" });
  }
};

// 3. Admin view attendance logs
exports.getAttendanceLogs = async (req, res) => {
  try {
    const logs = await StallBooking.find({
      barcodeToken: { $ne: null },
    })
      .select(
        "vendorName vendorEmail stallName stallNumber eventName eventDate attendanceConfirmed attendanceConfirmedAt scanLogs status advancePaid"
      )
      .sort({ attendanceConfirmedAt: -1, createdAt: -1 });

    return res.status(200).json(logs);
  } catch (error) {
    console.error("Get attendance logs error:", error);
    return res.status(500).json({ message: "Server error while fetching attendance logs" });
  }
};