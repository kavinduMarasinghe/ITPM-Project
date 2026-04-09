import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Clock,
  AlertTriangle,
  UserPlus,
  RotateCcw,
  CalendarClock,
  Info,
  MessageCircle,
  CheckCircle2,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  getTaskNotifications,
  markTaskNotificationRead,
  markAllTaskNotificationsRead,
} from "@/services/taskNotificationServiceg";

const typeIcons = {
  deadline: CalendarClock,
  overdue: Clock,
  assignment: UserPlus,
  risk: AlertTriangle,
  reopened: RotateCcw,
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  chat: MessageCircle,
  task: CalendarClock,
  event: CalendarClock,
  system: Info,
};

const typeStyles = {
  deadline: "text-warning",
  overdue: "text-risk",
  assignment: "text-primary",
  risk: "text-risk",
  reopened: "text-accent",
  info: "text-primary",
  success: "text-green-600",
  warning: "text-warning",
  chat: "text-primary",
  task: "text-primary",
  event: "text-primary",
  system: "text-primary",
};

function formatTime(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function NotificationDropdown() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(false);

  const unreadCount = useMemo(
    () => notifs.filter((n) => !n.isRead).length,
    [notifs]
  );

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await getTaskNotifications();
      setNotifs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load notifications:", error);
      setNotifs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await markAllTaskNotificationsRead();
      setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const handleMarkSingleRead = async (id) => {
    try {
      await markTaskNotificationRead(id);
      setNotifs((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative rounded-xl p-2 transition-colors hover:bg-muted">
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-risk text-[10px] font-bold text-risk-foreground">
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-80 rounded-2xl border border-border p-0 shadow-xl"
        align="end"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h4 className="text-sm font-heading font-semibold text-foreground">
            Notifications
          </h4>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-[11px] text-primary transition hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>

        <div className="max-h-[360px] overflow-y-auto">
          {loading && (
            <div className="px-4 py-6 text-center text-xs text-muted-foreground">
              Loading notifications...
            </div>
          )}

          {!loading && notifs.length === 0 && (
            <div className="px-4 py-8 text-center">
              <Bell className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
              <p className="text-xs text-muted-foreground">
                No notifications yet
              </p>
            </div>
          )}

          {!loading &&
            notifs.map((n) => {
              const Icon = typeIcons[n.type] || Bell;
              const styleClass = typeStyles[n.type] || "text-primary";

              return (
                <button
                  key={n.id}
                  onClick={() => {
                    if (!n.isRead) {
                      handleMarkSingleRead(n.id);
                    }
                  }}
                  className={`flex w-full gap-3 border-b border-border px-4 py-3 text-left transition-colors last:border-0 hover:bg-muted/40 ${
                    n.isRead ? "opacity-70" : "bg-primary/5"
                  }`}
                >
                  <div className={`mt-0.5 shrink-0 ${styleClass}`}>
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold leading-tight text-foreground">
                        {n.title}
                      </p>
                      {!n.isRead && (
                        <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </div>

                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {n.message}
                    </p>

                    <p className="mt-1 text-[10px] text-muted-foreground/60">
                      {formatTime(n.createdAt)}
                    </p>
                  </div>
                </button>
              );
            })}
        </div>
      </PopoverContent>
    </Popover>
  );
}