const express = require("express");
const router = express.Router();

const {
  getTaskNotifications,
  createTaskNotification,
  markTaskNotificationRead,
  markAllTaskNotificationsRead,
  deleteTaskNotification,
} = require("../controllers/taskNotificationControllerg");

router.get("/", getTaskNotifications);
router.post("/", createTaskNotification);
router.patch("/read-all", markAllTaskNotificationsRead);
router.patch("/:id/read", markTaskNotificationRead);
router.delete("/:id", deleteTaskNotification);

module.exports = router;