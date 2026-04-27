import API from "@/lib/api";

export const getTaskNotifications = async () => {
  const res = await API.get("/task-notifications");
  return res.data;
};

export const createTaskNotification = async (payload) => {
  const res = await API.post("/task-notifications", payload);
  return res.data;
};

export const markTaskNotificationRead = async (id) => {
  const res = await API.patch(`/task-notifications/${id}/read`);
  return res.data;
};

export const markAllTaskNotificationsRead = async () => {
  const res = await API.patch("/task-notifications/read-all");
  return res.data;
};

export const deleteTaskNotification = async (id) => {
  const res = await API.delete(`/task-notifications/${id}`);
  return res.data;
};