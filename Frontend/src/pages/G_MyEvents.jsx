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
import { CalendarDays, ArrowRight } from "lucide-react";

/* 🔥 FIXED */
const getId = (item) => item?._id || item?.id || "";

export default function MyEvents() {
  const navigate = useNavigate();

  const {
    allTasks,
    setSelectedEventId,
    userEvents,
    allSocieties,
    getUserEventRole,
  } = useEvent();

  const [activeTab, setActiveTab] = useState("upcoming");

  const eventCards = useMemo(() => {
    return userEvents.map((event) => {
      const eventId = getId(event);

      const society = allSocieties.find((s) => {
        const socId = getId(event.societyId);
        return getId(s) === socId;
      });

      const eventTasks = allTasks.filter(
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

  const upcoming = eventCards.filter((c) => c.event.status === "upcoming");
  const active = eventCards.filter((c) => c.event.status === "active");
  const completed = eventCards.filter((c) => c.event.status === "completed");

  const handleOpen = (eventId, status) => {
    setSelectedEventId(eventId);

    if (status === "completed") {
      navigate(`/past-events/${eventId}`);
    } else {
      navigate("/tasks");
    }
  };

  const statusStyles = {
    active: "bg-success/10 text-success border-success/20",
    upcoming: "bg-primary/10 text-primary border-primary/20",
    completed: "bg-muted text-muted-foreground border-border",
  };

  const renderCards = (cards) => (
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
                  <div className="flex items-center gap-2.5">
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center text-lg"
                      style={{
                        backgroundColor: `${
                          society?.color ?? "#6366f1"
                        }15`,
                      }}
                    >
                      {society?.icon ?? "📋"}
                    </div>

                    <div>
                      <h3 className="text-sm font-bold">{event.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {society?.name ?? "Unknown"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${statusStyles[event.status]}`}
                    >
                      {event.status}
                    </Badge>

                    {userRole && (
                      <Badge
                        variant="outline"
                        className={`text-[9px] ${
                          memberRoleColors[userRole]
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
                    {new Date(event.date).toLocaleDateString()}
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

                {/* TEAM */}
                <div className="flex -space-x-2">
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
                        className="h-7 w-7 rounded-full flex items-center justify-center text-[9px] text-white"
                        style={{ backgroundColor: member.avatar }}
                        title={member.name}
                      >
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                    );
                  })}
                </div>

                {/* BUTTON */}
                <div className="flex gap-2">
                  <UpdateEventDialog event={event} />
                  <DeleteEventDialog event={event} />

                  <Button
                    onClick={() => handleOpen(eventId, event.status)}
                    className="flex-1 gap-2"
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

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">My Events</h1>
        <CreateEventDialog />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Past</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {renderCards(upcoming)}
        </TabsContent>
        <TabsContent value="active">
          {renderCards(active)}
        </TabsContent>
        <TabsContent value="completed">
          {renderCards(completed)}
        </TabsContent>
      </Tabs>
    </div>
  );
}