const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddlewareg");
const {
  getTaskNotifications,
  createTaskNotification,
  markTaskNotificationRead,
  markAllTaskNotificationsRead,
  deleteTaskNotification,
} = require("../controllers/taskNotificationControllerg");

router.get("/", protect, getTaskNotifications);
router.post("/", protect, createTaskNotification);
router.patch("/read-all", protect, markAllTaskNotificationsRead);
router.patch("/:id/read", protect, markTaskNotificationRead);
router.delete("/:id", protect, deleteTaskNotification);

module.exports = router;