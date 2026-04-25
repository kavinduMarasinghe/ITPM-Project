const ChatMessage = require("../models/G_ChatMessage");
const Event = require("../models/G_Event");
const Community = require("../models/G_Community");
const TaskNotification = require("../models/G_TaskNotification");

const formatChatMessage = (msg) => ({
  _id: msg._id,
  id: msg._id.toString(),
  eventId: msg.eventId?._id
    ? msg.eventId._id.toString()
    : msg.eventId?.toString() || null,
  communityId: msg.communityId?._id
    ? msg.communityId._id.toString()
    : msg.communityId?.toString() || null,
  chatScope: msg.chatScope,
  message: msg.message,
  senderId: msg.senderId?._id
    ? msg.senderId._id.toString()
    : msg.senderId?.toString() || null,
  sender: msg.senderId?._id
    ? {
        _id: msg.senderId._id,
        id: msg.senderId._id.toString(),
        name: msg.senderId.name,
        email: msg.senderId.email,
        avatar: msg.senderId.avatar,
        role: msg.senderId.role,
      }
    : null,
  file: msg.file || null,
  createdAt: msg.createdAt,
  updatedAt: msg.updatedAt,
});

const createChatNotification = async ({
  userId,
  title,
  message,
  eventId = null,
  relatedUserId = null,
  metadata = {},
  preventDuplicate = false,
}) => {
  if (!userId || !title || !message) return;

  try {
    if (preventDuplicate) {
      const duplicateQuery = {
        userId,
        type: "chat",
        eventId: eventId || null,
      };

      if (metadata?.trigger) {
        duplicateQuery["metadata.trigger"] = metadata.trigger;
      }

      if (metadata?.chatMessageId) {
        duplicateQuery["metadata.chatMessageId"] = metadata.chatMessageId;
      }

      const existing = await TaskNotification.findOne(duplicateQuery);
      if (existing) return existing;
    }

    return await TaskNotification.create({
      userId,
      title,
      message,
      type: "chat",
      eventId,
      taskId: null,
      relatedUserId,
      metadata,
      isRead: false,
    });
  } catch (error) {
    console.error("CREATE CHAT NOTIFICATION ERROR:", error);
  }
};

const getEventMessages = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const hasAccess = event.members.some(
      (memberId) => memberId.toString() === req.user._id.toString()
    );

    if (!hasAccess) {
      return res.status(403).json({ message: "You are not allowed to view this chat" });
    }

    const messages = await ChatMessage.find({
      eventId,
      chatScope: "event",
    })
      .populate("senderId", "name email avatar role")
      .populate("eventId", "name date status")
      .sort({ createdAt: 1 });

    res.json(messages.map(formatChatMessage));
  } catch (error) {
    console.error("GET EVENT CHAT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

const getCommunityMessages = async (req, res) => {
  try {
    const { communityId } = req.params;

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    const hasAccess = community.members.some(
      (memberId) => memberId.toString() === req.user._id.toString()
    );

    if (!hasAccess) {
      return res.status(403).json({ message: "You are not allowed to view this chat" });
    }

    const messages = await ChatMessage.find({
      communityId,
      chatScope: "community",
    })
      .populate("senderId", "name email avatar role")
      .populate("communityId", "name color icon")
      .sort({ createdAt: 1 });

    res.json(messages.map(formatChatMessage));
  } catch (error) {
    console.error("GET COMMUNITY CHAT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { eventId, communityId, message, chatScope, file } = req.body;

    if (!chatScope || !["event", "community"].includes(chatScope)) {
      return res.status(400).json({ message: "Valid chatScope is required" });
    }

    const hasMessage = typeof message === "string" && message.trim().length > 0;
    const hasFile = file && typeof file === "object" && file.name;

    if (!hasMessage && !hasFile) {
      return res.status(400).json({ message: "Message or file is required" });
    }

    let targetMembers = [];
    let targetEventId = null;
    let targetName = "chat";

    if (chatScope === "event") {
      if (!eventId) {
        return res.status(400).json({ message: "eventId is required for event chat" });
      }

      const event = await Event.findById(eventId).populate("members", "_id name");
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      const hasAccess = event.members.some(
        (member) => member._id.toString() === req.user._id.toString()
      );

      if (!hasAccess) {
        return res.status(403).json({ message: "You are not allowed to send messages to this chat" });
      }

      targetMembers = event.members.map((member) => member._id.toString());
      targetEventId = event._id;
      targetName = event.name;
    }

    if (chatScope === "community") {
      if (!communityId) {
        return res.status(400).json({ message: "communityId is required for community chat" });
      }

      const community = await Community.findById(communityId).populate("members", "_id name");
      if (!community) {
        return res.status(404).json({ message: "Community not found" });
      }

      const hasAccess = community.members.some(
        (member) => member._id.toString() === req.user._id.toString()
      );

      if (!hasAccess) {
        return res.status(403).json({ message: "You are not allowed to send messages to this chat" });
      }

      targetMembers = community.members.map((member) => member._id.toString());
      targetName = community.name;
    }

    const chatMessage = new ChatMessage({
      eventId: chatScope === "event" ? eventId : null,
      communityId: chatScope === "community" ? communityId : null,
      senderId: req.user._id,
      message: hasMessage ? message.trim() : "",
      chatScope,
      file: hasFile
        ? {
            name: file.name || "",
            type: file.type || "",
            size: file.size || "",
            url: file.url || "",
          }
        : {
            name: "",
            type: "",
            size: "",
            url: "",
          },
    });

    const saved = await chatMessage.save();

    const populated = await ChatMessage.findById(saved._id)
      .populate("senderId", "name email avatar role")
      .populate("eventId", "name date status")
      .populate("communityId", "name color icon");

    const recipients = targetMembers.filter(
      (memberId) => memberId !== req.user._id.toString()
    );

    for (const memberId of recipients) {
      await createChatNotification({
        userId: memberId,
        title: "New chat message",
        message: `${req.user.name} sent a message in ${targetName}.`,
        eventId: targetEventId,
        relatedUserId: req.user._id,
        metadata: {
          trigger: "chat_message",
          chatMessageId: saved._id.toString(),
          chatScope,
          communityId: communityId || null,
        },
        preventDuplicate: true,
      });
    }

    res.status(201).json(formatChatMessage(populated));
  } catch (error) {
    console.error("SEND CHAT MESSAGE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getEventMessages,
  getCommunityMessages,
  sendMessage,
};