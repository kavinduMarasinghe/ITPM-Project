const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      default: null,
    },
    senderId: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      trim: true,
      default: "",
    },
    chatScope: {
      type: String,
      enum: ["event", "community"],
      required: true,
      default: "event",
    },
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      default: null,
    },
    file: {
      name: { type: String, default: "" },
      type: { type: String, default: "" },
      size: { type: String, default: "" },
      url: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatMessage", chatMessageSchema);