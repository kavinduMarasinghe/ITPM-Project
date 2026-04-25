const mongoose = require("mongoose");

const taskCommentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    text: { type: String, required: true },
    timestamp: { type: String, required: true },
  },
  { _id: false }
);

const taskActivitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, _id: true }
);

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    phase: {
      type: String,
      enum: ["todo", "in-progress", "review", "completed"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      required: true,
    },
    impact: {
      type: String,
      enum: ["critical", "important", "supportive"],
      required: true,
    },
    assigneeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deadline: { type: Date, required: true },
    progress: { type: Number, default: 0 },
    isOverdue: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    blockedBy: String,
    comments: { type: Number, default: 0 },
    attachments: { type: Number, default: 0 },
    commentList: [taskCommentSchema],
    activityLog: [taskActivitySchema],
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);