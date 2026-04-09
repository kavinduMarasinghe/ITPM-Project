import { useState, useRef, useEffect, useMemo } from "react";
import { useEvent } from "@/lib/EventContext";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import {
  MessageCircle,
  Send,
  X,
  Minimize2,
  Maximize2,
  Users,
  Calendar,
  Paperclip,
  FileText,
  Image,
  Download,
} from "lucide-react";
import {
  getEventMessages,
  getCommunityMessages,
  sendChatMessage,
} from "@/services/chatServiceg";

function getSocietyMemberIds(society) {
  if (!society) return [];

  if (Array.isArray(society.memberIds)) {
    return society.memberIds.filter(Boolean);
  }

  if (Array.isArray(society.members)) {
    return society.members
      .map((member) => {
        if (typeof member === "string") return member;
        return member?.id || member?._id || "";
      })
      .filter(Boolean);
  }

  return [];
}

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatTime(dateValue) {
  if (!dateValue) return "";
  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getFileKind(file) {
  if (!file?.name) return null;

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image";
  if (ext === "pdf") return "pdf";
  return "document";
}

export function EventChat() {
  const { selectedEventId, eventMembers, currentSociety } = useEvent();
  const { user } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState("event");
  const [input, setInput] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [eventChatMessages, setEventChatMessages] = useState([]);
  const [communityChatMessages, setCommunityChatMessages] = useState([]);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const safeEventMembers = Array.isArray(eventMembers) ? eventMembers : [];
  const societyId = currentSociety?.id || currentSociety?._id || "";
  const societyMemberIds = getSocietyMemberIds(currentSociety);

  const communityMembers = useMemo(() => {
    if (!Array.isArray(currentSociety?.members)) return [];

    return currentSociety.members
      .map((member) => {
        if (typeof member === "string") {
          return null;
        }

        return {
          id: member.id || member._id || "",
          name: member.name || "Unknown",
          avatar: member.avatar || "#64748b",
          role: member.role,
        };
      })
      .filter(Boolean);
  }, [currentSociety]);

  const displayMembers =
    activeTab === "event" ? safeEventMembers : communityMembers;

  const currentMessages =
    activeTab === "event" ? eventChatMessages : communityChatMessages;

  const loadEventMessages = async () => {
    if (!selectedEventId) {
      setEventChatMessages([]);
      return;
    }

    try {
      setLoadingMessages(true);
      const data = await getEventMessages(selectedEventId);

      setEventChatMessages((prev) => {
        const newData = Array.isArray(data) ? data : [];

        if (JSON.stringify(prev) === JSON.stringify(newData)) {
          return prev;
        }

        if (!isOpen && newData.length > prev.length) {
          setUnreadCount((count) => count + (newData.length - prev.length));
        }

        return newData;
      });
    } catch (error) {
      console.error("Failed to load event chat messages:", error);
      setEventChatMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const loadCommunityMessages = async () => {
    if (!societyId) {
      setCommunityChatMessages([]);
      return;
    }

    try {
      setLoadingMessages(true);
      const data = await getCommunityMessages(societyId);

      setCommunityChatMessages((prev) => {
        const newData = Array.isArray(data) ? data : [];

        if (JSON.stringify(prev) === JSON.stringify(newData)) {
          return prev;
        }

        if (!isOpen && newData.length > prev.length) {
          setUnreadCount((count) => count + (newData.length - prev.length));
        }

        return newData;
      });
    } catch (error) {
      console.error("Failed to load community chat messages:", error);
      setCommunityChatMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (activeTab === "event") {
      loadEventMessages();
    } else {
      loadCommunityMessages();
    }

    const interval = setInterval(() => {
      if (activeTab === "event") {
        loadEventMessages();
      } else {
        loadCommunityMessages();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [activeTab, selectedEventId, societyId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages.length, isOpen, activeTab]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!user) return;

    const trimmed = input.trim();
    if (!trimmed) return;

    try {
      const savedMessage = await sendChatMessage({
        chatScope: activeTab,
        eventId: activeTab === "event" ? selectedEventId : undefined,
        communityId: activeTab === "community" ? societyId : undefined,
        message: trimmed,
      });

      if (activeTab === "event") {
        setEventChatMessages((prev) => [...prev, savedMessage]);
      } else {
        setCommunityChatMessages((prev) => [...prev, savedMessage]);
      }

      setInput("");
    } catch (error) {
      console.error("Failed to send chat message:", error);
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e) => {
    if (!user) return;

    const file = e.target.files?.[0];
    if (!file) return;

    const sizeKB = file.size / 1024;
    const sizeStr =
      sizeKB > 1024
        ? `${(sizeKB / 1024).toFixed(1)} MB`
        : `${Math.round(sizeKB)} KB`;

    try {
      const savedMessage = await sendChatMessage({
        chatScope: activeTab,
        eventId: activeTab === "event" ? selectedEventId : undefined,
        communityId: activeTab === "community" ? societyId : undefined,
        message: input.trim(),
        file: {
          name: file.name,
          type: file.type,
          size: sizeStr,
          url: "",
        },
      });

      if (activeTab === "event") {
        setEventChatMessages((prev) => [...prev, savedMessage]);
      } else {
        setCommunityChatMessages((prev) => [...prev, savedMessage]);
      }

      setInput("");
      e.target.value = "";
    } catch (error) {
      console.error("Failed to send file message:", error);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full gradient-primary shadow-lg transition-all hover:shadow-xl group"
      >
        <MessageCircle className="h-6 w-6 text-primary-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-risk text-risk-foreground text-[10px] font-bold">
            {unreadCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex w-[380px] flex-col rounded-2xl border border-border bg-card shadow-xl transition-all ${
        isMinimized ? "h-14" : "h-[520px]"
      }`}
    >
      <div
        className="flex cursor-pointer items-center gap-3 rounded-t-2xl border-b border-border px-4 py-3 gradient-primary"
        onClick={() => isMinimized && setIsMinimized(false)}
      >
        <MessageCircle className="h-4 w-4 text-primary-foreground" />

        <div className="flex-1">
          <h4 className="text-sm font-heading font-semibold text-primary-foreground">
            {activeTab === "event" ? "Event Chat" : "Community Chat"}
          </h4>
          <p className="text-[10px] text-primary-foreground/70">
            {activeTab === "event"
              ? `${safeEventMembers.length} members`
              : `${currentSociety?.name ?? "Community"} · ${communityMembers.length} members`}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(!isMinimized);
            }}
            className="rounded p-1 transition-colors hover:bg-primary-foreground/10"
          >
            {isMinimized ? (
              <Maximize2 className="h-3.5 w-3.5 text-primary-foreground" />
            ) : (
              <Minimize2 className="h-3.5 w-3.5 text-primary-foreground" />
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
            className="rounded p-1 transition-colors hover:bg-primary-foreground/10"
          >
            <X className="h-3.5 w-3.5 text-primary-foreground" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab("event")}
              className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
                activeTab === "event"
                  ? "border-b-2 border-primary bg-primary/5 text-primary"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              Event
            </button>

            <button
              onClick={() => setActiveTab("community")}
              className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
                activeTab === "community"
                  ? "border-b-2 border-primary bg-primary/5 text-primary"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              Community
            </button>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto border-b border-border px-4 py-2">
            {displayMembers.slice(0, 6).map((member) => (
              <div
                key={member.id}
                title={member.name}
                className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-primary-foreground"
                style={{ backgroundColor: member.avatar || "#64748b" }}
              >
                {getInitials(member.name)}
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-success" />
              </div>
            ))}
            <span className="ml-1 text-[10px] text-muted-foreground">
              {displayMembers.length} members
            </span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {loadingMessages && (
              <div className="py-6 text-center text-xs text-muted-foreground">
                Loading messages...
              </div>
            )}

            {!loadingMessages && currentMessages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <MessageCircle className="mb-2 h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No messages yet</p>
                <p className="text-[10px] text-muted-foreground/60">
                  {activeTab === "event"
                    ? "Start the event conversation!"
                    : "Say hi to your community!"}
                </p>
              </div>
            )}

            {!loadingMessages &&
              currentMessages.map((msg) => {
                const senderId = msg.sender?._id || msg.sender?.id || msg.senderId || "";
                const isMe = senderId === user?._id || senderId === user?.id;
                const fileKind = getFileKind(msg.file);

                return (
                  <div
                    key={msg.id || msg._id}
                    className={`flex gap-2 ${isMe ? "flex-row-reverse" : ""}`}
                  >
                    {!isMe && (
                      <div
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-primary-foreground"
                        style={{ backgroundColor: msg.sender?.avatar || "#64748b" }}
                      >
                        {getInitials(msg.sender?.name)}
                      </div>
                    )}

                    <div className={`max-w-[75%] ${isMe ? "items-end" : ""}`}>
                      {!isMe && (
                        <p className="mb-0.5 text-[10px] font-semibold text-foreground">
                          {msg.sender?.name || "Unknown"}
                        </p>
                      )}

                      {msg.file?.name && (
                        <div
                          className={`mb-1 rounded-xl border border-border p-2.5 ${
                            isMe ? "bg-primary/5" : "bg-muted/50"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                fileKind === "image"
                                  ? "bg-primary/10 text-primary"
                                  : "bg-warning/10 text-warning"
                              }`}
                            >
                              {fileKind === "image" ? (
                                <Image className="h-4 w-4" />
                              ) : (
                                <FileText className="h-4 w-4" />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[11px] font-medium text-foreground">
                                {msg.file.name}
                              </p>
                              <p className="text-[9px] text-muted-foreground">
                                {msg.file.size || ""}
                              </p>
                            </div>

                            <button className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                              <Download className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          {fileKind === "image" && (
                            <div className="mt-2 flex h-24 items-center justify-center rounded-lg bg-muted">
                              <Image className="h-8 w-8 text-muted-foreground/30" />
                            </div>
                          )}
                        </div>
                      )}

                      {msg.message && (
                        <div
                          className={`rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                            isMe
                              ? "gradient-primary rounded-br-md text-primary-foreground"
                              : "rounded-bl-md bg-muted text-foreground"
                          }`}
                        >
                          {msg.message}
                        </div>
                      )}

                      <p
                        className={`mt-0.5 text-[9px] text-muted-foreground ${
                          isMe ? "text-right" : ""
                        }`}
                      >
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-border px-3 py-3">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileSelected}
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
            />

            <div className="flex gap-2">
              <button
                onClick={handleFileUpload}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Paperclip className="h-3.5 w-3.5" />
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={
                  activeTab === "event"
                    ? "Message event team..."
                    : "Message community..."
                }
                className="h-9 flex-1 rounded-xl border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />

              <Button
                size="sm"
                className="h-9 w-9 rounded-xl p-0 gradient-primary text-primary-foreground"
                onClick={handleSend}
                disabled={!input.trim()}
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}