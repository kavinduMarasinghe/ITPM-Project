import API from "@/lib/api";

export const getLiveSummary = async (eventId) => {
  const res = await API.get(`/g-events/${eventId}/live-summary`);
  return res.data;
};