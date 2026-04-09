import API from "@/lib/api";

export const getEventReport = async (eventId) => {
  const res = await API.get(`/events/${eventId}/report`);
  return res.data;
};