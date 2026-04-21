const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Import Routes
const stallRoutes = require("./routes/stallRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();


// ================= Middleware =================
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://Biyuni_Taraka:Biyuni456@event.puotuo9.mongodb.net/eventAuraDB?retryWrites=true&w=majority&appName=EVENT";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
  })
  .catch((err) => {
    console.log("⚠️ MongoDB Connection Warning: ", err.message);
    console.log("Server will start without database connection. Please check your MongoDB Atlas IP whitelist.");
  });

// Start server regardless of MongoDB connection status
app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});