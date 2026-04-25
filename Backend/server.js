const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/communities", require("./routes/communityRoutesg"));
app.use("/api/events", require("./routes/eventRoutesg"));
app.use("/api/tasks", require("./routes/taskRoutesg"));
app.use("/api/task-notifications", require("./routes/taskNotificationRoutesg"));
app.use("/api/chat", require("./routes/chatRoutesg"));

// Test route
app.get("/", (req, res) => {
  res.send("Backend API running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});