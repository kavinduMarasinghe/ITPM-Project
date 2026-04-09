const mongoose = require("mongoose");

function toPlainEvent(document) {
  if (!document) {
    return null;
  }

  const plainEvent =
    typeof document.toObject === "function"
      ? document.toObject({ versionKey: false })
      : { ...document };

  delete plainEvent._id;
  delete plainEvent.__v;

  return plainEvent;
}

const eventSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    referenceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    organizerId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    organizerName: {
      type: String,
      required: true,
      trim: true,
    },
    organizerEmail: {
      type: String,
      trim: true,
    },
    organizerPhone: {
      type: String,
      trim: true,
    },
    organizationName: {
      type: String,
      trim: true,
    },
    eventTitle: {
      type: String,
      required: true,
      trim: true,
    },
    eventType: {
      type: String,
      required: true,
      trim: true,
    },
    societyName: {
      type: String,
      trim: true,
    },
    eventSummary: {
      type: String,
      trim: true,
    },
    eventDescription: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    eventDate: {
      type: String,
      required: true,
      trim: true,
    },
    eventTime: {
      type: String,
      required: true,
      trim: true,
    },
    eventEndTime: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },
    venue: {
      type: String,
      required: true,
      trim: true,
    },
    venueLocation: {
      type: String,
      trim: true,
    },
    venueType: {
      type: String,
      trim: true,
    },
    expectedAttendees: {
      type: Number,
      required: true,
    },
    budget: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    submittedDate: {
      type: String,
      required: true,
    },
    reviewedAt: String,
    reviewedBy: String,
    reviewNotes: String,
    publishedAt: String,
    cancelledAt: String,
    statusHistory: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    requestDetails: mongoose.Schema.Types.Mixed,
  },
  {
    collection: "events",
    minimize: false,
    strict: false,
    versionKey: false,
  }
);

const EventDocument =
  mongoose.models.EventRecord || mongoose.model("EventRecord", eventSchema);

class EventModel {
  async getAllEvents() {
    const events = await EventDocument.find({}).sort({ submittedDate: -1 }).lean();
    return events.map(toPlainEvent);
  }

  async findById(id) {
    const event = await EventDocument.findOne({ id }).lean();
    return toPlainEvent(event);
  }

  async findByOrganizerId(organizerId) {
    const events = await EventDocument.find({ organizerId }).sort({ submittedDate: -1 }).lean();
    return events.map(toPlainEvent);
  }

  async findByStatus(status) {
    const events = await EventDocument.find({ status }).sort({ submittedDate: -1 }).lean();
    return events.map(toPlainEvent);
  }

  async createEvent(event) {
    const createdEvent = await EventDocument.create(event);
    return toPlainEvent(createdEvent);
  }

  async updateEvent(id, updater) {
    const eventDocument = await EventDocument.findOne({ id });

    if (!eventDocument) {
      return null;
    }

    const currentEvent = toPlainEvent(eventDocument);
    const updatedEvent = await updater(currentEvent);

    if (!updatedEvent) {
      return null;
    }

    eventDocument.set(updatedEvent);
    await eventDocument.save();

    return toPlainEvent(eventDocument);
  }

  async deleteEvent(id) {
    const deletedEvent = await EventDocument.findOneAndDelete({ id }).lean();
    return toPlainEvent(deletedEvent);
  }
}

module.exports = new EventModel();
