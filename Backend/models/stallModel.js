const mongoose = require("mongoose");

const stallSchema = new mongoose.Schema(
  {
    stallName: {
      type: String,
      required: true,
      trim: true,
    },
    stallNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    eventName: {
      type: String,
      required: true,
      trim: true,
    },
    stallType: {
      type: String,
      required: true,
      enum: ["Food Stall", "Sponsor Booth", "Game Stall", "Retail Stall"],
      trim: true,
    },
    locationZone: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: String,
      required: true,
      enum: ["Small", "Medium", "Large"],
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["Available", "Reserved", "Booked"],
      default: "Available",
    },
    reservedUntil: {
      type: Date,
      default: null,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    amenities: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Stall", stallSchema);