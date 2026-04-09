const mongoose = require('mongoose');

const stallBookingSchema = new mongoose.Schema({
  vendorName: {
    type: String,
    required: true,
    trim: true
  },
  stallId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stall',
    required: true
  },
  stallName: {
    type: String,
    required: true,
    trim: true
  },
  stallNumber: {
    type: String,
    required: true,
    trim: true
  },
  eventName: {
    type: String,
    required: true,
    trim: true
  },
  contactNumber: {
    type: String,
    required: true,
    trim: true
  },
  businessName: {
    type: String,
    required: true,
    trim: true
  },
  itemsToSell: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Pending', 'PreApproved', 'Confirmed', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  advancePaid: {
    type: Boolean,
    default: false
  },
  paymentDeadline: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("StallBooking", stallBookingSchema);