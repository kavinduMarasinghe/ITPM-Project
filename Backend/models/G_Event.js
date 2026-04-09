const mongoose = require("mongoose");

const eventMemberInfoSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["event-lead", "organizer", "coordinator", "team-member", "volunteer"],
      required: true,
    },
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ["upcoming", "active", "completed"],
      default: "upcoming",
    },
    societyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      required: true,
    },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    memberRoles: [eventMemberInfoSchema],
    eventType: {
      type: String,
      enum: ["sports", "seminar", "concert", "social", "community", "exhibition", "workshop"],
      required: true,
    },
    completionStatus: {
      type: String,
      enum: ["completed", "partial", "delayed"],
    },
    finalScore: Number,
    files: [{ type: Object }],
  },
  {
    timestamps: true,
    collection: "gayani_events",
  }
);

module.exports = mongoose.model("Event", eventSchema);