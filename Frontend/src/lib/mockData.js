export const memberRoleLabels = {
  "event-lead": "Event Lead",
  organizer: "Organizer",
  coordinator: "Coordinator",
  "team-member": "Team Member",
  volunteer: "Volunteer",
};

export const memberRoleColors = {
  "event-lead": "bg-risk/10 text-risk border-risk/20",
  organizer: "bg-primary/10 text-primary border-primary/20",
  coordinator: "bg-accent/10 text-accent border-accent/20",
  "team-member": "bg-success/10 text-success border-success/20",
  volunteer: "bg-warning/10 text-warning border-warning/20",
};

export const memberRolePermissions = {
  "event-lead": ["create-event", "manage-team", "assign-tasks", "manage-tasks", "comment", "chat", "view"],
  organizer: ["manage-team", "assign-tasks", "manage-tasks", "comment", "chat", "view"],
  coordinator: ["manage-tasks", "assign-tasks", "comment", "chat", "view"],
  "team-member": ["update-assigned", "comment", "chat", "view"],
  volunteer: ["update-assigned", "view"],
};

export const societyCategoryLabels = {
  sports: "Sports & Athletics",
  technology: "Technology",
  cultural: "Cultural & Arts",
  community: "Community Service",
  music: "Music & Entertainment",
  academic: "Academic",
  other: "Other",
};

// --- Societies ---
export const societies = [
  { id: "soc-1", name: "Sports Club", color: "#10b981", icon: "🏆", description: "Promoting athletics, fitness, and competitive sports across the university campus.", category: "sports", memberIds: ["1", "2", "4", "6"] },
  { id: "soc-2", name: "Student Interaction Society", color: "#6366f1", icon: "💻", description: "Fostering connections between students through social events, meetups, and collaborative activities.", category: "community", memberIds: ["1", "3", "5"] },
  { id: "soc-3", name: "Cultural Committee", color: "#f59e0b", icon: "🎭", description: "Celebrating diversity through cultural performances, art exhibitions, and heritage events.", category: "cultural", memberIds: ["1", "3", "5", "6"] },
  { id: "soc-4", name: "IEEE Student Branch", color: "#8b5cf6", icon: "🔬", description: "Advancing technology awareness through workshops, hackathons, and innovation showcases.", category: "technology", memberIds: ["4", "5", "6"] },
  { id: "soc-5", name: "Rotaract Club", color: "#ef4444", icon: "🤝", description: "Community service and leadership development through volunteer projects and outreach programs.", category: "community", memberIds: ["2", "3", "6"] },
  { id: "soc-6", name: "Music Society", color: "#06b6d4", icon: "🎵", description: "Bringing together musicians and music lovers for concerts, jam sessions, and music production workshops.", category: "music", memberIds: ["1", "2", "5"] },
];

// --- Current logged-in user ---
export const currentUser = {
  id: "1",
  name: "Sarah Chen",
  avatar: "#6366f1",
  role: "Project Lead",
  societyIds: ["soc-1", "soc-2", "soc-3", "soc-5", "soc-6"],
};

const avatarColors = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"];

export const teamMembers = [
  { id: "1", name: "Sarah Chen", avatar: avatarColors[0], role: "Project Lead", taskCount: 8, completedCount: 5 },
  { id: "2", name: "Marcus Johnson", avatar: avatarColors[1], role: "Logistics", taskCount: 12, completedCount: 7 },
  { id: "3", name: "Aisha Patel", avatar: avatarColors[2], role: "Design", taskCount: 6, completedCount: 4 },
  { id: "4", name: "James Wilson", avatar: avatarColors[3], role: "Tech Lead", taskCount: 10, completedCount: 8 },
  { id: "5", name: "Emily Rodriguez", avatar: avatarColors[4], role: "Marketing", taskCount: 14, completedCount: 6 },
  { id: "6", name: "David Kim", avatar: avatarColors[5], role: "Volunteer Coord", taskCount: 9, completedCount: 3 },
];

// --- Events ---
export const events = [
  {
    id: "1",
    name: "Sports Day 2026",
    date: new Date("2026-03-28T09:00:00"),
    status: "active",
    members: ["1", "2", "4", "6"],
    memberRoles: [
      { memberId: "1", role: "event-lead" },
      { memberId: "2", role: "coordinator" },
      { memberId: "4", role: "team-member" },
      { memberId: "6", role: "volunteer" },
    ],
    societyId: "soc-1",
    eventType: "sports",
    files: [],
  },
];

// --- Helper ---
function makeActivity(title) {
  return [
    {
      id: "1",
      user: "System",
      action: `Task "${title}" created`,
      time: "Feb 20, 2026",
    },
  ];
}

// --- Tasks ---
export const tasks = [
  {
    id: "1",
    title: "Reserve sports grounds",
    description: "Book the main field, basketball courts, and indoor gym.",
    phase: "completed",
    priority: "high",
    impact: "critical",
    assignee: teamMembers[0],
    deadline: "2026-03-10",
    progress: 100,
    isOverdue: false,
    isBlocked: false,
    comments: 3,
    attachments: 1,
    commentList: [],
    activityLog: makeActivity("Reserve sports grounds"),
    eventId: "1",
  },
];

// --- Activity ---
export const recentActivity = [
  {
    id: "1",
    user: "Sarah Chen",
    action: "completed",
    target: "Reserve sports grounds",
    timestamp: "2 hours ago",
  },
];

// --- Notifications ---
export const notifications = [
  {
    id: "1",
    type: "deadline",
    title: "Referee panel confirmation due soon",
    description: "Deadline is Mar 20",
    timestamp: "2 hours ago",
    read: false,
  },
];

// --- Risk Alerts ---
export const riskAlerts = [
  {
    id: "1",
    title: "Certificates blocked",
    severity: "medium",
    description: "Participant list not finalized",
    timestamp: "2 hours ago",
  },
];

// --- Event Info ---
export const eventDate = new Date("2026-03-28T09:00:00");
export const eventName = "Sports Day 2026";

// --- Readiness ---
export const getReadinessScore = (eventTasks) => {
  const t = eventTasks && eventTasks.length > 0 ? eventTasks : tasks;
  if (t.length === 0) return 0;

  const weightedProgress = t.reduce((sum, task) => {
    const weight =
      task.impact === "critical"
        ? 3
        : task.impact === "important"
        ? 2
        : 1;
    return sum + (task.progress / 100) * weight;
  }, 0);

  const totalWeight = t.reduce((sum, task) => {
    return sum +
      (task.impact === "critical"
        ? 3
        : task.impact === "important"
        ? 2
        : 1);
  }, 0);

  return Math.round((weightedProgress / totalWeight) * 100);
};

export const getReadinessStatus = (score) => {
  if (score >= 70) return { label: "On Track", color: "success" };
  if (score >= 40) return { label: "At Risk", color: "warning" };
  return { label: "Critical", color: "risk" };
};