import API from "@/lib/api";

export const getEventReport = async (eventId) => {
  const res = await API.get(`/g-events/${eventId}/report`);
  return res.data;
};