const TaskNotification = require("../models/G_TaskNotification");

const formatTaskNotification = (notification) => ({
  _id: notification._id,
  id: notification._id.toString(),
  title: notification.title,
  message: notification.message,
  type: notification.type,
  isRead: notification.isRead,

  eventId: notification.eventId?._id
    ? notification.eventId._id.toString()
    : notification.eventId?.toString() || null,

  taskId: notification.taskId?._id
    ? notification.taskId._id.toString()
    : notification.taskId?.toString() || null,

  relatedUserId: notification.relatedUserId?._id
    ? notification.relatedUserId._id.toString()
    : notification.relatedUserId?.toString() || null,

  event: notification.eventId?._id
    ? {
        _id: notification.eventId._id,
        id: notification.eventId._id.toString(),
        name: notification.eventId.name,
        date: notification.eventId.date,
        status: notification.eventId.status,
      }
    : null,

  task: notification.taskId?._id
    ? {
        _id: notification.taskId._id,
        id: notification.taskId._id.toString(),
        title: notification.taskId.title,
        phase: notification.taskId.phase,
        priority: notification.taskId.priority,
      }
    : null,

  relatedUser: notification.relatedUserId?._id
    ? {
        _id: notification.relatedUserId._id,
        id: notification.relatedUserId._id.toString(),
        name: notification.relatedUserId.name,
        email: notification.relatedUserId.email,
        avatar: notification.relatedUserId.avatar,
        role: notification.relatedUserId.role,
      }
    : null,

  metadata: notification.metadata || {},
  createdAt: notification.createdAt,
  updatedAt: notification.updatedAt,
});

const getTaskNotifications = async (req, res) => {
  try {
    const notifications = await TaskNotification.find({
      userId: req.user._id,
    })
      .populate("eventId", "name date status")
      .populate("taskId", "title phase priority")
      .populate("relatedUserId", "name email avatar role")
      .sort({ createdAt: -1 });

    res.json(notifications.map(formatTaskNotification));
  } catch (error) {
    console.error("GET TASK NOTIFICATIONS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

const createTaskNotification = async (req, res) => {
  try {
    const {
      userId,
      title,
      message,
      type,
      eventId,
      taskId,
      relatedUserId,
      metadata,
    } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    if (!title?.trim()) {
      return res.status(400).json({ message: "title is required" });
    }

    if (!message?.trim()) {
      return res.status(400).json({ message: "message is required" });
    }

    const notification = new TaskNotification({
      userId,
      title: title.trim(),
      message: message.trim(),
      type: type || "info",
      eventId: eventId || null,
      taskId: taskId || null,
      relatedUserId: relatedUserId || null,
      metadata: metadata || {},
      isRead: false,
    });

    const saved = await notification.save();

    const populated = await TaskNotification.findById(saved._id)
      .populate("eventId", "name date status")
      .populate("taskId", "title phase priority")
      .populate("relatedUserId", "name email avatar role");

    res.status(201).json(formatTaskNotification(populated));
  } catch (error) {
    console.error("CREATE TASK NOTIFICATION ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

const markTaskNotificationRead = async (req, res) => {
  try {
    const notification = await TaskNotification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true }
    )
      .populate("eventId", "name date status")
      .populate("taskId", "title phase priority")
      .populate("relatedUserId", "name email avatar role");

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json(formatTaskNotification(notification));
  } catch (error) {
    console.error("MARK TASK NOTIFICATION READ ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

const markAllTaskNotificationsRead = async (req, res) => {
  try {
    await TaskNotification.updateMany(
      { userId: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("MARK ALL TASK NOTIFICATIONS READ ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

const deleteTaskNotification = async (req, res) => {
  try {
    const notification = await TaskNotification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("DELETE TASK NOTIFICATION ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTaskNotifications,
  createTaskNotification,
  markTaskNotificationRead,
  markAllTaskNotificationsRead,
  deleteTaskNotification,
};