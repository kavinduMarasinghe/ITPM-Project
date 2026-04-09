const { randomUUID } = require("crypto");

const { ROLES, USER_STATUSES } = require("../config/constants");
const userModel = require("../models/UserModel");
const { AppError } = require("../utils/errors");
const { hashPassword } = require("../utils/password");

const EMAIL_REGEX = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;

function toOrganizerView(user) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone || "",
    organizationName: user.organizationName || "",
    organizationType: user.organizationType || "",
    organizationEmail: user.organizationEmail || "",
    organizationPhone: user.organizationPhone || "",
    position: user.position || "",
    yearsOfExperience: Number(user.yearsOfExperience || 0),
    status: user.status,
    submittedDate: user.createdAt,
    reviewedAt: user.reviewedAt || null,
    reviewedBy: user.reviewedBy || null,
    reviewNotes: user.reviewNotes || "",
    application: user.application || {},
  };
}

class OrganizerService {
  async registerOrganizer(payload) {
    const fullName = String(payload.fullName || "").trim();
    const email = String(payload.email || "").trim().toLowerCase();
    const phone = String(payload.phone || "").trim();
    const organizationName = String(payload.organizationName || "").trim();
    const organizationType = String(payload.organizationType || "").trim();
    const organizationEmail = String(payload.organizationEmail || "").trim().toLowerCase();
    const organizationPhone = String(payload.organizationPhone || "").trim();
    const position = String(payload.position || "").trim();
    const yearsOfExperience = Number(payload.yearsOfExperience || 0);
    const password = String(payload.password || "");
    const confirmPassword = String(payload.confirmPassword || "");

    if (fullName.length < 3) {
      throw new AppError(400, "Organizer full name is required.");
    }

    if (!EMAIL_REGEX.test(email)) {
      throw new AppError(400, "Please provide a valid organizer email.");
    }

    if (!organizationName) {
      throw new AppError(400, "Organization name is required.");
    }

    if (!position) {
      throw new AppError(400, "Position is required.");
    }

    if (password.length < 6 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      throw new AppError(
        400,
        "Password must be at least 6 characters with at least one uppercase letter and one number."
      );
    }

    if (password !== confirmPassword) {
      throw new AppError(400, "Passwords do not match.");
    }

    if (await userModel.findByEmail(email)) {
      throw new AppError(409, "This organizer email is already registered.");
    }

    const now = new Date().toISOString();
    const user = {
      id: randomUUID(),
      role: ROLES.ORGANIZER,
      status: USER_STATUSES.PENDING,
      fullName,
      email,
      phone,
      organizationName,
      organizationType,
      organizationEmail,
      organizationPhone,
      position,
      yearsOfExperience,
      passwordHash: hashPassword(password),
      createdAt: now,
      updatedAt: now,
      application: {
        ...payload,
        email,
        organizationEmail,
      },
    };

    await userModel.createUser(user);
    return toOrganizerView(user);
  }

  async getOrganizerApplications() {
    const organizers = await userModel.findAllByRole(ROLES.ORGANIZER);

    return organizers
      .map(toOrganizerView)
      .sort((left, right) => new Date(right.submittedDate) - new Date(left.submittedDate));
  }

  async getOrganizerById(id) {
    const user = await userModel.findById(id);

    if (!user || user.role !== ROLES.ORGANIZER) {
      throw new AppError(404, "Organizer application not found.");
    }

    return toOrganizerView(user);
  }

  async updateOrganizerStatus(id, status, notes, reviewer) {
    if (![USER_STATUSES.APPROVED, USER_STATUSES.REJECTED].includes(status)) {
      throw new AppError(400, "Status must be approved or rejected.");
    }

    const updatedUser = await userModel.updateUser(id, (user) => {
      if (user.role !== ROLES.ORGANIZER) {
        throw new AppError(404, "Organizer application not found.");
      }

      if (user.status !== USER_STATUSES.PENDING) {
        throw new AppError(
          400,
          "Only pending organizer applications can be reviewed."
        );
      }

      return {
        ...user,
        status,
        reviewNotes: String(notes || "").trim(),
        reviewedAt: new Date().toISOString(),
        reviewedBy: reviewer.fullName,
        updatedAt: new Date().toISOString(),
      };
    });

    if (!updatedUser) {
      throw new AppError(404, "Organizer application not found.");
    }

    return toOrganizerView(updatedUser);
  }

  async getOrganizerStats() {
    const organizers = await this.getOrganizerApplications();
    return {
      total: organizers.length,
      pending: organizers.filter((organizer) => organizer.status === USER_STATUSES.PENDING)
        .length,
      approved: organizers.filter((organizer) => organizer.status === USER_STATUSES.APPROVED)
        .length,
      rejected: organizers.filter((organizer) => organizer.status === USER_STATUSES.REJECTED)
        .length,
    };
  }
}

module.exports = new OrganizerService();
