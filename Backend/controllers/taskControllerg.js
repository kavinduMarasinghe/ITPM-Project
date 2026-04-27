const Task = require("../models/G_Task");
const TaskNotification = require("../models/G_TaskNotification");
const { loadMemberDirectory, lookupMember } = require("../utils/userDirectoryg");

const isValidDateValue = (value) => {
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
};

const pushActivity = (task, userId, action) => {
  if (!userId || !action) return;

  if (!Array.isArray(task.activityLog)) {
    task.activityLog = [];
  }

  task.activityLog.push({
    userId,
    action,
  });
};

const collectTaskUserIds = (task) => {
  const ids = new Set();
  if (task?.assigneeId) ids.add(String(task.assigneeId));
  for (const log of task?.activityLog || []) {
    if (log?.userId) ids.add(String(log.userId));
  }
  for (const c of task?.commentList || []) {
    if (c?.userId) ids.add(String(c.userId));
  }
  return [...ids];
};

const buildTaskFormatter = (directory) => (task) => {
  const assigneeIdStr = task?.assigneeId ? String(task.assigneeId) : "";
  const assigneeMember = assigneeIdStr ? lookupMember(directory, assigneeIdStr) : null;

  return {
    _id: task._id,
    id: task._id.toString(),
    title: task.title,
    description: task.description,
    phase: task.phase,
    priority: task.priority,
    impact: task.impact,

    assignee: assigneeMember
      ? { ...assigneeMember, taskCount: 0, completedCount: 0 }
      : null,

    assigneeId: assigneeIdStr,

    deadline: task.deadline,
    progress: task.progress,
    isOverdue: task.isOverdue,
    isBlocked: task.isBlocked,
    blockedBy: task.blockedBy,
    comments: task.comments,
    attachments: task.attachments,
    commentList: task.commentList,

    activityLog: Array.isArray(task.activityLog)
      ? task.activityLog.map((log) => ({
          _id: log._id,
          action: log.action,
          createdAt: log.createdAt,
          updatedAt: log.updatedAt,
          userId: log?.userId ? lookupMember(directory, log.userId) : null,
        }))
      : [],

    eventId: task.eventId?._id
      ? task.eventId._id.toString()
      : task.eventId?.toString(),
  };
};

async function formatTaskAsync(task) {
  const directory = await loadMemberDirectory(collectTaskUserIds(task));
  return buildTaskFormatter(directory)(task);
}

const createNotification = async ({
  userId,
  title,
  message,
  type = "info",
  eventId = null,
  taskId = null,
  relatedUserId = null,
  metadata = {},
  preventDuplicate = false,
}) => {
  if (!userId || !title || !message) return;

  try {
    if (preventDuplicate) {
      const duplicateQuery = {
        userId,
        type,
        taskId: taskId || null,
      };

      if (metadata?.trigger) {
        duplicateQuery["metadata.trigger"] = metadata.trigger;
      }

      if (metadata?.previousAssigneeId) {
        duplicateQuery["metadata.previousAssigneeId"] =
          metadata.previousAssigneeId;
      }

      const existing = await TaskNotification.findOne(duplicateQuery);

      if (existing) {
        return existing;
      }
    }

    return await TaskNotification.create({
      userId,
      title,
      message,
      type,
      eventId,
      taskId,
      relatedUserId,
      metadata,
      isRead: false,
    });
  } catch (error) {
    console.error("CREATE AUTO NOTIFICATION ERROR:", error);
  }
};

const updateOverdueTasks = async () => {
  const now = new Date();

  const overdueTasks = await Task.find({
    deadline: { $lt: now },
    phase: { $ne: "completed" },
    isOverdue: { $ne: true },
  })
    .populate("eventId", "name date status")
      ;

  for (const task of overdueTasks) {
    task.isOverdue = true;
    await task.save();

    if (task.assigneeId) {
      await createNotification({
        userId: String(task.assigneeId),
        title: "Task overdue",
        message: `Your task "${task.title}" is overdue.`,
        type: "warning",
        eventId: task.eventId?._id || task.eventId || null,
        taskId: task._id,
        metadata: {
          trigger: "task_overdue",
        },
        preventDuplicate: true,
      });
    }
  }
};

const getTasks = async (req, res) => {
  try {
    await updateOverdueTasks();

    const { eventId } = req.query;

    const filter = {};
    if (eventId) {
      filter.eventId = eventId;
    }

    const tasks = await Task.find(filter)
      .populate("eventId", "name date status")
      .sort({ createdAt: -1 })
      .lean();

    const allUserIds = [...new Set(tasks.flatMap(collectTaskUserIds))];
    const directory = await loadMemberDirectory(allUserIds);
    const formatTask = buildTaskFormatter(directory);

    res.json(tasks.map(formatTask));
  } catch (error) {
    console.error("GET TASKS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      phase,
      priority,
      impact,
      assigneeId,
      assignedTo,
      deadline,
      eventId,
      progress,
      isBlocked,
      blockedBy,
      comments,
      attachments,
      commentList,
    } = req.body;

    const finalAssigneeId = assigneeId || assignedTo;
    const finalPhase = phase || "todo";

    if (!title?.trim()) {
      return res.status(400).json({ message: "title is required" });
    }

    if (title.trim().length < 3) {
      return res.status(400).json({ message: "title must be at least 3 characters" });
    }

    if (title.trim().length > 200) {
      return res.status(400).json({ message: "title must be less than 200 characters" });
    }

    if (!description?.trim()) {
      return res.status(400).json({ message: "description is required" });
    }

    if (description.trim().length < 3) {
      return res.status(400).json({ message: "description must be at least 3 characters" });
    }

    if (description.trim().length > 1000) {
      return res.status(400).json({ message: "description must be less than 1000 characters" });
    }

    const validPriorities = ["high", "medium", "low"];
    if (!priority || !validPriorities.includes(priority)) {
      return res.status(400).json({ message: "priority is required and must be one of: " + validPriorities.join(", ") });
    }

    const validImpacts = ["critical", "important", "supportive"];
    if (!impact || !validImpacts.includes(impact)) {
      return res.status(400).json({ message: "impact is required and must be one of: " + validImpacts.join(", ") });
    }

    const validPhases = ["todo", "in-progress", "review", "completed"];
    if (finalPhase && !validPhases.includes(finalPhase)) {
      return res.status(400).json({ message: "phase must be one of: " + validPhases.join(", ") });
    }

    if (!deadline || !isValidDateValue(deadline)) {
      return res.status(400).json({ message: "valid deadline is required" });
    }

    if (!eventId) {
      return res.status(400).json({ message: "eventId is required" });
    }

    if (!finalAssigneeId) {
      return res.status(400).json({ message: "assigneeId is required" });
    }

    const task = new Task({
      title: title.trim(),
      description: description.trim(),
      phase: finalPhase,
      priority,
      impact,
      assigneeId: finalAssigneeId,
      deadline: new Date(deadline),
      eventId,
      progress: progress ?? 0,
      isOverdue: false,
      isBlocked: isBlocked ?? false,
      blockedBy: blockedBy || "",
      comments: comments ?? 0,
      attachments: attachments ?? 0,
      commentList: Array.isArray(commentList) ? commentList : [],
      activityLog: [],
    });

    pushActivity(task, req.user?._id, "created this task");

    if (finalPhase !== "todo") {
      pushActivity(task, req.user?._id, `set phase to ${finalPhase}`);
    }

    pushActivity(task, req.user?._id, "assigned this task");

    if (isBlocked) {
      pushActivity(task, req.user?._id, "marked this task as blocked");
    }

    const saved = await task.save();

    const populated = await Task.findById(saved._id)
        .populate("eventId", "name date status")
        ;

    if (populated?.assigneeId) {
      await createNotification({
        userId: String(populated.assigneeId),
        title: "New task assigned",
        message: `You have been assigned a new task: "${populated.title}".`,
        type: "task",
        eventId: populated.eventId?._id || populated.eventId || null,
        taskId: populated._id,
        relatedUserId: req.user?._id || null,
        metadata: {
          trigger: "task_created",
        },
        preventDuplicate: true,
      });
    }

    if (populated?.isBlocked && populated?.assigneeId) {
      await createNotification({
        userId: String(populated.assigneeId),
        title: "Task blocked",
        message: `Your task "${populated.title}" is blocked.`,
        type: "risk",
        eventId: populated.eventId?._id || populated.eventId || null,
        taskId: populated._id,
        metadata: {
          trigger: "task_blocked_on_create",
          blockedBy: populated.blockedBy || "",
        },
        preventDuplicate: true,
      });
    }

    res.status(201).json(await formatTaskAsync(populated));
  } catch (error) {
    console.error("CREATE TASK ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const updates = { ...req.body };

    if (updates.assignedTo && !updates.assigneeId) {
      updates.assigneeId = updates.assignedTo;
      delete updates.assignedTo;
    }

    if (updates.deadline) {
      if (!isValidDateValue(updates.deadline)) {
        return res.status(400).json({ message: "Invalid deadline" });
      }
      updates.deadline = new Date(updates.deadline);
    }

    if (updates.title !== undefined) {
      if (!String(updates.title).trim()) {
        return res.status(400).json({ message: "title cannot be empty" });
      }
      if (String(updates.title).trim().length < 3) {
        return res.status(400).json({ message: "title must be at least 3 characters" });
      }
      if (String(updates.title).trim().length > 200) {
        return res.status(400).json({ message: "title must be less than 200 characters" });
      }
    }

    if (updates.description !== undefined) {
      if (!String(updates.description).trim()) {
        return res.status(400).json({ message: "description cannot be empty" });
      }
      if (String(updates.description).trim().length < 3) {
        return res.status(400).json({ message: "description must be at least 3 characters" });
      }
      if (String(updates.description).trim().length > 1000) {
        return res.status(400).json({ message: "description must be less than 1000 characters" });
      }
    }

    const validPriorities = ["high", "medium", "low"];
    if (updates.priority && !validPriorities.includes(updates.priority)) {
      return res.status(400).json({ message: "priority must be one of: " + validPriorities.join(", ") });
    }

    const validImpacts = ["critical", "important", "supportive"];
    if (updates.impact && !validImpacts.includes(updates.impact)) {
      return res.status(400).json({ message: "impact must be one of: " + validImpacts.join(", ") });
    }

    const validPhases = ["todo", "in-progress", "review", "completed"];
    if (updates.phase && !validPhases.includes(updates.phase)) {
      return res.status(400).json({ message: "phase must be one of: " + validPhases.join(", ") });
    }

    if (updates.progress !== undefined) {
      const progressNum = Number(updates.progress);
      if (Number.isNaN(progressNum) || progressNum < 0 || progressNum > 100) {
        return res.status(400).json({ message: "progress must be a number between 0 and 100" });
      }
    }

    const existingTask = await Task.findById(req.params.id)
        .populate("eventId", "name date status")
        ;

    if (!existingTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    const previousAssigneeId = existingTask.assigneeId
      ? String(existingTask.assigneeId)
      : "";

    const previousBlocked = Boolean(existingTask.isBlocked);
    const previousOverdue = Boolean(existingTask.isOverdue);
    const previousPhase = existingTask.phase;
    const previousBlockedBy = existingTask.blockedBy || "";
    const previousProgress = existingTask.progress;

    const task = await Task.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    })
        .populate("eventId", "name date status")
        ;

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const newAssigneeId = task.assigneeId ? String(task.assigneeId) : "";

    let shouldSaveActivity = false;

    if (updates.phase && updates.phase !== previousPhase) {
      pushActivity(task, req.user?._id, `moved task to ${updates.phase}`);
      shouldSaveActivity = true;
    }

    if (
      typeof updates.assigneeId !== "undefined" &&
      newAssigneeId &&
      newAssigneeId !== previousAssigneeId
    ) {
      pushActivity(task, req.user?._id, "reassigned this task");
      shouldSaveActivity = true;
    }

    if (!previousBlocked && task.isBlocked) {
      pushActivity(task, req.user?._id, "marked this task as blocked");
      shouldSaveActivity = true;
    }

    if (previousBlocked && !task.isBlocked) {
      pushActivity(task, req.user?._id, "unblocked this task");
      shouldSaveActivity = true;
    }

    if (
      typeof updates.blockedBy !== "undefined" &&
      String(task.blockedBy || "") !== String(previousBlockedBy)
    ) {
      pushActivity(task, req.user?._id, "updated blocked reason");
      shouldSaveActivity = true;
    }

    if (
      typeof updates.progress !== "undefined" &&
      Number(task.progress) !== Number(previousProgress)
    ) {
      pushActivity(task, req.user?._id, `updated progress to ${task.progress}%`);
      shouldSaveActivity = true;
    }

    if (shouldSaveActivity) {
      await task.save();
    }

    if (newAssigneeId && newAssigneeId !== previousAssigneeId) {
      await createNotification({
        userId: newAssigneeId,
        title: "Task reassigned to you",
        message: `A task has been reassigned to you: "${task.title}".`,
        type: "task",
        eventId: task.eventId?._id || task.eventId || null,
        taskId: task._id,
        relatedUserId: req.user?._id || null,
        metadata: {
          trigger: "task_reassigned",
          previousAssigneeId,
        },
        preventDuplicate: true,
      });
    }

    if (!previousBlocked && task.isBlocked && task.assigneeId) {
      await createNotification({
        userId: String(task.assigneeId),
        title: "Task blocked",
        message: `Your task "${task.title}" has been marked as blocked.`,
        type: "risk",
        eventId: task.eventId?._id || task.eventId || null,
        taskId: task._id,
        metadata: {
          trigger: "task_blocked",
          blockedBy: task.blockedBy || "",
        },
        preventDuplicate: true,
      });
    }

    const now = new Date();
    const taskDeadline = new Date(task.deadline);
    const isNowOverdue =
      !Number.isNaN(taskDeadline.getTime()) &&
      taskDeadline < now &&
      task.phase !== "completed";

    if (!previousOverdue && isNowOverdue) {
      if (!task.isOverdue) {
        task.isOverdue = true;
        await task.save();
      }

      if (task.assigneeId) {
        await createNotification({
          userId: String(task.assigneeId),
          title: "Task overdue",
          message: `Your task "${task.title}" is overdue.`,
          type: "warning",
          eventId: task.eventId?._id || task.eventId || null,
          taskId: task._id,
          metadata: {
            trigger: "task_overdue_on_update",
          },
          preventDuplicate: true,
        });
      }
    }

    const refreshedTask = await Task.findById(task._id)
        .populate("eventId", "name date status")
        ;

    res.json(await formatTaskAsync(refreshedTask));
  } catch (error) {
    console.error("UPDATE TASK ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("DELETE TASK ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
};