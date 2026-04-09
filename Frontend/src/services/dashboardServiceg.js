import API from "@/lib/api";

export const getDashboardSummary = async (eventId) => {
  const res = await API.get(`/events/${eventId}/dashboard`);
  return res.data;
};