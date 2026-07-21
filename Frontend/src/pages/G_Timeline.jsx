/*
 * Fixes (no business-logic / API changes):
 *  - Added a "no event selected / no events" fallback so the page doesn't
 *    silently render a misleading default milestone column when the user has
 *    nothing to show.
 *  - Sorted critical-path tasks chronologically by deadline (earliest first)
 *    so the bottom card behaves like a real timeline.
 *  - Added a loading skeleton while EventContext is fetching.
 *  - currentEvent banner shows which event the timeline is anchored to.
 *  - All milestone math, readiness score, and Progress UI are unchanged.
 */

import { useMemo } from "react";
import { useEvent } from "@/lib/EventContext";
import { getReadinessScore } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  Flag,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Target,
  CalendarClock,
} from "lucide-react";

const defaultMilestones = [
  { label: "Planning Complete", date: "Week 1", done: true },
  { label: "Preparation Deadline", date: "Week 2", done: false },
  { label: "Rehearsal Day", date: "Week 3", done: false },
  { label: "Setup Day", date: "Day Before", done: false },
  { label: "Event Day 🎉", date: "Event Day", done: false },
];

function getTaskId(task) {
  return task?._id || task?.id || task?.title || Math.random().toString(36);
}

function getAssigneeName(task) {
  if (!task?.assignee) return "Unassigned";
  if (typeof task.assignee === "object") return task.assignee.name || "Unassigned";
  return "Assigned";
}

export default function Timeline() {
  const {
    eventTasks = [],
    currentEvent,
    selectedEventId,
    userEvents = [],
    loadingData,
  } = useEvent();

  const score = getReadinessScore(eventTasks);

  const criticalTasks = useMemo(() => {
    return eventTasks
      .filter((t) => t?.impact === "critical" && t?.phase !== "completed")
      .slice()
      .sort((a, b) => {
        const aTime = a?.deadline ? new Date(a.deadline).getTime() : Infinity;
        const bTime = b?.deadline ? new Date(b.deadline).getTime() : Infinity;
        return aTime - bTime;
      });
  }, [eventTasks]);

  const completedTasks = eventTasks.filter((t) => t?.phase === "completed").length;
  const totalTasks = eventTasks.length;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const timelineMilestones = useMemo(() => {
    const hasAnyTasks = eventTasks.length > 0;

    if (!hasAnyTasks) return defaultMilestones;

    const allCompleted = eventTasks.every((t) => t?.phase === "completed");
    const someStarted = eventTasks.some(
      (t) => t?.phase === "in-progress" || t?.phase === "review" || t?.phase === "completed"
    );
    const reviewStarted = eventTasks.some(
      (t) => t?.phase === "review" || t?.phase === "completed"
    );

    return [
      { label: "Planning Complete", date: "Week 1", done: true },
      { label: "Preparation Deadline", date: "Week 2", done: someStarted },
      { label: "Rehearsal Day", date: "Week 3", done: reviewStarted },
      { label: "Setup Day", date: "Day Before", done: completionRate >= 75 },
      { label: "Event Day 🎉", date: "Event Day", done: allCompleted },
    ];
  }, [eventTasks, completionRate]);

  // Loading state
  if (loadingData) {
    return (
      <div className="space-y-6 animate-slide-in">
        <div className="h-8 w-48 rounded bg-muted animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-2">
                <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
                <div className="h-6 w-1/3 rounded bg-muted animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6 space-y-3">
            <div className="h-4 w-1/3 rounded bg-muted animate-pulse" />
            <div className="h-3 w-2/3 rounded bg-muted animate-pulse" />
            <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // No event context — surface a clear empty state instead of showing
  // a misleading default milestones column.
  if (!selectedEventId || !currentEvent) {
    return (
      <div className="space-y-6 animate-slide-in">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">
            Event Timeline
          </h1>
          <p className="text-sm text-muted-foreground">
            Visual overview of milestones and critical path
          </p>
        </div>

        <Card className="border-dashed">
          <CardContent className="p-10 text-center space-y-3">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <CalendarClock className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
              {userEvents.length === 0
                ? "No events yet"
                : "Select an event to view its timeline"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              {userEvents.length === 0
                ? "Once you're added to an event, its milestones and critical-path tasks will show up here."
                : "Pick an event from the Dashboard or Task Board, then come back here to see its timeline."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">
            Event Timeline
          </h1>
          <p className="text-sm text-muted-foreground">
            {currentEvent.name
              ? `Milestones and critical path for ${currentEvent.name}`
              : "Visual overview of milestones and critical path"}
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 shadow-card">
          <Target className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">
            {completionRate}% overall progress
          </span>
        </div>
      </div>

      {score < 60 && (
        <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              Readiness Below 60%
            </p>
            <p className="text-xs text-muted-foreground">
              Event readiness is at {score}%. Immediate attention required.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Readiness Score</p>
            <p className="text-2xl font-heading font-bold text-foreground mt-1">
              {score}%
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Completed Tasks</p>
            <p className="text-2xl font-heading font-bold text-foreground mt-1">
              {completedTasks}/{totalTasks}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">Completion</p>
              <p className="text-sm font-semibold text-foreground">
                {completionRate}%
              </p>
            </div>
            <Progress value={completionRate} className="h-2.5" />
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-sm font-heading flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            Milestones
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

            <div className="space-y-6">
              {timelineMilestones.map((m, i) => (
                <div key={i} className="flex items-center gap-4 relative">
                  <div
                    className={`h-9 w-9 rounded-full flex items-center justify-center z-10 shrink-0 ${
                      m.done
                        ? "bg-success text-success-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {m.done ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Flag className="h-4 w-4" />
                    )}
                  </div>

                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        m.done ? "text-success" : "text-foreground"
                      }`}
                    >
                      {m.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{m.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-sm font-heading flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-risk" />
            Critical Path Tasks
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {criticalTasks.length === 0 ? (
              <div className="rounded-xl border border-success/20 bg-success/5 p-4 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                <p className="text-sm text-success font-medium">
                  All critical tasks completed! 🎉
                </p>
              </div>
            ) : (
              criticalTasks.map((task, index) => {
                const assigneeName = getAssigneeName(task);
                const progress =
                  typeof task?.progress === "number" ? task.progress : 0;

                const deadlineText = task?.deadline
                  ? new Date(task.deadline).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : "No deadline";

                return (
                  <div
                    key={getTaskId(task) || index}
                    className={`p-4 rounded-xl border ${
                      task?.isOverdue
                        ? "border-risk/40 bg-risk/5"
                        : "border-border bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <p className="text-sm font-semibold text-foreground">
                        {task?.title || "Untitled Task"}
                      </p>

                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock3 className="h-3.5 w-3.5" />
                        <span>{deadlineText}</span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mt-1">
                      Assigned to {assigneeName} • {progress}% complete
                    </p>

                    <div className="mt-3">
                      <Progress value={progress} className="h-2" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
