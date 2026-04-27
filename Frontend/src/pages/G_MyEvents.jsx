/*
 * Fixes (no business-logic / API changes):
 *  - Edit + Delete dialogs already render inside each card; the upstream bug
 *    that blocked Update (validation against /auth/users only) is fixed in
 *    G_UpdateEventDialog. This page only needs to keep passing the right
 *    `event` prop and not crash on missing data.
 *  - Defensive guard: skip cards whose underlying event is missing an id so
 *    we never hand `event={undefined}` to the dialog.
 *  - Button row now wraps cleanly on narrow cards (Update + Delete + Open
 *    used to be cramped on small viewports).
 *  - Loading skeleton + per-tab empty states from the previous pass kept.
 *  - Open button still navigates to /task-board for non-completed events.
 *  - CreateEventDialog at the page header is unchanged (handles New Event +
 *    POST /api/g-events itself).
 */

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEvent } from "@/lib/EventContext";
import {
  getReadinessScore,
  memberRoleLabels,
  memberRoleColors,
} from "@/lib/mockData";
import { CreateEventDialog } from "@/components/G_CreateEventDialog";
import { UpdateEventDialog } from "@/components/G_UpdateEventDialog";
import { DeleteEventDialog } from "@/components/G_DeleteEventDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { CalendarDays, ArrowRight, FolderKanban } from "lucide-react";

const getId = (item) => item?._id || item?.id || "";

export default function MyEvents() {
  const navigate = useNavigate();

  const {
    allTasks,
    setSelectedEventId,
    userEvents,
    allSocieties,
    getUserEventRole,
    loadingData,
  } = useEvent();

  const [activeTab, setActiveTab] = useState("upcoming");

  const eventCards = useMemo(() => {
    return (userEvents || [])
      .filter((event) => Boolean(getId(event)))
      .map((event) => {
        const eventId = getId(event);

        const society = allSocieties.find((s) => {
          const socId = getId(event.societyId);
          return getId(s) === socId;
        });

        const eventTasks = (allTasks || []).filter(
          (t) => getId(t.eventId) === eventId
        );

        const completedCount = eventTasks.filter(
          (t) => t.phase === "completed"
        ).length;

        const totalCount = eventTasks.length;

        const completionPct =
          totalCount > 0
            ? Math.round((completedCount / totalCount) * 100)
            : 0;

        const readiness = getReadinessScore(eventTasks);
        const userRole = getUserEventRole(eventId);

        return {
          event,
          eventId,
          society,
          completedCount,
          totalCount,
          completionPct,
          readiness,
          userRole,
        };
      });
  }, [userEvents, allTasks, allSocieties, getUserEventRole]);

  const upcoming = eventCards
    .filter((c) => c.event.status === "upcoming")
    .sort((a, b) => new Date(a.event.date) - new Date(b.event.date));

  const active = eventCards
    .filter((c) => c.event.status === "active")
    .sort((a, b) => new Date(a.event.date) - new Date(b.event.date));

  const completed = eventCards
    .filter((c) => c.event.status === "completed")
    .sort((a, b) => new Date(b.event.date) - new Date(a.event.date));

  const handleOpen = (eventId, status) => {
    setSelectedEventId(eventId);

    if (status === "completed") {
      navigate(`/past-events/${eventId}`);
    } else {
      navigate("/task-board");
    }
  };

  const statusStyles = {
    active: "bg-success/10 text-success border-success/20",
    upcoming: "bg-primary/10 text-primary border-primary/20",
    completed: "bg-muted text-muted-foreground border-border",
  };

  const renderEmpty = (label) => (
    <Card className="border-dashed">
      <CardContent className="p-10 text-center space-y-3">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
          <FolderKanban className="h-5 w-5" />
        </div>
        <h3 className="text-base font-semibold text-foreground">
          No {label} events
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          {label === "upcoming"
            ? "When you're added to an upcoming event, it will appear here."
            : label === "active"
            ? "Events currently in progress will show up here."
            : "Past events will appear here once completed."}
        </p>
      </CardContent>
    </Card>
  );

  const renderLoading = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {[0, 1, 2].map((i) => (
        <Card key={i} className="overflow-hidden">
          <div className="h-1.5 bg-muted" />
          <CardContent className="p-5 space-y-4">
            <div className="flex gap-3">
              <div className="h-10 w-10 rounded-xl bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-2/3 rounded bg-muted animate-pulse" />
                <div className="h-3 w-1/3 rounded bg-muted animate-pulse" />
              </div>
            </div>
            <div className="h-2 rounded bg-muted animate-pulse" />
            <div className="h-2 rounded bg-muted animate-pulse w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderCards = (cards, label) => {
    if (loadingData) return renderLoading();
    if (cards.length === 0) return renderEmpty(label);

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {cards.map(
          ({
            event,
            eventId,
            society,
            completedCount,
            totalCount,
            completionPct,
            userRole,
          }) => {
            const isPast = event.status === "completed";

            return (
              <Card
                key={eventId}
                className="shadow-card hover:shadow-card-hover transition-all group overflow-hidden"
              >
                <div
                  className="h-1.5"
                  style={{
                    backgroundColor: isPast
                      ? "hsl(var(--muted-foreground))"
                      : society?.color ?? "hsl(var(--primary))",
                  }}
                />

                <CardContent className="p-5 space-y-4">
                  {/* HEADER */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="h-10 w-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                        style={{
                          backgroundColor: `${society?.color ?? "#6366f1"}15`,
                        }}
                      >
                        {society?.icon ?? "📋"}
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-sm font-bold truncate">
                          {event.name}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {society?.name ?? "Unknown"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          statusStyles[event.status] || ""
                        }`}
                      >
                        {event.status}
                      </Badge>

                      {userRole && memberRoleLabels[userRole] && (
                        <Badge
                          variant="outline"
                          className={`text-[9px] ${
                            memberRoleColors[userRole] || ""
                          }`}
                        >
                          {memberRoleLabels[userRole]}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* DATE */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" />
                    <span>
                      {event.date
                        ? new Date(event.date).toLocaleDateString()
                        : "No date"}
                    </span>
                  </div>

                  {/* STATS */}
                  <div className="flex items-center gap-4 text-xs">
                    <span>Tasks: {totalCount}</span>
                    <span>Done: {completedCount}</span>
                    <span>{event.members?.length || 0} team</span>
                  </div>

                  {/* PROGRESS */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Progress</span>
                      <span>{completionPct}%</span>
                    </div>
                    <Progress value={completionPct} />
                  </div>

                  {/* TEAM AVATARS */}
                  <div className="flex -space-x-2 min-h-[1.75rem]">
                    {event.memberRoles?.slice(0, 4).map((mr, index) => {
                      const member =
                        mr.member ||
                        (typeof mr.memberId === "object"
                          ? mr.memberId
                          : null);

                      if (!member) return null;

                      return (
                        <div
                          key={index}
                          className="h-7 w-7 rounded-full flex items-center justify-center text-[9px] text-white border border-card"
                          style={{ backgroundColor: member.avatar }}
                          title={member.name}
                        >
                          {member.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                      );
                    })}
                  </div>

                  {/* ACTIONS */}
                  <div className="flex flex-wrap items-center gap-2">
                    <UpdateEventDialog event={event} />
                    <DeleteEventDialog event={event} />

                    <Button
                      onClick={() => handleOpen(eventId, event.status)}
                      className="ml-auto gap-2"
                      size="sm"
                    >
                      Open <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          }
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">My Events</h1>
          <p className="text-sm text-muted-foreground">
            Events you're a member of, grouped by status
          </p>
        </div>
        <CreateEventDialog />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming{upcoming.length > 0 ? ` (${upcoming.length})` : ""}
          </TabsTrigger>
          <TabsTrigger value="active">
            Active{active.length > 0 ? ` (${active.length})` : ""}
          </TabsTrigger>
          <TabsTrigger value="completed">
            Past{completed.length > 0 ? ` (${completed.length})` : ""}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4">
          {renderCards(upcoming, "upcoming")}
        </TabsContent>
        <TabsContent value="active" className="mt-4">
          {renderCards(active, "active")}
        </TabsContent>
        <TabsContent value="completed" className="mt-4">
          {renderCards(completed, "completed")}
        </TabsContent>
      </Tabs>
    </div>
  );
}
