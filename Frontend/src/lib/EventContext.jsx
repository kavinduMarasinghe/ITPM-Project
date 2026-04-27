import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import API from "./api";
import { useAuth } from "../context/AuthContext";

const EventContext = createContext(null);

const getId = (item) => {
  if (!item) return "";
  if (typeof item === "string") return item;
  return item._id || item.id || "";
};

const normalizeDate = (value) => {
  if (!value) return value;
  return value instanceof Date ? value : new Date(value);
};

const normalizeEvent = (event) => ({
  ...event,
  id: getId(event),
  societyId: getId(event.societyId) || event.societyId,
  date: normalizeDate(event.date),
});

const normalizeTask = (task) => ({
  ...task,
  id: getId(task),
  eventId: getId(task.eventId) || task.eventId,
  assignee: task.assignee || task.assigneeId || null,
  deadline: normalizeDate(task.deadline),
});

const normalizeSociety = (society) => ({
  ...society,
  id: getId(society),
});

export function EventProvider({ children }) {
  const { user: authUser } = useAuth();
  const userId = String(authUser?.id || authUser?._id || "");
  const user = useMemo(
    () => ({
      _id: userId,
      id: userId,
      name: authUser?.name || authUser?.fullName || "",
      avatar: authUser?.avatar || "#6366f1",
      role: authUser?.role,
      email: authUser?.email,
    }),
    [userId, authUser]
  );

  const [allSocieties, setAllSocieties] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [loadingData, setLoadingData] = useState(true);

  const refreshData = useCallback(async () => {

    try {
      setLoadingData(true);

      const [societiesRes, eventsRes, tasksRes] = await Promise.all([
        API.get("/communities"),
        API.get("/g-events"),
        API.get("/tasks"),
      ]);

      const societiesData = Array.isArray(societiesRes.data)
        ? societiesRes.data
        : societiesRes.data?.data || [];

      const eventsData = Array.isArray(eventsRes.data)
        ? eventsRes.data
        : eventsRes.data?.data || [];

      const tasksData = Array.isArray(tasksRes.data)
        ? tasksRes.data
        : tasksRes.data?.data || [];

      setAllSocieties(societiesData.map(normalizeSociety));
      setAllEvents(eventsData.map(normalizeEvent));
      setAllTasks(tasksData.map(normalizeTask));
    } catch (error) {
      console.error("Backend fetch failed:", error?.response?.data || error);
      setAllSocieties([]);
      setAllEvents([]);
      setAllTasks([]);
      setSelectedEventId("");
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      refreshData();
    } else {
      setAllSocieties([]);
      setAllEvents([]);
      setAllTasks([]);
      setSelectedEventId("");
      setLoadingData(false);
    }
  }, [userId, refreshData]);

  const userSocieties = useMemo(() => {
    if (!userId) return [];
    return allSocieties.filter((society) =>
      society.members?.some((member) => getId(member) === userId)
    );
  }, [allSocieties, userId]);

  const userEvents = useMemo(() => {
    if (!userId) return [];
    return allEvents.filter((event) =>
      event.members?.some((member) => getId(member) === userId)
    );
  }, [allEvents, userId]);

  useEffect(() => {
    if (!selectedEventId && userEvents.length > 0) {
      setSelectedEventId(getId(userEvents[0]));
      return;
    }

    if (
      selectedEventId &&
      !userEvents.some((event) => getId(event) === selectedEventId)
    ) {
      setSelectedEventId(userEvents.length > 0 ? getId(userEvents[0]) : "");
    }
  }, [userEvents, selectedEventId]);

  const currentEvent = useMemo(
    () => allEvents.find((event) => getId(event) === selectedEventId),
    [allEvents, selectedEventId]
  );

  const currentSociety = useMemo(() => {
    if (!currentEvent) return undefined;

    const resolvedSocietyId =
      getId(currentEvent.societyId) || currentEvent.societyId;

    return allSocieties.find(
      (society) => getId(society) === resolvedSocietyId
    );
  }, [allSocieties, currentEvent]);

  const eventTasks = useMemo(() => {
    return allTasks.filter(
      (task) =>
        (getId(task.eventId) || task.eventId) === selectedEventId
    );
  }, [allTasks, selectedEventId]);

  const eventMembers = useMemo(() => {
    if (!currentEvent?.members) return [];

    return currentEvent.members.map((member) => {
      const memberId = getId(member);

      const memberTaskList = allTasks.filter((task) => {
        const taskEventId = getId(task.eventId) || task.eventId;

        const taskAssigneeId =
          typeof task.assignee === "string"
            ? task.assignee
            : getId(task.assignee);

        return (
          taskEventId === getId(currentEvent) &&
          taskAssigneeId === memberId
        );
      });

      return {
        id: memberId,
        name: member?.name || "Unnamed member",
        avatar: member?.avatar || "#64748b",
        role: member?.role,
        taskCount: memberTaskList.length,
        completedCount: memberTaskList.filter(
          (task) => task.phase === "completed"
        ).length,
      };
    });
  }, [currentEvent, allTasks]);

  const hasEventAccess = useCallback(
    (eventId) => {
      if (!userId) return false;
      const event = allEvents.find((item) => getId(item) === eventId);
      if (!event) return false;

      return event.members?.some(
        (member) => getId(member) === userId
      );
    },
    [allEvents, userId]
  );

  const getUserEventRole = useCallback(
    (eventId) => {
      if (!userId) return undefined;
      const event = allEvents.find((item) => getId(item) === eventId);
      if (!event) return undefined;

      const matchedRole = event.memberRoles?.find((roleItem) => {
        const memberId =
          getId(roleItem.memberId) ||
          getId(roleItem.member) ||
          getId(roleItem.user);
        return memberId === userId;
      });

      return matchedRole?.role;
    },
    [allEvents, userId]
  );

  const addTask = useCallback(async (taskData) => {
    const now = new Date();

    const payload = {
      title: taskData.title,
      description: taskData.description,
      phase: taskData.phase || "todo",
      priority: taskData.priority,
      impact: taskData.impact,
      assigneeId: taskData.assigneeId,
      deadline: taskData.deadline,
      eventId: taskData.eventId,
      progress: 0,
      isOverdue: false,
      isBlocked: false,
      blockedBy: "",
      comments: 0,
      attachments: 0,
      commentList: [],
      activityLog: [
        {
          user: "System",
          action: `Task "${taskData.title}" created`,
          time: now.toLocaleDateString(),
        },
      ],
    };

    const res = await API.post("/tasks", payload);
    setAllTasks((prev) => [normalizeTask(res.data), ...prev]);
  }, []);

  const updateTask = useCallback(async (id, updates) => {
    const res = await API.put(`/tasks/${id}`, updates);
    const updatedTask = normalizeTask(res.data);

    setAllTasks((prev) =>
      prev.map((task) => (getId(task) === id ? updatedTask : task))
    );
  }, []);

  const moveTask = useCallback(
    async (id, phase) => {
      await updateTask(id, { phase });
    },
    [updateTask]
  );

  const deleteTask = useCallback(async (id) => {
    await API.delete(`/tasks/${id}`);
    setAllTasks((prev) => prev.filter((t) => getId(t) !== id));
  }, []);

  return (
    <EventContext.Provider
      value={{
        selectedEventId,
        setSelectedEventId,
        allTasks,
        eventTasks,
        eventMembers,
        userEvents,
        allEvents,
        allSocieties,
        userSocieties,
        currentSociety,
        currentEvent,
        hasEventAccess,
        getUserEventRole,
        addTask,
        updateTask,
        moveTask,
        deleteTask,
        refreshData,
        loadingData,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEvent() {
  const ctx = useContext(EventContext);
  if (!ctx) throw new Error("useEvent must be used within EventProvider");
  return ctx;
}