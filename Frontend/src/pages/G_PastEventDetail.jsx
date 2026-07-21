import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEvent } from "@/lib/EventContext";
import {
  societies,
  teamMembers,
  getReadinessScore,
} from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Users,
  Star,
  CalendarDays,
  FileText,
  Download,
  Image,
  File,
  Clock,
  ListTodo,
  Trophy,
  Info,
  Activity,
  FolderOpen,
  ShieldCheck,
} from "lucide-react";

const phaseLabels = {
  todo: "To Do",
  "in-progress": "In Progress",
  review: "Review",
  completed: "Completed",
};

const phaseColors = {
  todo: "bg-muted-foreground",
  "in-progress": "bg-primary",
  review: "bg-warning",
  completed: "bg-success",
};

const eventTypeLabels = {
  sports: "Sports",
  seminar: "Seminar",
  concert: "Concert",
  social: "Social",
  community: "Community",
  exhibition: "Exhibition",
  workshop: "Workshop",
};

const fileIcons = {
  image: Image,
  pdf: FileText,
  document: File,
  other: File,
};

const completionBadgeStyles = {
  completed: "bg-success/10 text-success border-success/20",
  partial: "bg-warning/10 text-warning border-warning/20",
  delayed: "bg-risk/10 text-risk border-risk/20",
};

const statusBadgeStyles = {
  upcoming: "bg-primary/10 text-primary border-primary/20",
  active: "bg-warning/10 text-warning border-warning/20",
  completed: "bg-success/10 text-success border-success/20",
};

function formatFullDate(dateValue) {
  if (!dateValue) return "N/A";
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return "N/A";

  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatShortDate(dateValue) {
  if (!dateValue) return "N/A";
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return "N/A";

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(dateValue) {
  if (!dateValue) return "N/A";
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return "N/A";

  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function titleize(value) {
  if (!value) return "N/A";
  return value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getObjectId(value) {
  if (!value || typeof value !== "object") return "";
  return String(value.id || value._id || "");
}

function getSocietyId(value) {
  if (!value || typeof value !== "object") return "";
  return String(value.id || value._id || "");
}

function getCompletionState(pct, delayed) {
  if (delayed > 0) return "delayed";
  if (pct >= 100) return "completed";
  return "partial";
}

export default function PastEventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { allTasks, userEvents } = useEvent();

  const event = userEvents.find((e) => getObjectId(e) === String(eventId));
  const currentEventId = event ? getObjectId(event) : "";

  const society = event
    ? societies.find((s) => getSocietyId(s) === String(event.societyId))
    : undefined;

  const eventTasks = allTasks.filter((t) => {
    const taskEventId =
      typeof t.eventId === "object"
        ? getObjectId(t.eventId)
        : String(t.eventId ?? "");
    return taskEventId === String(eventId) || taskEventId === currentEventId;
  });

  const stats = useMemo(() => {
    if (!event) return null;

    const completed = eventTasks.filter((t) => t.phase === "completed").length;
    const delayed = eventTasks.filter((t) => t.isOverdue).length;
    const total = eventTasks.length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    const score = event.finalScore ?? getReadinessScore(eventTasks);

    const members = (event.members || [])
      .map((id) => teamMembers.find((m) => getObjectId(m) === String(id)))
      .filter(Boolean);

    const memberStats = members
      .map((m) => {
        const memberTasks = eventTasks.filter(
          (t) => getObjectId(t.assignee) === getObjectId(m)
        );

        const memberCompleted = memberTasks.filter(
          (t) => t.phase === "completed"
        ).length;

        return {
          member: m,
          total: memberTasks.length,
          completed: memberCompleted,
          pct:
            memberTasks.length > 0
              ? Math.round((memberCompleted / memberTasks.length) * 100)
              : 0,
        };
      })
      .sort((a, b) => b.completed - a.completed);

    const roleMap = new Map(
      (event.memberRoles ?? []).map((mr) => [String(mr.memberId), mr.role])
    );

    const membersWithRoles = members.map((member) => ({
      member,
      role: roleMap.get(getObjectId(member)) ?? "team-member",
    }));

    return {
      completed,
      delayed,
      total,
      pct,
      score,
      members,
      memberStats,
      membersWithRoles,
    };
  }, [event, eventTasks]);

  if (!event || !stats) {
    return (
      <div className="space-y-6 animate-slide-in">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Card className="shadow-card">
          <CardContent className="p-10 text-center">
            <Info className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <h2 className="text-xl font-bold text-foreground">
              Past event not found
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              The selected event could not be loaded.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completionState = getCompletionState(stats.pct, stats.delayed);
  const attachmentList = event.attachments || event.files || [];
  const topPerformer = stats.memberStats[0];

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-4">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="gap-2 w-fit"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="flex items-start gap-4">
            <div
              className="h-16 w-16 rounded-2xl flex items-center justify-center text-2xl shrink-0"
              style={{
                backgroundColor: `${society?.color || "#6366f1"}15`,
              }}
            >
              {society?.icon || "🎉"}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge
                  variant="outline"
                  className={statusBadgeStyles[event.status] || ""}
                >
                  {titleize(event.status || "completed")}
                </Badge>

                {event.eventType && (
                  <Badge variant="secondary">
                    {eventTypeLabels[event.eventType] || titleize(event.eventType)}
                  </Badge>
                )}

                <Badge
                  variant="outline"
                  className={completionBadgeStyles[completionState]}
                >
                  {completionState === "completed"
                    ? "Successfully Completed"
                    : completionState === "partial"
                    ? "Partially Completed"
                    : "Completed with Delays"}
                </Badge>
              </div>

              <h1 className="text-3xl font-heading font-bold text-foreground">
                {event.name}
              </h1>

              <p className="text-sm text-muted-foreground mt-2 max-w-3xl">
                {event.description || "No description available for this event."}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-4">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  <span>{formatFullDate(event.date)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{stats.members.length} Team Members</span>
                </div>

                <div className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" />
                  <span>{society?.name || "Unknown Society"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Card className="shadow-card w-full lg:w-[320px]">
          <CardContent className="p-6 space-y-4">
            <div>
              <p className="text-xs text-muted-foreground">Final Readiness Score</p>
              <p className="text-4xl font-heading font-bold text-foreground">
                {stats.score}%
              </p>
            </div>

            <Progress value={stats.score} className="h-3" />

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground">Completion</p>
                <p className="text-lg font-bold text-foreground">{stats.pct}%</p>
              </div>

              <div className="rounded-xl bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground">Delayed Tasks</p>
                <p className="text-lg font-bold text-foreground">
                  {stats.delayed}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <ListTodo className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Tasks</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-success/10 text-success flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {stats.completed}
              </p>
              <p className="text-xs text-muted-foreground">Completed Tasks</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-risk/10 text-risk flex items-center justify-center">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {stats.delayed}
              </p>
              <p className="text-xs text-muted-foreground">Overdue Issues</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-warning/10 text-warning flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {stats.members.length}
              </p>
              <p className="text-xs text-muted-foreground">Assigned Members</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2 shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-heading flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Task Summary
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {eventTasks.length === 0 ? (
              <div className="text-sm text-muted-foreground py-6 text-center">
                No tasks were recorded for this event.
              </div>
            ) : (
              eventTasks.map((task) => {
                const assignee =
                  typeof task.assignee === "object"
                    ? task.assignee
                    : teamMembers.find((m) => getObjectId(m) === String(task.assignee));

                return (
                  <div
                    key={task.id || task._id || task.title}
                    className="rounded-xl border border-border bg-card p-4 space-y-3"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-foreground">
                            {task.title}
                          </h3>

                          <Badge variant="outline">
                            {phaseLabels[task.phase] || titleize(task.phase)}
                          </Badge>

                          {task.isOverdue && (
                            <Badge
                              variant="outline"
                              className="bg-risk/10 text-risk border-risk/20"
                            >
                              Overdue
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground mt-1">
                          {task.description || "No task description available."}
                        </p>
                      </div>

                      <div
                        className={`h-2.5 w-2.5 rounded-full ${
                          phaseColors[task.phase] || "bg-muted-foreground"
                        }`}
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        <span>{assignee?.name || "Unassigned"}</span>
                      </div>

                      {task.deadline && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{formatDateTime(task.deadline)}</span>
                        </div>
                      )}

                      {task.priority && (
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          <span>{titleize(task.priority)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-heading flex items-center gap-2">
                <Trophy className="h-4 w-4 text-warning" />
                Top Performer
              </CardTitle>
            </CardHeader>

            <CardContent>
              {topPerformer ? (
                <div className="rounded-2xl bg-muted/30 border border-border p-4 text-center">
                  <div
                    className="mx-auto h-16 w-16 rounded-full flex items-center justify-center text-lg font-bold text-white"
                    style={{
                      backgroundColor:
                        topPerformer.member?.avatar || "#6366f1",
                    }}
                  >
                    {(topPerformer.member?.name || "NA")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>

                  <h3 className="mt-3 font-semibold text-foreground">
                    {topPerformer.member?.name}
                  </h3>

                  <p className="text-xs text-muted-foreground">
                    {topPerformer.completed}/{topPerformer.total} tasks completed
                  </p>

                  <div className="mt-4 flex items-center justify-center gap-1 text-warning">
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No performance data available.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-heading flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Team Members
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              {stats.membersWithRoles.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No team members found.
                </div>
              ) : (
                stats.membersWithRoles.map(({ member, role }) => (
                  <div
                    key={getObjectId(member)}
                    className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ backgroundColor: member.avatar || "#64748b" }}
                      >
                        {(member.name || "NA")
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {member.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {titleize(role)}
                        </p>
                      </div>
                    </div>

                    <Badge variant="outline" className="text-[10px]">
                      {titleize(role)}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-heading flex items-center gap-2">
              <Activity className="h-4 w-4 text-success" />
              Member Performance
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {stats.memberStats.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-4">
                No member task stats available.
              </div>
            ) : (
              stats.memberStats.map((entry) => (
                <div key={getObjectId(entry.member)} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">
                      {entry.member?.name}
                    </span>
                    <span className="text-muted-foreground">
                      {entry.completed}/{entry.total}
                    </span>
                  </div>
                  <Progress value={entry.pct} className="h-2.5" />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-heading flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Event Files
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {attachmentList.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-4">
                No files attached to this event.
              </div>
            ) : (
              attachmentList.map((fileItem, index) => {
                const fileType = fileItem.type || "other";
                const IconComponent = fileIcons[fileType] || File;

                return (
                  <div
                    key={fileItem.id || fileItem._id || index}
                    className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <IconComponent className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {fileItem.name || `Attachment ${index + 1}`}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {titleize(fileType)}
                        </p>
                      </div>
                    </div>

                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </Button>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-heading flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            Event Overview
          </CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="rounded-xl bg-muted/20 border border-border p-4">
            <p className="text-xs text-muted-foreground">Event Date</p>
            <p className="text-sm font-semibold text-foreground mt-1">
              {formatShortDate(event.date)}
            </p>
          </div>

          <div className="rounded-xl bg-muted/20 border border-border p-4">
            <p className="text-xs text-muted-foreground">Society</p>
            <p className="text-sm font-semibold text-foreground mt-1">
              {society?.name || "Unknown"}
            </p>
          </div>

          <div className="rounded-xl bg-muted/20 border border-border p-4">
            <p className="text-xs text-muted-foreground">Event Type</p>
            <p className="text-sm font-semibold text-foreground mt-1">
              {eventTypeLabels[event.eventType] || titleize(event.eventType)}
            </p>
          </div>

          <div className="rounded-xl bg-muted/20 border border-border p-4">
            <p className="text-xs text-muted-foreground">Final Score</p>
            <p className="text-sm font-semibold text-foreground mt-1">
              {stats.score}%
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}