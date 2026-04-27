import API from "@/lib/api";

export const getPerformanceSummary = async (eventId) => {
  const res = await API.get(`/g-events/${eventId}/performance`);
  return res.data;
};