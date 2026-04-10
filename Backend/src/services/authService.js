const { randomUUID } = require("crypto");

const { ROLES, SESSION_TTL_MS, USER_STATUSES } = require("../config/constants");
const sessionModel = require("../models/SessionModel");
const userModel = require("../models/UserModel");
const { AppError } = require("../utils/errors");
const { verifyPassword } = require("../utils/password");

function sanitizeUser(user) {
  return {
    id: user.id,
    role: user.role,
    status: user.status,
    fullName: user.fullName,
    email: user.email,
    studentId: user.studentId || null,
    phone: user.phone || null,
    department: user.department || user.profile?.department || null,
    title: user.profile?.title || user.position || null,
    organizationName: user.organizationName || null,
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

    const user = await userModel.findById(session.userId);

    if (!user) {
      throw new AppError(401, "User not found.");
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      throw new AppError(403, "You do not have permission to access this resource.");
    }

    ensureUserCanLogin(user);
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
