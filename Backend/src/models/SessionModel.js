const mongoose = require("mongoose");

function normalizeSession(session) {
  return {
    ...session,
    token: String(session.token || "").trim(),
    userId: String(session.userId || "").trim(),
    createdAt: String(session.createdAt || "").trim(),
    expiresAt: String(session.expiresAt || "").trim(),
  };
}

function toPlainSession(document) {
  if (!document) {
    return null;
  }

  const plainSession =
    typeof document.toObject === "function"
      ? document.toObject({ versionKey: false })
      : { ...document };

  delete plainSession._id;
  delete plainSession.__v;

  return plainSession;
}

const sessionSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    createdAt: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    collection: "sessions",
    versionKey: false,
  }
);

const SessionDocument =
  mongoose.models.SessionRecord || mongoose.model("SessionRecord", sessionSchema);

class SessionModel {
  async createSession(session) {
    const normalizedSession = normalizeSession(session);

    await SessionDocument.deleteMany({ userId: normalizedSession.userId });

    const createdSession = await SessionDocument.create(normalizedSession);
    return toPlainSession(createdSession);
  }

  async findByToken(token) {
    const normalizedToken = String(token || "").trim();

    if (!normalizedToken) {
      return null;
    }

    const session = await SessionDocument.findOne({ token: normalizedToken }).lean();
    return toPlainSession(session);
  }

  async removeByToken(token) {
    const normalizedToken = String(token || "").trim();

    if (!normalizedToken) {
      return;
    }

    await SessionDocument.deleteOne({ token: normalizedToken });
  }

  async removeExpiredSessions(referenceDate = new Date().toISOString()) {
    await SessionDocument.deleteMany({
      expiresAt: {
        $lte: String(referenceDate),
      },
    });
  }
}

module.exports = new SessionModel();
