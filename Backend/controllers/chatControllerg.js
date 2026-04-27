const ChatMessage = require("../models/G_ChatMessage");
const Event = require("../models/G_Event");
const Community = require("../models/G_Community");
const TaskNotification = require("../models/G_TaskNotification");
const { loadMemberDirectory, lookupMember } = require("../utils/userDirectoryg");

const collectChatSenderIds = (messages) => [
  ...new Set(
    (messages || [])
      .map((m) => (m?.senderId ? String(m.senderId) : ""))
      .filter(Boolean)
  ),
];

const buildChatFormatter = (directory) => (msg) => {
  const senderIdStr = msg?.senderId ? String(msg.senderId) : null;
  const sender = senderIdStr ? lookupMember(directory, senderIdStr) : null;

  return {
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
    senderId: senderIdStr,
    sender,
    file: msg.file || null,
    createdAt: msg.createdAt,
    updatedAt: msg.updatedAt,
  };
};

async function formatChatMessageAsync(msg) {
  const directory = await loadMemberDirectory(
    msg?.senderId ? [String(msg.senderId)] : []
  );
  return buildChatFormatter(directory)(msg);
}

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

    const userId = String(req.user._id);
    const hasAccess = (event.members || []).some(
      (m) => String(m) === userId
    );

    if (!hasAccess) {
      return res.status(403).json({ message: "You are not allowed to view this chat" });
    }

    const messages = await ChatMessage.find({
      eventId,
      chatScope: "event",
    })
      .populate("eventId", "name date status")
      .sort({ createdAt: 1 })
      .lean();

    const directory = await loadMemberDirectory(collectChatSenderIds(messages));
    const formatChatMessage = buildChatFormatter(directory);

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

    const userId = String(req.user._id);
    const hasAccess = (community.members || []).some(
      (m) => String(m) === userId
    );

    if (!hasAccess) {
      return res.status(403).json({ message: "You are not allowed to view this chat" });
    }

    const messages = await ChatMessage.find({
      communityId,
      chatScope: "community",
    })
      .populate("communityId", "name color icon")
      .sort({ createdAt: 1 })
      .lean();

    const directory = await loadMemberDirectory(collectChatSenderIds(messages));
    const formatChatMessage = buildChatFormatter(directory);

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

    const userId = String(req.user._id);

    let targetMembers = [];
    let targetEventId = null;
    let targetName = "chat";

    if (chatScope === "event") {
      if (!eventId) {
        return res.status(400).json({ message: "eventId is required for event chat" });
      }

      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      const hasAccess = (event.members || []).some(
        (m) => String(m) === userId
      );

      if (!hasAccess) {
        return res.status(403).json({ message: "You are not allowed to send messages to this chat" });
      }

      targetMembers = (event.members || []).map((m) => String(m));
      targetEventId = event._id;
      targetName = event.name;
    }

    if (chatScope === "community") {
      if (!communityId) {
        return res.status(400).json({ message: "communityId is required for community chat" });
      }

      const community = await Community.findById(communityId);
      if (!community) {
        return res.status(404).json({ message: "Community not found" });
      }

      const hasAccess = (community.members || []).some(
        (m) => String(m) === userId
      );

      if (!hasAccess) {
        return res.status(403).json({ message: "You are not allowed to send messages to this chat" });
      }

      targetMembers = (community.members || []).map((m) => String(m));
      targetName = community.name;
    }

    const chatMessage = new ChatMessage({
      eventId: chatScope === "event" ? eventId : null,
      communityId: chatScope === "community" ? communityId : null,
      senderId: userId,
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
      .populate("eventId", "name date status")
      .populate("communityId", "name color icon")
      .lean();

    const recipients = targetMembers.filter((memberId) => memberId !== userId);

    for (const memberId of recipients) {
      await createChatNotification({
        userId: memberId,
        title: "New chat message",
        message: `${req.user.name || "A team member"} sent a message in ${targetName}.`,
        eventId: targetEventId,
        relatedUserId: userId,
        metadata: {
          trigger: "chat_message",
          chatMessageId: saved._id.toString(),
          chatScope,
          communityId: communityId || null,
        },
        preventDuplicate: true,
      });
    }

    res.status(201).json(await formatChatMessageAsync(populated));
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
