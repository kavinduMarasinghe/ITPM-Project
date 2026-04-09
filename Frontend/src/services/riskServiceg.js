import API from "@/lib/api";

export const getRiskSummary = async (eventId) => {
  const res = await API.get(`/events/${eventId}/risk-summary`);
  return res.data;
};