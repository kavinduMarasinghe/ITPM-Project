import API from "@/lib/api";

export const getEventMessages = async (eventId) => {
  const res = await API.get(`/chat/event/${eventId}`);
  return res.data;
};

export const getCommunityMessages = async (communityId) => {
  const res = await API.get(`/chat/community/${communityId}`);
  return res.data;
};

export const sendChatMessage = async (payload) => {
  const res = await API.post("/chat", payload);
  return res.data;
};