const jwt = require("jsonwebtoken");
const authService = require("../src/services/authService");

const JWT_SECRET = process.env.JWT_SECRET || "eventaura_sliit_secret_2024";

const VENDOR_ID_PREFIX = "vendor:";

function stripVendorPrefix(id) {
  if (typeof id !== "string") return id;
  return id.startsWith(VENDOR_ID_PREFIX)
    ? id.slice(VENDOR_ID_PREFIX.length)
    : id;
}

function normalizeUser(user) {
  if (!user) return user;
  const rawId = user.id || user._id;
  const cleanId = stripVendorPrefix(rawId);
  if (cleanId) {
    user.id = cleanId;
    user._id = cleanId;
  }
  return user;
}

async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Authentication required." });
  }
  const token = header.split(" ")[1];

  // Legacy JWT (issued by Backend/controllers/authController.register)
  try {
    req.user = normalizeUser(jwt.verify(token, JWT_SECRET));
    return next();
  } catch (_jwtErr) {
    // Fall through to unified session lookup
  }

  // Unified session token (issued by Backend/src/services/authService.login)
  try {
    const sessionUser = await authService.getAuthenticatedUser(token);
    req.user = normalizeUser({
      id: sessionUser.id,
      role: sessionUser.role,
      name: sessionUser.fullName || sessionUser.name,
      username: sessionUser.email,
      email: sessionUser.email,
    });
    return next();
  } catch (_sessionErr) {
    return res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Admin access only." });
  }
  next();
}

function requireStaff(req, res, next) {
  if (!req.user || !["admin", "organizer", "hod"].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "Staff access only." });
  }
  next();
}

module.exports = { authenticate, requireAdmin, requireStaff };
