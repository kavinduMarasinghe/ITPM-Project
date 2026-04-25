const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const Community = require("./models/Community");
const Event = require("./models/Event");
const Task = require("./models/Task");

dotenv.config();

connectDB();

const communities = [
  {
    id: "soc-1",
    name: "Sports Club",
    color: "#10b981",
    icon: "🏆",
    description: "Promoting athletics, fitness, and competitive sports across the university campus.",
    category: "sports",
    memberIds: ["1", "2", "4", "6"],
  },
  {
    id: "soc-2",
    name: "Student Interaction Society",
    color: "#6366f1",
    icon: "💻",
    description: "Fostering connections between students through social events, meetups, and collaborative activities.",
    category: "community",
    memberIds: ["1", "3", "5"],
  },
];

const events = [
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
  {
    id: "2",
    name: "Annual Get Together",
    date: new Date("2026-04-20T10:00:00"),
    status: "upcoming",
    members: ["1", "3", "5"],
    memberRoles: [
      { memberId: "1", role: "event-lead" },
      { memberId: "3", role: "coordinator" },
      { memberId: "5", role: "team-member" },
    ],
    societyId: "soc-2",
    eventType: "social",
    files: [],
  },
];

const tasks = [
  {
    id: "1",
    title: "Reserve sports grounds",
    description: "Book the main field, basketball courts, and indoor gym for Sports Day.",
    phase: "completed",
    priority: "high",
    impact: "critical",
    assignee: {
      id: "1",
      name: "Sarah Chen",
      avatar: "#6366f1",
      role: "Project Lead",
      taskCount: 8,
      completedCount: 5,
    },
    deadline: "2026-03-10",
    progress: 100,
    isOverdue: false,
    isBlocked: false,
    comments: 3,
    attachments: 1,
    commentList: [],
    activityLog: [],
    eventId: "1",
  },
  {
    id: "2",
    title: "Arrange referee panel",
    description: "Confirm referees for all matches and track events.",
    phase: "in-progress",
    priority: "high",
    impact: "critical",
    assignee: {
      id: "4",
      name: "James Wilson",
      avatar: "#10b981",
      role: "Tech Lead",
      taskCount: 10,
      completedCount: 8,
    },
    deadline: "2026-03-20",
    progress: 60,
    isOverdue: false,
    isBlocked: false,
    comments: 2,
    attachments: 0,
    commentList: [],
    activityLog: [],
    eventId: "1",
  },
];

const importData = async () => {
  try {
    await Community.deleteMany();
    await Event.deleteMany();
    await Task.deleteMany();

    await Community.insertMany(communities);
    await Event.insertMany(events);
    await Task.insertMany(tasks);

    console.log("Data seeded successfully");
    process.exit();
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

importData();