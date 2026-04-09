import { useEffect, useState } from "react";
import { useEvent } from "@/lib/EventContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Radio,
  AlertTriangle,
  CheckCircle2,
  Users,
  Bell,
  ShieldAlert,
} from "lucide-react";
import { getLiveSummary } from "@/services/liveModeServiceg";

function getLiveBadge(status) {
  if (status === "live") {
    return {
      label: "LIVE",
      className: "text-xs bg-success/10 text-success border-success/20",
    };
  }

  if (status === "attention") {
    return {
      label: "ATTENTION",
      className: "text-xs bg-warning/10 text-warning border-warning/20",
    };
  }

  if (status === "completed") {
    return {
      label: "COMPLETED",
      className: "text-xs bg-primary/10 text-primary border-primary/20",
    };
  }

  return {
    label: "MONITORING",
    className: "text-xs bg-muted text-muted-foreground border-border",
  };
}

export default function LiveMode() {
  const { selectedEventId } = useEvent();

  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadLiveData = async () => {
    if (!selectedEventId) {
      setLiveData(null);
      return;
    }

    try {
      setLoading(true);
      const data = await getLiveSummary(selectedEventId);
      setLiveData(data);
    } catch (error) {
      console.error("Failed to load live summary:", error);
      setLiveData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLiveData();
  }, [selectedEventId]);

  useEffect(() => {
    if (!selectedEventId) return;

    const interval = setInterval(() => {
      loadLiveData();
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedEventId]);

  const live = liveData?.live;
  const event = liveData?.event;
  const society = liveData?.society;
  const urgentIssues = liveData?.urgentIssues || [];
  const memberStatus = liveData?.memberStatus || [];
  const notifications = liveData?.notifications || [];

  const liveBadge = getLiveBadge(live?.status || "monitoring");

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3">
            <div
              className={`h-3 w-3 rounded-full ${
                live?.status === "attention"
                  ? "bg-warning animate-pulse"
                  : live?.status === "completed"
                  ? "bg-primary"
                  : "bg-risk animate-pulse-glow"
              }`}
            />
            <h1 className="text-2xl font-heading font-bold text-foreground">
              Live Mode
            </h1>
            <Badge variant="outline" className={liveBadge.className}>
              <Radio className="h-3 w-3 mr-1" />
              {liveBadge.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {event?.name || "No event selected"} • {society?.name || ""}
          </p>
        </div>
      </div>

      {loading && (
        <div className="text-sm text-muted-foreground">
          Loading live data...
        </div>
      )}

      {!loading && liveData && live && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="shadow-card">
              <CardContent className="p-4 text-center">
                <p className="text-4xl font-heading font-bold text-foreground">
                  {live.readinessScore}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Readiness Score
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="p-4 text-center">
                <p className="text-4xl font-heading font-bold text-foreground">
                  {live.completionRate}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Tasks Complete
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="p-4 text-center">
                <p className="text-4xl font-heading font-bold text-success">
                  {memberStatus.length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Active Members
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="p-4 text-center">
                <p className="text-4xl font-heading font-bold text-risk">
                  {urgentIssues.length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Critical Issues
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-heading">
                Event Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={live.completionRate} className="h-3" />
              <p className="text-xs text-muted-foreground mt-2">
                {live.completedTasks} of {live.totalTasks} tasks completed
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-heading flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Team Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {memberStatus.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No team members assigned
                    </p>
                  </div>
                ) : (
                  memberStatus.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50"
                    >
                      <div
                        className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground"
                        style={{ backgroundColor: member.avatar || "#64748b" }}
                      >
                        {(member.name || "NA")
                          .split(" ")
                          .filter(Boolean)
                          .map((n) => n[0])
                          .join("")}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">{member.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {member.role}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-semibold text-foreground">
                          {member.completedTasks}/{member.assignedTasks}
                        </p>
                        {member.overdueTasks > 0 ? (
                          <p className="text-[10px] text-risk">
                            {member.overdueTasks} overdue
                          </p>
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-success ml-auto" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-heading flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-risk" />
                  Critical Issues
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {urgentIssues.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="h-8 w-8 text-success mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No critical issues
                    </p>
                  </div>
                ) : (
                  urgentIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className={`p-3 rounded-lg border ${
                        issue.severity === "high"
                          ? "bg-risk/5 border-risk/20"
                          : "bg-warning/5 border-warning/20"
                      }`}
                    >
                      <p className="text-sm font-semibold text-foreground">
                        {issue.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {issue.description}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-heading flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                Recent Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <ShieldAlert className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No recent notifications
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-3 rounded-lg bg-muted/30 border border-border"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-primary/10 text-primary border-primary/20"
                        >
                          new
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(notification.createdAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </>
      )}

      {!loading && !liveData && (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground">
            No live data available for this event.
          </p>
        </div>
      )}
    </div>
  );
}