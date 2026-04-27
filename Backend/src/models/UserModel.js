const mongoose = require("mongoose");

function normalizeUser(user) {
  const normalizedUser = {
    ...user,
  };

  if (Object.prototype.hasOwnProperty.call(normalizedUser, "email")) {
    const normalizedEmail = String(normalizedUser.email || "").trim().toLowerCase();

    if (normalizedEmail) {
      normalizedUser.email = normalizedEmail;
    } else {
      delete normalizedUser.email;
    }
  }

  if (Object.prototype.hasOwnProperty.call(normalizedUser, "studentId")) {
    const normalizedStudentId = String(normalizedUser.studentId || "").trim().toUpperCase();

    if (normalizedStudentId) {
      normalizedUser.studentId = normalizedStudentId;
    } else {
      delete normalizedUser.studentId;
    }
  }

  if (
    Object.prototype.hasOwnProperty.call(normalizedUser, "yearsOfExperience") &&
    normalizedUser.yearsOfExperience !== null &&
    normalizedUser.yearsOfExperience !== undefined
  ) {
    const yearsOfExperience = Number(normalizedUser.yearsOfExperience);

    if (Number.isFinite(yearsOfExperience)) {
      normalizedUser.yearsOfExperience = yearsOfExperience;
    } else {
      delete normalizedUser.yearsOfExperience;
    }
  }

  return normalizedUser;
}

function toPlainUser(document) {
  if (!document) {
    return null;
  }

  const plainUser =
    typeof document.toObject === "function"
      ? document.toObject({ versionKey: false })
      : { ...document };

  delete plainUser._id;
  delete plainUser.__v;

  return plainUser;
}

const userSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    studentId: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    year: {
      type: String,
      trim: true,
    },
    semester: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    organizationName: {
      type: String,
      trim: true,
    },
    organizationType: {
      type: String,
      trim: true,
    },
    organizationEmail: {
      type: String,
      trim: true,
    },
    organizationPhone: {
      type: String,
      trim: true,
    },
    position: {
      type: String,
      trim: true,
    },
    yearsOfExperience: Number,
    passwordHash: {
      type: String,
      required: true,
    },
    createdAt: {
      type: String,
      required: true,
    },
    updatedAt: {
      type: String,
      required: true,
    },
    reviewedAt: String,
    reviewedBy: String,
    reviewNotes: String,
    profile: mongoose.Schema.Types.Mixed,
    application: mongoose.Schema.Types.Mixed,
  },
  {
    collection: "users",
    minimize: false,
    strict: false,
    versionKey: false,
  }
);

userSchema.index(
  { email: 1 },
  {
    unique: true,
    sparse: true,
  }
);

userSchema.index(
  { studentId: 1 },
  {
    unique: true,
    sparse: true,
  }
);

const UserDocument =
  mongoose.models.UserRecord || mongoose.model("UserRecord", userSchema);

class UserModel {
  async getAllUsers() {
    const users = await UserDocument.find({}).lean();
    return users.map(toPlainUser);
  }

  async findById(id) {
    const user = await UserDocument.findOne({ id }).lean();
    return toPlainUser(user);
  }

  async findByEmail(email) {
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!normalizedEmail) {
      return null;
    }

    const user = await UserDocument.findOne({ email: normalizedEmail }).lean();
    return toPlainUser(user);
  }

  async findByStudentId(studentId) {
    const normalizedStudentId = String(studentId || "").trim().toUpperCase();

    if (!normalizedStudentId) {
      return null;
    }

    const user = await UserDocument.findOne({ studentId: normalizedStudentId }).lean();
    return toPlainUser(user);
  }

  async findAllByRole(role) {
    const users = await UserDocument.find({ role }).lean();
    return users.map(toPlainUser);
  }

  async createUser(user) {
    const createdUser = await UserDocument.create(normalizeUser(user));
    return toPlainUser(createdUser);
  }

  async updateUser(id, updater) {
    const userDocument = await UserDocument.findOne({ id });

    if (!userDocument) {
      return null;
    }

    const currentUser = toPlainUser(userDocument);
    const updatedUser = await updater(currentUser);

    if (!updatedUser) {
      return null;
    }

    userDocument.set(normalizeUser(updatedUser));
    await userDocument.save();

    return toPlainUser(userDocument);
  }
}

module.exports = new UserModel();
