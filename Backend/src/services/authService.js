const { randomUUID } = require("crypto");
const bcrypt = require("bcryptjs");

const { ROLES, SESSION_TTL_MS, USER_STATUSES } = require("../config/constants");
const sessionModel = require("../models/SessionModel");
const userModel = require("../models/UserModel");
const LegacyUser = require("../../models/userModel");
const { AppError } = require("../utils/errors");
const { verifyPassword } = require("../utils/password");

const VENDOR_ID_PREFIX = "vendor:";

function sanitizeUser(user) {
  const fullName = user.fullName || user.name || null;
  return {
    id: user.id,
    role: user.role,
    status: user.status,
    fullName,
    name: fullName,
    email: user.email,
    studentId: user.studentId || null,
    phone: user.phone || null,
    department: user.department || user.profile?.department || null,
    title: user.profile?.title || user.position || null,
    organizationName: user.organizationName || null,
    businessName: user.businessName || null,
  };
}

function buildVendorUser(legacyUser) {
  return {
    id: `${VENDOR_ID_PREFIX}${legacyUser._id.toString()}`,
    role: ROLES.VENDOR,
    status: USER_STATUSES.ACTIVE,
    fullName: legacyUser.name,
    email: legacyUser.email,
    phone: legacyUser.contactNumber || null,
    businessName: legacyUser.businessName || null,
  };
}

function buildLegacyAdminUser(legacyUser) {
  return {
    id: `${VENDOR_ID_PREFIX}${legacyUser._id.toString()}`,
    role: ROLES.ADMIN,
    status: USER_STATUSES.ACTIVE,
    fullName: legacyUser.name,
    email: legacyUser.email,
    phone: legacyUser.contactNumber || null,
  };
}

function ensureUserCanLogin(user) {
  if (user.role === ROLES.ORGANIZER && user.status === USER_STATUSES.PENDING) {
    throw new AppError(
      403,
      "Your organizer account is pending Head Organizer approval."
    );
  }

  if (user.role === ROLES.ORGANIZER && user.status === USER_STATUSES.REJECTED) {
    throw new AppError(
      403,
      "Your organizer registration was rejected. Please contact the admin team."
    );
  }

  if (![USER_STATUSES.ACTIVE, USER_STATUSES.APPROVED].includes(user.status)) {
    throw new AppError(403, "This account is not active.");
  }
}

class AuthService {
  async login(credentials) {
    const requestedRole = credentials.role;

    if (!credentials.password) {
      throw new AppError(400, "Password is required.");
    }

    if (requestedRole === ROLES.VENDOR) {
      return this.loginVendor(credentials);
    }

    let user = null;
    let userRole = requestedRole;

    if (requestedRole === ROLES.STUDENT) {
      if (!credentials.studentId) {
        throw new AppError(400, "Student ID is required.");
      }

      user = await userModel.findByStudentId(credentials.studentId);
      userRole = ROLES.STUDENT;
    } else {
      if (!credentials.email) {
        throw new AppError(400, "Email is required.");
      }

      user = await userModel.findByEmail(credentials.email);

      if (!user) {
        throw new AppError(401, "Invalid credentials.");
      }

      if (user.role === ROLES.STUDENT) {
        throw new AppError(403, "Please use the student login tab for student accounts.");
      }

      if (
        requestedRole &&
        requestedRole !== "staff" &&
        requestedRole !== user.role
      ) {
        throw new AppError(401, "Invalid credentials.");
      }

      userRole = user.role;
    }

    if (!Object.values(ROLES).includes(userRole)) {
      throw new AppError(400, "Please select a valid role.");
    }

    if (!user || user.role !== userRole) {
      throw new AppError(401, "Invalid credentials.");
    }

    if (!verifyPassword(credentials.password, user.passwordHash)) {
      throw new AppError(401, "Invalid credentials.");
    }

    ensureUserCanLogin(user);
    return this.createAuthenticatedSession(user);
  }

  async loginVendor(credentials) {
    if (!credentials.email) {
      throw new AppError(400, "Email is required.");
    }

    const normalizedEmail = String(credentials.email).trim().toLowerCase();

    const legacyUser = await LegacyUser.findOne({
      role: { $in: [ROLES.VENDOR, ROLES.ADMIN] },
      $or: [{ email: normalizedEmail }, { username: normalizedEmail }],
    });

    if (!legacyUser || !legacyUser.password) {
      throw new AppError(401, "Invalid credentials.");
    }

    const matches = await bcrypt.compare(credentials.password, legacyUser.password);
    if (!matches) {
      throw new AppError(401, "Invalid credentials.");
    }

    const sessionUser =
      legacyUser.role === ROLES.ADMIN
        ? buildLegacyAdminUser(legacyUser)
        : buildVendorUser(legacyUser);

    return this.createAuthenticatedSession(sessionUser);
  }

  async createAuthenticatedSession(user) {
    const createdAt = new Date();
    const session = {
      token: randomUUID(),
      userId: user.id,
      createdAt: createdAt.toISOString(),
      expiresAt: new Date(createdAt.getTime() + SESSION_TTL_MS).toISOString(),
    };

    await sessionModel.createSession(session);

    return {
      token: session.token,
      user: sanitizeUser(user),
    };
  }

  async getAuthenticatedUser(token, allowedRoles = []) {
    if (!token) {
      throw new AppError(401, "Authentication token is required.");
    }

    await sessionModel.removeExpiredSessions();
    const session = await sessionModel.findByToken(token);

    if (!session) {
      throw new AppError(401, "Session expired or invalid.");
    }

    let user;

    if (session.userId.startsWith(VENDOR_ID_PREFIX)) {
      const legacyId = session.userId.slice(VENDOR_ID_PREFIX.length);
      const legacyUser = await LegacyUser.findById(legacyId);

      if (!legacyUser) {
        throw new AppError(401, "User not found.");
      }

      user =
        legacyUser.role === ROLES.ADMIN
          ? buildLegacyAdminUser(legacyUser)
          : buildVendorUser(legacyUser);
    } else {
      user = await userModel.findById(session.userId);

      if (!user) {
        throw new AppError(401, "User not found.");
      }
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      throw new AppError(403, "You do not have permission to access this resource.");
    }

    if (user.role !== ROLES.VENDOR) {
      ensureUserCanLogin(user);
    }

    return user;
  }

  async logout(token) {
    if (!token) {
      return;
    }

    await sessionModel.removeByToken(token);
  }

  sanitizeUser(user) {
    return sanitizeUser(user);
  }
}

module.exports = new AuthService();
