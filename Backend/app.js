const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Import Routes
const stallRoutes = require("./routes/stallRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();


// ================= Middleware =================
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// ================= Routes =================

// Test route
app.get("/", (req, res) => {
  res.send("EventAura Backend is Working 🚀");
});

// Auth routes
app.use("/api/auth", authRoutes);

// Stall routes
app.use("/api/stalls", stallRoutes);

// Booking routes
app.use("/api/stall-bookings", bookingRoutes);

// ================= MongoDB Connection =================

mongoose
  .connect("mongodb+srv://admin:7au0KnxTOQwJxCPG@cluster0.bstrqac.mongodb.net/stall_management")
  .then(() => {
    console.log("✅ Connected to MongoDB");

    app.listen(5000, () => {
      console.log("🚀 Server running on port 5000");
    });
  })
  .catch((err) => {
    console.log("❌ MongoDB Error:", err);
  });