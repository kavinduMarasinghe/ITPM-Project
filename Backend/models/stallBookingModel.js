const mongoose = require('mongoose');

const scanLogSchema = new mongoose.Schema({
  scannedAt: { type: Date, default: Date.now },
  scannedBy: { type: String },
  ipAddress: { type: String },
  emailSent: { type: Boolean, default: false },
});

const stallBookingSchema = new mongoose.Schema(
  {
    vendorName: { type: String, required: true, trim: true },
    vendorEmail: { type: String, trim: true },

    stallId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Stall',
      required: true,
    },
    stallName: { type: String, required: true, trim: true },
    stallNumber: { type: String, required: true, trim: true },

    eventName: { type: String, required: true, trim: true },
    eventDate: { type: Date },

    contactNumber: { type: String, required: true, trim: true },
    businessName: { type: String, required: true, trim: true },
    itemsToSell: { type: String, trim: true },
    notes: { type: String, trim: true },

    status: {
      type: String,
      enum: ['Pending', 'PreApproved', 'Confirmed', 'Approved', 'Rejected'],
      default: 'Pending',
    },

    advancePaid: { type: Boolean, default: false },
    paymentDeadline: { type: Date },

    // QR / Attendance
    barcodeToken: { type: String, unique: true, sparse: true },
    barcodeGeneratedAt: { type: Date },
    scanLogs: [scanLogSchema],
    attendanceConfirmed: { type: Boolean, default: false },
    attendanceConfirmedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StallBooking', stallBookingSchema);