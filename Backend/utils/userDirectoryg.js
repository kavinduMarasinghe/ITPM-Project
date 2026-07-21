const mongoose = require("mongoose");
const LegacyUser = require("../models/userModel");

require("../src/models/UserModel");

async function loadMemberDirectory(memberIds) {
  if (!memberIds || memberIds.length === 0) return new Map();
  const directory = new Map();
  const idStrings = [...new Set(memberIds.map((m) => String(m)))];

  const objectIdCandidates = idStrings.filter(
    (id) =>
      mongoose.Types.ObjectId.isValid(id) &&
      new mongoose.Types.ObjectId(id).toString() === id
  );

  if (objectIdCandidates.length) {
    const legacyUsers = await LegacyUser.find({
      _id: { $in: objectIdCandidates },
    })
      .select("_id name email role")
      .lean();
    for (const u of legacyUsers) {
      const idStr = u._id.toString();
      directory.set(idStr, {
        _id: u._id,
        id: idStr,
        name: u.name,
        email: u.email,
        avatar: "#6366f1",
        role: u.role,
      });
    }
  }

  const remaining = idStrings.filter((id) => !directory.has(id));
  const UnifiedUserDoc = mongoose.models.UserRecord;
  if (remaining.length && UnifiedUserDoc) {
    const unifiedUsers = await UnifiedUserDoc.find({ id: { $in: remaining } })
      .select("id role fullName email")
      .lean();
    for (const u of unifiedUsers) {
      directory.set(u.id, {
        _id: u.id,
        id: u.id,
        name: u.fullName,
        email: u.email,
        avatar: "#6366f1",
        role: u.role,
      });
    }
  }

  return directory;
}

function lookupMember(directory, memberId) {
  const idStr = String(memberId);
  return (
    directory.get(idStr) || {
      _id: idStr,
      id: idStr,
      name: "Unknown member",
      email: null,
      avatar: "#6366f1",
      role: null,
    }
  );
}

module.exports = { loadMemberDirectory, lookupMember };
