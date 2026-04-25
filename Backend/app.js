const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config({ override: true });

// Legacy stall-management routes
const stallRoutes = require("./routes/stallRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
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
      : "Something went wrong while processing the request.";

  res.status(statusCode).json({
    success: false,
    message,
    ...(error instanceof AppError && error.details ? { details: error.details } : {}),
  });
});

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
