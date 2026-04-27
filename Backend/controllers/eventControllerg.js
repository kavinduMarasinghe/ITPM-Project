const Event = require("../models/G_Event");
const Community = require("../models/G_Community");
const TaskNotification = require("../models/G_TaskNotification");
const Task = require("../models/G_Task");
const { loadMemberDirectory, lookupMember } = require("../utils/userDirectoryg");

const collectEventMemberIds = (event) => {
  const ids = new Set();
  for (const m of event?.members || []) ids.add(String(m));
  for (const mr of event?.memberRoles || []) {
    if (mr?.memberId) ids.add(String(mr.memberId));
  }
  return [...ids];
};

const buildEventFormatter = (directory) => (event) => ({
  _id: event._id,
  id: event._id.toString(),
  name: event.name,
  date: event.date,
  status: event.status,
  societyId: event.societyId?._id
    ? event.societyId._id.toString()
    : event.societyId?.toString(),
  society: event.societyId && event.societyId._id
    ? {
        _id: event.societyId._id,
        id: event.societyId._id.toString(),
        name: event.societyId.name,
        color: event.societyId.color,
        icon: event.societyId.icon,
        description: event.societyId.description,
        category: event.societyId.category,
      }
    : null,
  members: Array.isArray(event.members)
    ? event.members.map((memberId) => lookupMember(directory, memberId))
    : [],
  memberRoles: Array.isArray(event.memberRoles)
    ? event.memberRoles.map((mr) => ({
        memberId: mr.memberId ? String(mr.memberId) : null,
        member: mr.memberId ? lookupMember(directory, mr.memberId) : null,
        role: mr.role,
      }))
    : [],
  eventType: event.eventType,
  completionStatus: event.completionStatus,
  finalScore: event.finalScore,
  files: Array.isArray(event.files) ? event.files : [],
  createdAt: event.createdAt,
  updatedAt: event.updatedAt,
});

// Backward-compatible: caller may already have a directory loaded;
// otherwise this loads on demand for a single event.
async function formatEventAsync(event) {
  const directory = await loadMemberDirectory(collectEventMemberIds(event));
  return buildEventFormatter(directory)(event);
}

const isValidDateValue = (value) => {
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
};

const normalizeMemberIds = (members, creatorId) => {
  const baseMembers = Array.isArray(members) ? members.map(String) : [];
  return [...new Set([creatorId, ...baseMembers])];
};

const normalizeMemberRoles = (memberRoles, creatorId) => {
  const validRoles = [
    "event-lead",
    "organizer",
    "coordinator",
    "team-member",
    "volunteer",
  ];

  const cleanedRoles = Array.isArray(memberRoles)
    ? memberRoles
        .filter(
          (mr) => mr && mr.memberId && mr.role && validRoles.includes(mr.role)
        )
        .map((mr) => ({
          memberId: String(mr.memberId),
          role: mr.role,
        }))
    : [];

  const hasCreatorRole = cleanedRoles.some(
    (mr) => String(mr.memberId) === creatorId
  );

  if (!hasCreatorRole) {
    cleanedRoles.push({
      memberId: creatorId,
      role: "organizer",
    });
  }

  return cleanedRoles;
};

const createEventNotification = async ({
  userId,
  title,
  message,
  eventId = null,
  relatedUserId = null,
  metadata = {},
  preventDuplicate = false,
}) => {
  if (!userId || !title || !message) return;

  try {
    if (preventDuplicate) {
      const duplicateQuery = {
        userId,
        type: "event",
        eventId: eventId || null,
      };

      if (metadata?.trigger) {
        duplicateQuery["metadata.trigger"] = metadata.trigger;
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
      type: "event",
      eventId,
      taskId: null,
      relatedUserId,
      metadata,
      isRead: false,
    });
  } catch (error) {
    console.error("CREATE EVENT NOTIFICATION ERROR:", error);
  }
};

const notifyMembers = async ({
  memberIds,
  title,
  message,
  eventId,
  relatedUserId = null,
  metadata = {},
  preventDuplicate = false,
}) => {
  if (!Array.isArray(memberIds) || memberIds.length === 0) return;

  for (const memberId of memberIds) {
    await createEventNotification({
      userId: memberId,
      title,
      message,
      eventId,
      relatedUserId,
      metadata,
      preventDuplicate,
    });
  }
};

const autoCompletePastEventsAndNotify = async () => {
  const eventsToComplete = await Event.find({
    date: { $lt: new Date() },
    status: { $in: ["upcoming", "active"] },
  }).populate("societyId", "name");

  for (const event of eventsToComplete) {
    event.status = "completed";
    await event.save();

    const memberIds = Array.isArray(event.members)
      ? event.members.map((m) => String(m))
      : [];

    await notifyMembers({
      memberIds,
      title: "Event completed",
      message: `The event "${event.name}" has been moved to completed/past events.`,
      eventId: event._id,
      metadata: {
        trigger: "event_auto_completed",
      },
      preventDuplicate: true,
    });
  }
};

const formatRiskSummary = ({
  riskLevel,
  overdueCritical,
  blockedTasks,
  overloadedMembers,
  alerts,
}) => ({
  riskLevel,
  overdueCritical: overdueCritical.map((task) => ({
    _id: task._id,
    id: task._id.toString(),
    title: task.title,
    impact: task.impact,
    phase: task.phase,
    isOverdue: task.isOverdue,
    assignee: task.assigneeId
      ? {
          _id: task.assigneeId._id,
          id: task.assigneeId._id.toString(),
          name: task.assigneeId.name,
          avatar: task.assigneeId.avatar,
          role: task.assigneeId.role,
        }
      : null,
  })),
  blockedTasks: blockedTasks.map((task) => ({
    _id: task._id,
    id: task._id.toString(),
    title: task.title,
    blockedBy: task.blockedBy || "",
    phase: task.phase,
    assignee: task.assigneeId
      ? {
          _id: task.assigneeId._id,
          id: task.assigneeId._id.toString(),
          name: task.assigneeId.name,
          avatar: task.assigneeId.avatar,
          role: task.assigneeId.role,
        }
      : null,
  })),
  overloadedMembers,
  alerts,
});

const getRiskSummary = async (req, res) => {
  try {
    const eventId = req.params.id;

    const event = await Event.findById(eventId)
      .populate("societyId", "name color icon description category");

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const hasAccess = event.members.some(
      (m) => String(m) === String(req.user._id)
    );

    if (!hasAccess) {
      return res.status(403).json({
        message: "You are not allowed to view risk data for this event",
      });
    }

    const now = new Date();

    const tasks = await Task.find({ eventId })
      .sort({ createdAt: -1 })
      .lean();

    const normalizedTasks = tasks.map((task) => {
      const deadlineDate = new Date(task.deadline);
      const computedOverdue =
        !Number.isNaN(deadlineDate.getTime()) &&
        deadlineDate < now &&
        task.phase !== "completed";

      return {
        ...task,
        isOverdue: task.isOverdue || computedOverdue,
      };
    });

    const memberDirectory = await loadMemberDirectory(
      (event.members || []).map((m) => String(m))
    );

    const overdueCritical = normalizedTasks.filter(
      (task) => task.isOverdue && task.impact === "critical"
    );

    const blockedTasks = normalizedTasks.filter((task) => task.isBlocked);

    const overloadedMembers = event.members
      .map((rawMemberId) => {
        const memberId = String(rawMemberId);
        const member = lookupMember(memberDirectory, memberId);
        const memberTasks = normalizedTasks.filter((task) => {
          const assigneeId = task.assigneeId ? String(task.assigneeId) : "";
          return assigneeId === String(memberId);
        });

        return {
          _id: member._id,
          id: member.id,
          name: member.name,
          avatar: member.avatar,
          role: member.role,
          taskCount: memberTasks.length,
        };
      })
      .filter((member) => member.taskCount > 5);

    const completedCount = normalizedTasks.filter(
      (task) => task.phase === "completed"
    ).length;

    const completionRate =
      normalizedTasks.length > 0
        ? Math.round((completedCount / normalizedTasks.length) * 100)
        : 0;

    const unassignedTasks = normalizedTasks.filter((task) => !task.assigneeId);

    const alerts = [];

    if (overdueCritical.length > 0) {
      alerts.push({
        id: `alert-overdue-critical-${eventId}`,
        title: "Critical overdue tasks detected",
        description: `${overdueCritical.length} critical task(s) are overdue.`,
        severity: overdueCritical.length >= 2 ? "high" : "medium",
        timestamp: new Date().toISOString(),
      });
    }

    if (blockedTasks.length > 0) {
      alerts.push({
        id: `alert-blocked-${eventId}`,
        title: "Blocked tasks detected",
        description: `${blockedTasks.length} task(s) are currently blocked.`,
        severity: blockedTasks.length >= 2 ? "high" : "medium",
        timestamp: new Date().toISOString(),
      });
    }

    if (overloadedMembers.length > 0) {
      alerts.push({
        id: `alert-overloaded-${eventId}`,
        title: "Member overload detected",
        description: `${overloadedMembers.length} team member(s) have too many assigned tasks.`,
        severity: "medium",
        timestamp: new Date().toISOString(),
      });
    }

    if (unassignedTasks.length > 0) {
      alerts.push({
        id: `alert-unassigned-${eventId}`,
        title: "Unassigned tasks found",
        description: `${unassignedTasks.length} task(s) do not have an assignee.`,
        severity: "medium",
        timestamp: new Date().toISOString(),
      });
    }

    const daysUntilEvent = Math.ceil(
      (new Date(event.date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilEvent <= 3 && daysUntilEvent >= 0 && completionRate < 60) {
      alerts.push({
        id: `alert-deadline-close-${eventId}`,
        title: "Deadline approaching with low completion",
        description: `Event is in ${daysUntilEvent} day(s) but completion is only ${completionRate}%.`,
        severity: "high",
        timestamp: new Date().toISOString(),
      });
    }

    let riskLevel = "Low";

    if (
      overdueCritical.length >= 2 ||
      blockedTasks.length >= 2 ||
      (daysUntilEvent <= 3 && daysUntilEvent >= 0 && completionRate < 60)
    ) {
      riskLevel = "High";
    } else if (
      overdueCritical.length >= 1 ||
      blockedTasks.length >= 1 ||
      overloadedMembers.length >= 1 ||
      unassignedTasks.length >= 1
    ) {
      riskLevel = "Medium";
    }

    res.json(
      formatRiskSummary({
        riskLevel,
        overdueCritical,
        blockedTasks,
        overloadedMembers,
        alerts,
      })
    );
  } catch (error) {
    console.error("GET RISK SUMMARY ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

const getPerformanceSummary = async (req, res) => {
  try {
    const eventId = req.params.id;

    const event = await Event.findById(eventId)
      .populate("societyId", "name color icon description category");

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const hasAccess = event.members.some(
      (m) => String(m) === String(req.user._id)
    );

    if (!hasAccess) {
      return res.status(403).json({
        message: "You are not allowed to view performance data for this event",
      });
    }

    const now = new Date();

    const tasks = await Task.find({ eventId })
      .sort({ createdAt: -1 })
      .lean();

    const normalizedTasks = tasks.map((task) => {
      const deadlineDate = new Date(task.deadline);
      const computedOverdue =
        !Number.isNaN(deadlineDate.getTime()) &&
        deadlineDate < now &&
        task.phase !== "completed";

      return {
        ...task,
        isOverdue: task.isOverdue || computedOverdue,
      };
    });

    const memberDirectory = await loadMemberDirectory(
      (event.members || []).map((m) => String(m))
    );

    const memberStats = event.members
      .map((rawMemberId) => {
        const memberId = String(rawMemberId);
        const member = lookupMember(memberDirectory, memberId);
        const memberTasks = normalizedTasks.filter((task) => {
          const assigneeId = task.assigneeId ? String(task.assigneeId) : "";

          return assigneeId === String(memberId);
        });

        const completed = memberTasks.filter(
          (task) => task.phase === "completed"
        ).length;

        const inProgress = memberTasks.filter(
          (task) => task.phase === "in-progress"
        ).length;

        const overdue = memberTasks.filter((task) => task.isOverdue).length;
        const total = memberTasks.length;

        const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

        const criticalDone = memberTasks.filter(
          (task) =>
            task.impact === "critical" && task.phase === "completed"
        ).length;

        const criticalTotal = memberTasks.filter(
          (task) => task.impact === "critical"
        ).length;

        const onTimeScore =
          total > 0 ? Math.round(((total - overdue) / total) * 100) : 100;

        const criticalScore =
          criticalTotal > 0
            ? Math.round((criticalDone / criticalTotal) * 100)
            : 100;

        const performanceScore = Math.round(
          rate * 0.4 + onTimeScore * 0.3 + criticalScore * 0.3
        );

        return {
          _id: member._id,
          id: member.id,
          name: member.name,
          avatar: member.avatar,
          role: member.role,
          total,
          completed,
          inProgress,
          overdue,
          rate,
          criticalDone,
          criticalTotal,
          onTimeScore,
          performanceScore,
        };
      })
      .sort((a, b) => b.performanceScore - a.performanceScore);

    const chartData = memberStats.map((m) => ({
      name: m.name.split(" ")[0],
      completed: m.completed,
      pending: m.total - m.completed,
      overdue: m.overdue,
    }));

    const topPerformer = memberStats.length > 0 ? memberStats[0] : null;

    const radarData = topPerformer
      ? [
          { metric: "Completion", value: topPerformer.rate },
          { metric: "On-Time", value: topPerformer.onTimeScore },
          {
            metric: "Critical",
            value:
              topPerformer.criticalTotal > 0
                ? Math.round(
                    (topPerformer.criticalDone / topPerformer.criticalTotal) * 100
                  )
                : 100,
          },
          {
            metric: "Volume",
            value: Math.min(100, topPerformer.total * 15),
          },
          {
            metric: "Score",
            value: topPerformer.performanceScore,
          },
        ]
      : [];

    const totals = {
      totalTasks: normalizedTasks.length,
      completedTasks: normalizedTasks.filter((t) => t.phase === "completed").length,
      inProgressTasks: normalizedTasks.filter((t) => t.phase === "in-progress").length,
      overdueTasks: normalizedTasks.filter((t) => t.isOverdue).length,
      blockedTasks: normalizedTasks.filter((t) => t.isBlocked).length,
      criticalTasks: normalizedTasks.filter((t) => t.impact === "critical").length,
      highPriorityTasks: normalizedTasks.filter((t) => t.priority === "high").length,
    };

    res.json({
      event: {
        _id: event._id,
        id: event._id.toString(),
        name: event.name,
        date: event.date,
        status: event.status,
      },
      summary: totals,
      memberStats,
      chartData,
      topPerformer,
      radarData,
    });
  } catch (error) {
    console.error("GET PERFORMANCE SUMMARY ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

const getReadinessStatusFromScore = (score) => {
  if (score >= 75) return { label: "Ready", color: "success" };
  if (score >= 50) return { label: "At Risk", color: "warning" };
  return { label: "Critical", color: "risk" };
};

const getEventReport = async (req, res) => {
  try {
    const eventId = req.params.id;

    const event = await Event.findById(eventId)
      .populate("societyId", "name color icon description category");

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const hasAccess = event.members.some(
      (m) => String(m) === String(req.user._id)
    );

    if (!hasAccess) {
      return res.status(403).json({
        message: "You are not allowed to view this report",
      });
    }

    const now = new Date();

    const tasks = await Task.find({ eventId })
      .sort({ createdAt: -1 })
      .lean();

    const normalizedTasks = tasks.map((task) => {
      const deadlineDate = new Date(task.deadline);
      const computedOverdue =
        !Number.isNaN(deadlineDate.getTime()) &&
        deadlineDate < now &&
        task.phase !== "completed";

      return {
        ...task,
        isOverdue: task.isOverdue || computedOverdue,
      };
    });

    const memberDirectory = await loadMemberDirectory(
      (event.members || []).map((m) => String(m))
    );

    const total = normalizedTasks.length;
    const completed = normalizedTasks.filter((t) => t.phase === "completed").length;
    const inProgress = normalizedTasks.filter((t) => t.phase === "in-progress").length;
    const review = normalizedTasks.filter((t) => t.phase === "review").length;
    const todo = normalizedTasks.filter((t) => t.phase === "todo").length;
    const overdue = normalizedTasks.filter((t) => t.isOverdue).length;
    const blocked = normalizedTasks.filter((t) => t.isBlocked).length;
    const highPriority = normalizedTasks.filter((t) => t.priority === "high").length;
    const critical = normalizedTasks.filter((t) => t.impact === "critical").length;
    const criticalDone = normalizedTasks.filter(
      (t) => t.impact === "critical" && t.phase === "completed"
    ).length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const avgProgress =
      total > 0
        ? Math.round(
            normalizedTasks.reduce((sum, task) => sum + (task.progress || 0), 0) / total
          )
        : 0;

    const readinessScore = Math.round(
      completionRate * 0.45 +
        (critical > 0 ? (criticalDone / critical) * 100 : 100) * 0.3 +
        (total > 0 ? ((total - overdue) / total) * 100 : 100) * 0.15 +
        (blocked === 0 ? 100 : Math.max(0, 100 - blocked * 20)) * 0.1
    );

    const readinessStatus = getReadinessStatusFromScore(readinessScore);

    const phaseData = [
      { name: "To Do", value: todo, fill: "hsl(220, 10%, 46%)" },
      { name: "In Progress", value: inProgress, fill: "hsl(235, 65%, 52%)" },
      { name: "Review", value: review, fill: "hsl(36, 90%, 55%)" },
      { name: "Completed", value: completed, fill: "hsl(152, 60%, 42%)" },
    ].filter((item) => item.value > 0);

    const priorityData = [
      {
        name: "High",
        value: normalizedTasks.filter((t) => t.priority === "high").length,
        fill: "hsl(0, 72%, 55%)",
      },
      {
        name: "Medium",
        value: normalizedTasks.filter((t) => t.priority === "medium").length,
        fill: "hsl(36, 90%, 55%)",
      },
      {
        name: "Low",
        value: normalizedTasks.filter((t) => t.priority === "low").length,
        fill: "hsl(220, 10%, 46%)",
      },
    ].filter((item) => item.value > 0);

    const memberStats = event.members
      .map((rawMemberId) => {
        const memberId = String(rawMemberId);
        const member = lookupMember(memberDirectory, memberId);
        const memberTasks = normalizedTasks.filter((task) => {
          const assigneeId = task.assigneeId ? String(task.assigneeId) : "";
          return assigneeId === String(memberId);
        });

        const done = memberTasks.filter((t) => t.phase === "completed").length;
        const memberTotal = memberTasks.length;
        const rate = memberTotal > 0 ? Math.round((done / memberTotal) * 100) : 0;
        const memberOverdue = memberTasks.filter((t) => t.isOverdue).length;
        const memberAvgProgress =
          memberTotal > 0
            ? Math.round(
                memberTasks.reduce((sum, task) => sum + (task.progress || 0), 0) /
                  memberTotal
              )
            : 0;

        return {
          _id: member._id,
          id: member.id,
          name: member.name,
          avatar: member.avatar,
          role: member.role,
          done,
          total: memberTotal,
          rate,
          overdue: memberOverdue,
          avgProgress: memberAvgProgress,
        };
      })
      .sort((a, b) => b.rate - a.rate || b.done - a.done);

    const memberBarData = memberStats.map((m) => ({
      name: m.name.split(" ")[0],
      completed: m.done,
      pending: m.total - m.done,
    }));

    const riskAlerts = [];

    if (overdue > 0) {
      riskAlerts.push({
        id: `report-overdue-${eventId}`,
        title: "Overdue tasks detected",
        description: `${overdue} task(s) are overdue.`,
        severity: overdue >= 3 ? "high" : "medium",
        timestamp: new Date().toISOString(),
      });
    }

    if (blocked > 0) {
      riskAlerts.push({
        id: `report-blocked-${eventId}`,
        title: "Blocked tasks detected",
        description: `${blocked} task(s) are blocked.`,
        severity: blocked >= 2 ? "high" : "medium",
        timestamp: new Date().toISOString(),
      });
    }

    if (critical > criticalDone) {
      riskAlerts.push({
        id: `report-critical-${eventId}`,
        title: "Critical tasks still pending",
        description: `${critical - criticalDone} critical task(s) are not yet completed.`,
        severity: "high",
        timestamp: new Date().toISOString(),
      });
    }

    res.json({
      event: {
        _id: event._id,
        id: event._id.toString(),
        name: event.name,
        date: event.date,
        status: event.status,
      },
      society: event.societyId
        ? {
            _id: event.societyId._id,
            id: event.societyId._id.toString(),
            name: event.societyId.name,
            color: event.societyId.color,
            icon: event.societyId.icon,
            description: event.societyId.description,
            category: event.societyId.category,
          }
        : null,
      readinessScore,
      readinessStatus,
      analytics: {
        total,
        completed,
        inProgress,
        review,
        todo,
        overdue,
        blocked,
        highPriority,
        critical,
        criticalDone,
        completionRate,
        avgProgress,
        phaseData,
        priorityData,
        memberStats,
        memberBarData,
      },
      riskAlerts,
    });
  } catch (error) {
    console.error("GET EVENT REPORT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

const getLiveSummary = async (req, res) => {
  try {
    const eventId = req.params.id;

    const event = await Event.findById(eventId)
      .populate("societyId", "name color icon description category");

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const hasAccess = event.members.some(
      (m) => String(m) === String(req.user._id)
    );

    if (!hasAccess) {
      return res.status(403).json({
        message: "You are not allowed to view live mode for this event",
      });
    }

    const now = new Date();

    const tasks = await Task.find({ eventId })
      .populate("assigneeId", "name email avatar role")
      .sort({ createdAt: -1 });

    const recentNotifications = await TaskNotification.find({
      eventId,
    })
      .populate("relatedUserId", "name email avatar role")
      .sort({ createdAt: -1 })
      .limit(8);

    const normalizedTasks = tasks.map((task) => {
      const deadlineDate = new Date(task.deadline);
      const computedOverdue =
        !Number.isNaN(deadlineDate.getTime()) &&
        deadlineDate < now &&
        task.phase !== "completed";

      return {
        ...task.toObject(),
        isOverdue: task.isOverdue || computedOverdue,
      };
    });

    const total = normalizedTasks.length;
    const completed = normalizedTasks.filter((t) => t.phase === "completed").length;
    const inProgress = normalizedTasks.filter((t) => t.phase === "in-progress").length;
    const blocked = normalizedTasks.filter((t) => t.isBlocked).length;
    const overdue = normalizedTasks.filter((t) => t.isOverdue).length;
    const criticalPending = normalizedTasks.filter(
      (t) => t.impact === "critical" && t.phase !== "completed"
    ).length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const readinessScore = Math.round(
      completionRate * 0.5 +
        (total > 0 ? ((total - overdue) / total) * 100 : 100) * 0.2 +
        (blocked === 0 ? 100 : Math.max(0, 100 - blocked * 20)) * 0.15 +
        (criticalPending === 0 ? 100 : Math.max(0, 100 - criticalPending * 20)) *
          0.15
    );

    let status = "monitoring";
    if (event.status === "completed") {
      status = "completed";
    } else if (blocked > 0 || overdue > 0 || criticalPending > 0) {
      status = "attention";
    } else if (event.status === "active") {
      status = "live";
    }

    const urgentIssues = [
      ...normalizedTasks
        .filter((t) => t.isBlocked)
        .map((t) => ({
          id: `blocked-${t._id}`,
          type: "blocked",
          title: t.title,
          description: t.blockedBy || "Task is blocked",
          severity: "high",
        })),
      ...normalizedTasks
        .filter((t) => t.isOverdue)
        .map((t) => ({
          id: `overdue-${t._id}`,
          type: "overdue",
          title: t.title,
          description: "Task deadline has passed",
          severity: "high",
        })),
      ...normalizedTasks
        .filter((t) => t.impact === "critical" && t.phase !== "completed")
        .map((t) => ({
          id: `critical-${t._id}`,
          type: "critical",
          title: t.title,
          description: "Critical task still pending",
          severity: "medium",
        })),
    ].slice(0, 10);

    const memberStatus = event.members.map((rawMemberId) => {
        const memberId = String(rawMemberId);
        const member = lookupMember(memberDirectory, memberId);
      const memberTasks = normalizedTasks.filter((task) => {
        const assigneeId = task.assigneeId ? String(task.assigneeId) : "";

        return assigneeId === String(memberId);
      });

      return {
        _id: member._id,
        id: member.id,
        name: member.name,
        avatar: member.avatar,
        role: member.role,
        assignedTasks: memberTasks.length,
        completedTasks: memberTasks.filter((t) => t.phase === "completed").length,
        overdueTasks: memberTasks.filter((t) => t.isOverdue).length,
      };
    });

    const liveNotifications = recentNotifications.map((n) => ({
      _id: n._id,
      id: n._id.toString(),
      title: n.title,
      message: n.message,
      type: n.type,
      isRead: n.isRead,
      createdAt: n.createdAt,
      relatedUser: n.relatedUserId
        ? {
            _id: n.relatedUserId._id,
            id: n.relatedUserId._id.toString(),
            name: n.relatedUserId.name,
            avatar: n.relatedUserId.avatar,
            role: n.relatedUserId.role,
          }
        : null,
    }));

    res.json({
      event: {
        _id: event._id,
        id: event._id.toString(),
        name: event.name,
        date: event.date,
        status: event.status,
      },
      society: event.societyId
        ? {
            _id: event.societyId._id,
            id: event.societyId._id.toString(),
            name: event.societyId.name,
            color: event.societyId.color,
            icon: event.societyId.icon,
          }
        : null,
      live: {
        status,
        readinessScore,
        completionRate,
        totalTasks: total,
        completedTasks: completed,
        inProgressTasks: inProgress,
        blockedTasks: blocked,
        overdueTasks: overdue,
        criticalPending,
      },
      urgentIssues,
      memberStatus,
      notifications: liveNotifications,
    });
  } catch (error) {
    console.error("GET LIVE SUMMARY ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

const getDashboardSummary = async (req, res) => {
  try {
    const eventId = req.params.id;

    const event = await Event.findById(eventId)
      .populate("societyId", "name color icon description category");

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const hasAccess = event.members.some(
      (m) => String(m) === String(req.user._id)
    );

    if (!hasAccess) {
      return res.status(403).json({
        message: "You are not allowed to view dashboard data for this event",
      });
    }

    const now = new Date();

    const tasks = await Task.find({ eventId })
      .sort({ createdAt: -1 })
      .lean();

    const normalizedTasks = tasks.map((task) => {
      const deadlineDate = new Date(task.deadline);
      const computedOverdue =
        !Number.isNaN(deadlineDate.getTime()) &&
        deadlineDate < now &&
        task.phase !== "completed";

      return {
        ...task,
        isOverdue: task.isOverdue || computedOverdue,
      };
    });

    const memberDirectory = await loadMemberDirectory(
      (event.members || []).map((m) => String(m))
    );

    const totalTasks = normalizedTasks.length;
    const completedTasks = normalizedTasks.filter(
      (t) => t.phase === "completed"
    ).length;
    const inProgressTasks = normalizedTasks.filter(
      (t) => t.phase === "in-progress"
    ).length;
    const reviewTasks = normalizedTasks.filter((t) => t.phase === "review").length;
    const todoTasks = normalizedTasks.filter((t) => t.phase === "todo").length;
    const overdueTasks = normalizedTasks.filter((t) => t.isOverdue).length;
    const blockedTasks = normalizedTasks.filter((t) => t.isBlocked).length;
    const highPriorityTasks = normalizedTasks.filter(
      (t) => t.priority === "high"
    ).length;
    const criticalTasks = normalizedTasks.filter(
      (t) => t.impact === "critical"
    ).length;
    const completedCriticalTasks = normalizedTasks.filter(
      (t) => t.impact === "critical" && t.phase === "completed"
    ).length;

    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const readinessScore = Math.round(
      completionRate * 0.45 +
        (criticalTasks > 0
          ? (completedCriticalTasks / criticalTasks) * 100
          : 100) *
          0.25 +
        (totalTasks > 0 ? ((totalTasks - overdueTasks) / totalTasks) * 100 : 100) *
          0.15 +
        (blockedTasks === 0 ? 100 : Math.max(0, 100 - blockedTasks * 20)) * 0.15
    );

    const trendChart = [
      { name: "To Do", value: todoTasks },
      { name: "In Progress", value: inProgressTasks },
      { name: "Review", value: reviewTasks },
      { name: "Completed", value: completedTasks },
    ];

    const workloadDistribution = event.members.map((rawMemberId) => {
        const memberId = String(rawMemberId);
        const member = lookupMember(memberDirectory, memberId);
      const memberTasks = normalizedTasks.filter((task) => {
        const assigneeId = task.assigneeId ? String(task.assigneeId) : "";

        return assigneeId === String(memberId);
      });

      return {
        _id: member._id,
        id: member.id,
        name: member.name,
        avatar: member.avatar,
        role: member.role,
        total: memberTasks.length,
        completed: memberTasks.filter((t) => t.phase === "completed").length,
        overdue: memberTasks.filter((t) => t.isOverdue).length,
      };
    });

    const riskAlerts = [];

    if (overdueTasks > 0) {
      riskAlerts.push({
        id: `dashboard-overdue-${eventId}`,
        title: "Overdue tasks detected",
        description: `${overdueTasks} task(s) are overdue.`,
        severity: overdueTasks >= 3 ? "high" : "medium",
      });
    }

    if (blockedTasks > 0) {
      riskAlerts.push({
        id: `dashboard-blocked-${eventId}`,
        title: "Blocked tasks detected",
        description: `${blockedTasks} task(s) are blocked.`,
        severity: blockedTasks >= 2 ? "high" : "medium",
      });
    }

    const daysUntilEvent = Math.ceil(
      (new Date(event.date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    const countdown = {
      days: Math.max(daysUntilEvent, 0),
      isPast: daysUntilEvent < 0,
    };

    res.json({
      event: {
        _id: event._id,
        id: event._id.toString(),
        name: event.name,
        date: event.date,
        status: event.status,
      },
      society: event.societyId
        ? {
            _id: event.societyId._id,
            id: event.societyId._id.toString(),
            name: event.societyId.name,
            color: event.societyId.color,
            icon: event.societyId.icon,
          }
        : null,
      summary: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        reviewTasks,
        todoTasks,
        overdueTasks,
        blockedTasks,
        highPriorityTasks,
        criticalTasks,
        completionRate,
        readinessScore,
      },
      countdown,
      trendChart,
      workloadDistribution,
      riskAlerts,
    });
  } catch (error) {
    console.error("GET DASHBOARD SUMMARY ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};


const getEvents = async (req, res) => {
  try {
    await autoCompletePastEventsAndNotify();

    const userCommunities = await Community.find({
      members: req.user._id,
    }).select("_id");

    const allowedSocietyIds = userCommunities.map((c) => c._id);

    const events = await Event.find({
      societyId: { $in: allowedSocietyIds },
    })
      .populate("societyId", "name color icon description category")
      .sort({ date: 1 })
      .lean();

    const allMemberIds = [
      ...new Set(events.flatMap(collectEventMemberIds)),
    ];
    const directory = await loadMemberDirectory(allMemberIds);
    const formatEvent = buildEventFormatter(directory);

    res.json(events.map(formatEvent));
  } catch (error) {
    console.error("getEvents error:", error.stack || error);
    res.status(500).json({ message: error.message });
  }
};

const createEvent = async (req, res) => {
  try {
    const {
      name,
      date,
      status,
      members,
      memberRoles,
      societyId,
      eventType,
      files,
    } = req.body;

    if (!name || !societyId || !eventType || !date) {
      return res.status(400).json({
        message: "Name, date, societyId, and eventType are required",
      });
    }

    const trimmedName = String(name).trim();

    if (trimmedName.length < 3) {
      return res.status(400).json({
        message: "Event name must be at least 3 characters",
      });
    }

    if (trimmedName.length > 100) {
      return res.status(400).json({
        message: "Event name must be less than 100 characters",
      });
    }

    const validEventTypes = ["sports", "seminar", "concert", "social", "community", "exhibition", "workshop"];
    if (!validEventTypes.includes(eventType)) {
      return res.status(400).json({
        message: "Invalid event type. Must be one of: " + validEventTypes.join(", "),
      });
    }

    const validStatuses = ["upcoming", "active", "completed"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Must be one of: " + validStatuses.join(", "),
      });
    }

    if (!isValidDateValue(date)) {
      return res.status(400).json({
        message: "Invalid event date",
      });
    }

    const creatorId = req.user._id.toString();

    const community = await Community.findById(societyId);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    const isMember = community.members.some(
      (memberId) => memberId.toString() === creatorId
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not allowed to create events for this society",
      });
    }

    const safeMembers = normalizeMemberIds(members, creatorId);
    const safeMemberRoles = normalizeMemberRoles(memberRoles, creatorId);

    const event = new Event({
      name: String(name).trim(),
      date: new Date(date),
      status: status || "upcoming",
      members: safeMembers,
      memberRoles: safeMemberRoles,
      societyId,
      eventType,
      files: Array.isArray(files) ? files : [],
    });

    const saved = await event.save();

    const populated = await Event.findById(saved._id)
      .populate("societyId", "name color icon description category")
      ;

    await notifyMembers({
      memberIds: safeMembers,
      title: "New event created",
      message: `A new event "${populated.name}" has been created.`,
      eventId: populated._id,
      relatedUserId: req.user?._id || null,
      metadata: {
        trigger: "event_created",
      },
      preventDuplicate: true,
    });

    res.status(201).json(await formatEventAsync(populated));
  } catch (error) {
    console.error("createEvent error:", error.stack || error);
    res.status(500).json({ message: error.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const {
      name,
      date,
      status,
      members,
      memberRoles,
      societyId,
      eventType,
      files,
    } = req.body;

    const existingEvent = await Event.findById(req.params.id);

    if (!existingEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    const creatorId = req.user._id.toString();

    const community = await Community.findById(
      societyId || existingEvent.societyId
    );

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    const isMember = community.members.some(
      (memberId) => memberId.toString() === creatorId
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not allowed to update events for this society",
      });
    }

    if (date && !isValidDateValue(date)) {
      return res.status(400).json({
        message: "Invalid event date",
      });
    }

    if (name !== undefined && name !== null) {
      const trimmedName = String(name).trim();
      if (!trimmedName) {
        return res.status(400).json({ message: "Event name cannot be empty" });
      }
      if (trimmedName.length < 3) {
        return res.status(400).json({ message: "Event name must be at least 3 characters" });
      }
      if (trimmedName.length > 100) {
        return res.status(400).json({ message: "Event name must be less than 100 characters" });
      }
    }

    const validEventTypes = ["sports", "seminar", "concert", "social", "community", "exhibition", "workshop"];
    if (eventType && !validEventTypes.includes(eventType)) {
      return res.status(400).json({
        message: "Invalid event type. Must be one of: " + validEventTypes.join(", "),
      });
    }

    const validStatuses = ["upcoming", "active", "completed"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Must be one of: " + validStatuses.join(", "),
      });
    }

    const safeMembers = Array.isArray(members)
      ? normalizeMemberIds(members, creatorId)
      : existingEvent.members.map((m) => m.toString());

    const safeMemberRoles =
      Array.isArray(memberRoles) && memberRoles.length > 0
        ? normalizeMemberRoles(memberRoles, creatorId)
        : existingEvent.memberRoles.map((mr) => ({
            memberId: mr.memberId.toString(),
            role: mr.role,
          }));

    existingEvent.name = name ? String(name).trim() : existingEvent.name;
    existingEvent.date = date ? new Date(date) : existingEvent.date;
    existingEvent.status = status || existingEvent.status;
    existingEvent.societyId = societyId || existingEvent.societyId;
    existingEvent.eventType = eventType || existingEvent.eventType;
    existingEvent.members = safeMembers;
    existingEvent.memberRoles = safeMemberRoles;
    existingEvent.files = Array.isArray(files) ? files : existingEvent.files;

    const updated = await existingEvent.save();

    const populated = await Event.findById(updated._id)
      .populate("societyId", "name color icon description category")
      ;

    await notifyMembers({
      memberIds: safeMembers,
      title: "Event updated",
      message: `The event "${populated.name}" has been updated.`,
      eventId: populated._id,
      relatedUserId: req.user?._id || null,
      metadata: {
        trigger: "event_updated",
      },
      preventDuplicate: false,
    });

    res.json(await formatEventAsync(populated));
  } catch (error) {
    console.error("updateEvent error:", error.stack || error);
    res.status(500).json({ message: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const existingEvent = await Event.findById(req.params.id);

    if (!existingEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    const creatorId = req.user._id.toString();

    const community = await Community.findById(existingEvent.societyId);

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    const isMember = community.members.some(
      (memberId) => memberId.toString() === creatorId
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not allowed to delete this event",
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getRiskSummary,
  getPerformanceSummary,
  getEventReport,
  getLiveSummary,
  getDashboardSummary,
};