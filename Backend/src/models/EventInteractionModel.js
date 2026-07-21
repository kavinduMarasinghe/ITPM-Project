const mongoose = require("mongoose");

function toPlainInteraction(document) {
  if (!document) {
    return null;
  }

  const plainInteraction =
    typeof document.toObject === "function"
      ? document.toObject({ versionKey: false })
      : { ...document };

  delete plainInteraction._id;
  delete plainInteraction.__v;

  return plainInteraction;
}

const eventInteractionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    eventId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    clickCount: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    firstClickedAt: {
      type: String,
      required: true,
    },
    lastClickedAt: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    collection: "event_interactions",
    versionKey: false,
  }
);

eventInteractionSchema.index(
  { userId: 1, eventId: 1 },
  {
    unique: true,
  }
);

const EventInteractionDocument =
  mongoose.models.EventInteractionRecord ||
  mongoose.model("EventInteractionRecord", eventInteractionSchema);

class EventInteractionModel {
  async recordClick(userId, eventId, clickedAt = new Date().toISOString()) {
    const interaction = await EventInteractionDocument.findOneAndUpdate(
      {
        userId,
        eventId,
      },
      {
        $set: {
          lastClickedAt: clickedAt,
        },
        $setOnInsert: {
          firstClickedAt: clickedAt,
        },
        $inc: {
          clickCount: 1,
        },
      },
      {
        upsert: true,
        returnDocument: "after",
      }
    ).lean();

    return toPlainInteraction(interaction);
  }

  async findByUserId(userId) {
    const interactions = await EventInteractionDocument.find({ userId })
      .sort({ lastClickedAt: -1 })
      .lean();

    return interactions.map(toPlainInteraction);
  }

  async getPopularEventStats(limit = 50) {
    const safeLimit = Number.isFinite(Number(limit)) ? Math.max(1, Number(limit)) : 50;
    const stats = await EventInteractionDocument.aggregate([
      {
        $group: {
          _id: "$eventId",
          totalClicks: { $sum: "$clickCount" },
          lastClickedAt: { $max: "$lastClickedAt" },
        },
      },
      {
        $sort: {
          totalClicks: -1,
          lastClickedAt: -1,
        },
      },
      {
        $limit: safeLimit,
      },
    ]);

    return stats.map((stat) => ({
      eventId: stat._id,
      totalClicks: Number(stat.totalClicks || 0),
      lastClickedAt: stat.lastClickedAt || null,
    }));
  }

  async removeByEventId(eventId) {
    const result = await EventInteractionDocument.deleteMany({ eventId });
    return Number(result?.deletedCount || 0);
  }
}

module.exports = new EventInteractionModel();
