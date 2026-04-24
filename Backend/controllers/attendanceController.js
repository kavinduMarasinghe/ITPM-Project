const crypto = require("crypto");
const StallBooking = require("../models/stallBookingModel");
const { sendAttendanceScanEmail } = require("../utils/emailService");

// Same calendar day as event (local). Set ATTENDANCE_RELAX_EVENT_DAY=1 to allow any day (demo).
const isEventDay = (eventDate) => {
  if (process.env.ATTENDANCE_RELAX_EVENT_DAY === "1") return true;
  if (!eventDate) return true;
  const d = new Date(eventDate);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
};

// 1. Generate or return QR token for vendor pass (token is created at advance payment)
exports.generateBarcodeForBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await StallBooking.findById(bookingId).populate("stallId");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const role = req.user?.role;
    if (role === "vendor") {
      const displayName = req.user.name || req.user.username;
      const matches =
        booking.vendorName === displayName ||
        booking.vendorName === req.user.username ||
        (req.user.name && booking.vendorName === req.user.name);
      if (!matches) {
        return res.status(403).json({ message: "You can only view QR passes for your own bookings." });
      }
    } else if (role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (!booking.advancePaid) {
      return res.status(400).json({
        message: "Advance payment must be completed before your QR pass is available.",
      });
    }

    if (!["Confirmed", "Approved"].includes(booking.status)) {
      return res.status(400).json({
        message: "QR is only available for confirmed stall bookings.",
      });
    }

    if (!booking.barcodeToken) {
      booking.barcodeToken = crypto.randomBytes(16).toString("hex");
      booking.barcodeGeneratedAt = new Date();
      await booking.save();
    }

    return res.status(200).json({
      message: "QR token ready",
      bookingId: booking._id,
      barcodeToken: booking.barcodeToken,
      vendorName: booking.vendorName,
      vendorEmail: booking.vendorEmail,
      stallName: booking.stallName,
      stallNumber: booking.stallNumber,
      eventName: booking.eventName,
      eventDate: booking.eventDate,
      advancePaid: booking.advancePaid,
      eventDay: isEventDay(booking.eventDate),
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
        message: "Attendance can only be confirmed on the scheduled event day.",
      });
    }

    const wasAlreadyConfirmed = booking.attendanceConfirmed === true;

    if (!wasAlreadyConfirmed) {
      booking.attendanceConfirmed = true;
      booking.attendanceConfirmedAt = new Date();
    }

    const scannedAt = new Date();
    const scanBy = scannedBy || "Admin";
    booking.scanLogs.push({
      scannedAt,
      scannedBy: scanBy,
      ipAddress: req.ip,
      emailSent: false,
    });

    const emailResult = await sendAttendanceScanEmail({
      booking,
      scannedBy: scanBy,
      scannedAt,
    });
    if (emailResult.sent && booking.scanLogs.length > 0) {
      booking.scanLogs[booking.scanLogs.length - 1].emailSent = true;
    }

    await booking.save();

    return res.status(200).json({
      message: wasAlreadyConfirmed
        ? "Vendor re-scan logged. Notification email sent."
        : "Attendance marked successfully",
      reScan: wasAlreadyConfirmed,
      adminEmailSent: Boolean(emailResult.sent),
      adminEmailNote: emailResult.sent
        ? "Notification sent to admin Gmail."
        : emailResult.reason || emailResult.error || "Admin email not configured (set GMAIL_APP_PASSWORD in Backend/.env).",
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
      $or: [{ barcodeToken: { $ne: null } }, { advancePaid: true }],
    })
      .select(
        "vendorName vendorEmail stallName stallNumber eventName eventDate attendanceConfirmed attendanceConfirmedAt scanLogs status advancePaid advanceAmountPaid barcodeToken"
      )
      .sort({ attendanceConfirmedAt: -1, createdAt: -1 });

    return res.status(200).json({ success: true, data: logs });
  } catch (error) {
    console.error("Get attendance logs error:", error);
    return res.status(500).json({ success: false, message: "Server error while fetching attendance logs" });
  }
};
