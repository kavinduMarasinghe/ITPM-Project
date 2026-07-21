import API from "@/lib/api";

export const getDashboardSummary = async (eventId) => {
  const res = await API.get(`/g-events/${eventId}/dashboard`);
  return res.data;
};