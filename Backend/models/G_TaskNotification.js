const mongoose = require("mongoose");

const taskNotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        "info",
        "success",
        "warning",
        "risk",
        "chat",
        "task",
        "event",
        "system",
      ],
      default: "info",
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      default: null,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },
    relatedUserId: {
      type: String,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

// Helps prevent duplicate-notification checks run faster
taskNotificationSchema.index(
  { userId: 1, taskId: 1, type: 1, "metadata.trigger": 1 },
  { unique: false }
);

module.exports = mongoose.model("TaskNotification", taskNotificationSchema);