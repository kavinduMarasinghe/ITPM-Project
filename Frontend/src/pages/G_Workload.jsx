import { useMemo } from "react";
import { useEvent } from "@/lib/EventContext";
import { societies } from "@/lib/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, Users, BarChart3 } from "lucide-react";

export default function Workload() {
  const {
    selectedEventId,
    setSelectedEventId,
    eventTasks = [],
    eventMembers = [],
    userEvents = [],
  } = useEvent();

  const memberStats = useMemo(() => {
    return eventMembers.map((member) => {
      const memberTasks = eventTasks.filter((t) => {
        const assigneeId =
          typeof t.assignee === "string"
            ? t.assignee
            : t.assignee?._id || t.assignee?.id || "";

        return assigneeId === (member._id || member.id);
      });

      const completed = memberTasks.filter((t) => t.phase === "completed").length;
      const pending = memberTasks.filter((t) => t.phase !== "completed").length;
      const overdue = memberTasks.filter((t) => Boolean(t.isOverdue)).length;
      const total = memberTasks.length;

      return { ...member, total, completed, pending, overdue };
    });
  }, [eventMembers, eventTasks]);

  const maxTasks =
    memberStats.length > 0 ? Math.max(...memberStats.map((m) => m.total)) : 0;

  const minTasks =
    memberStats.length > 0 ? Math.min(...memberStats.map((m) => m.total)) : 0;

  const imbalance = maxTasks - minTasks;

  const getInitials = (name) => {
    if (!name) return "NA";

    return name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const getLoadColorClass = (total) => {
    if (total > 6) return "bg-red-500";
    if (total > 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getSocietyIcon = (societyId) => {
    const resolvedSocietyId =
      typeof societyId === "string"
        ? societyId
        : societyId?._id || societyId?.id || "";

    return societies.find((s) => s.id === resolvedSocietyId)?.icon || "";
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Workload Monitor
          </h1>
          <p className="text-sm text-muted-foreground">
            Track team capacity and task distribution
          </p>
        </div>

        <Select value={selectedEventId} onValueChange={setSelectedEventId}>
          <SelectTrigger className="w-[260px] h-9 text-xs">
            <SelectValue placeholder="Select event" />
          </SelectTrigger>
          <SelectContent>
            {userEvents.map((ev) => (
              <SelectItem key={ev._id || ev.id} value={ev._id || ev.id} className="text-xs">
                {getSocietyIcon(ev.societyId)} {ev.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {imbalance > 4 && (
        <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              Workload Imbalance Detected
            </p>
            <p className="text-xs text-muted-foreground">
              Task distribution varies by {imbalance} tasks. Consider rebalancing.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {memberStats.length === 0 ? (
          <div className="col-span-full text-center py-10 text-muted-foreground text-sm">
            No members found for this event.
          </div>
        ) : (
          memberStats.map((member) => {
            const ratio =
              member.total > 0
                ? Math.round((member.completed / member.total) * 100)
                : 0;

            return (
              <Card
                key={member._id || member.id}
                className="shadow-card hover:shadow-card-hover transition-all hover:-translate-y-1"
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                      style={{
                        backgroundColor:
                          member.avatar && member.avatar.startsWith("#")
                            ? member.avatar
                            : "#64748b",
                      }}
                    >
                      {getInitials(member.name)}
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {member.name || "Unnamed member"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {member.role || "No role"}
                      </p>
                    </div>

                    <div
                      className={`ml-auto h-3 w-3 rounded-full ${getLoadColorClass(
                        member.total
                      )}`}
                      title={`Load: ${member.total} tasks`}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Completed</span>
                      <span className="font-semibold text-foreground">
                        {member.completed}/{member.total}
                      </span>
                    </div>

                    <Progress value={ratio} className="h-2" />

                    <div className="flex gap-4 text-[11px] text-muted-foreground mt-1">
                      <span>
                        Pending:{" "}
                        <strong className="text-foreground">
                          {member.pending}
                        </strong>
                      </span>
                      <span>
                        Overdue:{" "}
                        <strong
                          className={
                            member.overdue > 0
                              ? "text-red-500"
                              : "text-foreground"
                          }
                        >
                          {member.overdue}
                        </strong>
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}