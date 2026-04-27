const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config({ override: true });

// Legacy stall-management routes
const stallRoutes = require("./routes/stallRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const communityRoutesG = require("./routes/communityRoutesg");
const eventRoutesG = require("./routes/eventRoutesg");
const taskRoutesG = require("./routes/taskRoutesg");
const taskNotificationRoutesG = require("./routes/taskNotificationRoutesg");
const chatRoutesG = require("./routes/chatRoutesg");
const LegacyUser = require("./models/userModel");
const { authenticate } = require("./middleware/authMiddleware");
const { register: registerVendor } = require("./controllers/authController");

// Unified EventAura routes (auth, students, organizers, events, health)
const unifiedRoutes = require("./src/routes");
const authService = require("./src/services/authService");
const { AppError } = require("./src/utils/errors");

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:3000",
    ],
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));

app.get("/", (req, res) => {
  res.send("EventAura Backend is Working 🚀");
});

// Vendor registration still uses the legacy bcrypt + JWT controller
app.post("/api/auth/register", registerVendor);

// User directory used by community/event/task member-search dialogs
app.get("/api/auth/users", authenticate, async (req, res) => {
  try {
    const search = (req.query.search || "").toString().trim();
    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { username: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const users = await LegacyUser.find(filter)
      .select("_id name email username role")
      .sort({ name: 1 })
      .lean();

    res.json(
      users.map((u) => ({
        _id: u._id,
        name: u.name,
        email: u.email,
        username: u.username,
        role: u.role,
        avatar: "#6366f1",
      }))
    );
  } catch (err) {
    console.error("List users error:", err.stack || err);
    res.status(500).json({ success: false, message: "Failed to list users." });
  }
});

// Stall-management endpoints (no auth middleware in this layer)
app.use("/api/stalls", stallRoutes);
app.use("/api/stall-bookings", bookingRoutes);
app.use("/api/attendance", attendanceRoutes);

function getBearerToken(req) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    return null;
  }
  return header.slice("Bearer ".length).trim();
}

function applyRoute(app, route) {
  app[route.method.toLowerCase()](route.path, async (req, res, next) => {
    try {
      let authUser = null;
      const token = getBearerToken(req);

      if (route.roles && route.roles.length > 0) {
        authUser = await authService.getAuthenticatedUser(token, route.roles);
      }

      const result = await route.handler({
        authUser,
        body: req.body || {},
        params: req.params || {},
        query: req.query || {},
        req,
        res,
        token,
      });

      res.status(result.statusCode || 200).json({
        success: true,
        ...(result.message ? { message: result.message } : {}),
        ...(Object.prototype.hasOwnProperty.call(result, "data")
          ? { data: result.data }
          : {}),
      });
    } catch (error) {
      next(error);
    }
  });
}

for (const route of unifiedRoutes) {
  applyRoute(app, route);
}

// EventAura community / event / task data used by G_ dialogs.
// Mounted AFTER the unified routes so the specific unified handlers
// (e.g. POST /api/events, GET /api/events/my-events) keep priority.
// `authenticate` populates req.user, which the controllers depend on.
app.use("/api/communities", authenticate, communityRoutesG);
// /api/events is owned by the unified event-request flow; expose the G_
// internal-event CRUD under a distinct prefix to avoid that collision.
app.use("/api/g-events", authenticate, eventRoutesG);
app.use("/api/tasks", authenticate, taskRoutesG);
app.use("/api/task-notifications", authenticate, taskNotificationRoutesG);
app.use("/api/chat", authenticate, chatRoutesG);

// Dev-role shim for sponsor/payment ESM routes that use requireRole(req.user.role).
// Reads the x-dev-role header sent by the FinancialDashboard frontend.
app.use("/api", (req, _res, next) => {
  const devRole = req.headers["x-dev-role"];
  if (devRole && !req.user) {
    req.user = { role: String(devRole) };
  }
  next();
});

// Sponsor / payment / invoice routes are written as ESM. Load them via
// dynamic import() and mount once resolved so this CJS app can use them.
(async () => {
  try {
    const [
      sponsorRequestRoutes,
      sponsorApplicationRoutes,
      sponsorshipPackageRoutes,
      paymentRoutes,
      invoiceRoutes,
    ] = await Promise.all([
      import("./src/routes/sponsorRequest.routes.mjs"),
      import("./src/routes/sponsorApplication.routes.mjs"),
      import("./src/routes/sponsorshipPackage.routes.mjs"),
      import("./src/routes/payment.routes.mjs"),
      import("./src/routes/invoice.routes.mjs"),
    ]);

    app.use("/api", sponsorRequestRoutes.default);
    app.use("/api", sponsorApplicationRoutes.default);
    app.use("/api", sponsorshipPackageRoutes.default);
    app.use("/api", paymentRoutes.default);
    app.use("/api", invoiceRoutes.default);
    console.log("✅ Sponsor/payment routes mounted");
  } catch (err) {
    console.error("❌ Failed to mount sponsor/payment routes:", err);
  }

  // JSON error handler MUST be registered after the sponsor routes; otherwise
  // Express falls back to its default HTML error page for errors thrown there.
  app.use((error, req, res, next) => {
    if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
      return res.status(400).json({
        success: false,
        message: "Invalid JSON body.",
      });
    }

    const statusCode = error instanceof AppError ? error.statusCode : 500;
    const message =
      error instanceof AppError
        ? error.message
        : error?.message || "Something went wrong while processing the request.";

    res.status(statusCode).json({
      success: false,
      message,
      ...(error instanceof AppError && error.details ? { details: error.details } : {}),
    });
  });
})();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");

    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.log("❌ MongoDB Error:", err);
  });
