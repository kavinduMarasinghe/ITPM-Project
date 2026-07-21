/*
 * Fixes (no business-logic / API changes):
 *  - Update Society button now lands on a real route (/update-society/:id) —
 *    matched by the new entry I added to App.jsx. It was navigating into
 *    a non-existent route before, so nothing happened on click.
 *  - Added loading skeleton (pulls EventContext.loadingData) and a clear
 *    empty state when there are no societies yet — page used to render an
 *    empty wrapper, which read as "broken".
 *  - Sort events inside each society chronologically (closest date first).
 *  - "Open" route already fixed to /task-board in an earlier pass; kept.
 *  - Navigation, delete API call, expand/collapse state and CreateSocietyDialog
 *    are unchanged.
 */

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEvent } from "@/lib/EventContext";
import API from "@/lib/api";
import { memberRoleLabels, memberRoleColors } from "@/lib/mockData";
import { CreateSocietyDialog } from "@/components/G_CreateSocietyDialog";
import { CreateEventDialog } from "@/components/G_CreateEventDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  CalendarDays,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Lock,
  ShieldCheck,
  Trash2,
  Sparkles,
} from "lucide-react";

const getId = (item) => {
  if (!item) return "";
  if (typeof item === "string") return item;
  return item._id || item.id || "";
};

export default function Communities() {
  const navigate = useNavigate();
  const {
    allSocieties,
    allEvents,
    allTasks,
    setSelectedEventId,
    hasEventAccess,
    getUserEventRole,
    loadingData,
  } = useEvent();

  const [expandedSocieties, setExpandedSocieties] = useState([]);
  const [deletingSocietyId, setDeletingSocietyId] = useState("");

  const toggleExpand = (societyId) => {
    setExpandedSocieties((prev) =>
      prev.includes(societyId)
        ? prev.filter((id) => id !== societyId)
        : [...prev, societyId]
    );
  };

  const handleOpenEvent = (eventId, status) => {
    setSelectedEventId(eventId);

    if (status === "completed") {
      navigate(`/past-events/${eventId}`);
    } else {
      navigate("/task-board");
    }
  };

  const handleDeleteSociety = async (societyId, societyName) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${societyName}"? This will also remove its events and related tasks.`
    );

    if (!confirmed) return;

    try {
      setDeletingSocietyId(societyId);

      await API.delete(`/communities/${societyId}`);

      alert(`"${societyName}" deleted successfully.`);

      window.location.reload();
    } catch (error) {
      console.error("Failed to delete society:", error.response?.data || error);

      alert(
        error?.response?.data?.message ||
          "Something went wrong while deleting the society."
      );
    } finally {
      setDeletingSocietyId("");
    }
  };

  const societyCards = useMemo(() => {
    return allSocieties.map((society) => {
      const societyId = getId(society);

      const societyEvents = allEvents
        .filter((event) => getId(event.societyId) === societyId)
        .slice()
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const societyEventIds = societyEvents.map((event) => getId(event));

      const societyTasks = allTasks.filter((task) =>
        societyEventIds.includes(getId(task.eventId))
      );

      const completedTasks = societyTasks.filter(
        (task) => task.phase === "completed"
      ).length;

      const totalTasks = societyTasks.length;

      const progress =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        society,
        societyId,
        societyEvents,
        societyTasks,
        completedTasks,
        totalTasks,
        progress,
      };
    });
  }, [allSocieties, allEvents, allTasks]);

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">EventAura</h1>
          <p className="text-muted-foreground">
            University societies you belong to and their events
          </p>
        </div>

        <CreateSocietyDialog />
      </div>

      <Card className="border-warning/20 bg-warning/5">
        <CardContent className="p-4 flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>

          <div>
            <h3 className="font-semibold">Event-Based Access Control</h3>
            <p className="text-sm text-muted-foreground">
              You can see all events in your societies, but can only access
              workspaces for events you're assigned to as a team member.{" "}
              <Lock className="inline h-3.5 w-3.5" /> indicates restricted
              events.
            </p>
          </div>
        </CardContent>
      </Card>

      {loadingData ? (
        <div className="space-y-5">
          {[0, 1].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-1.5 bg-muted" />
              <CardContent className="p-6 space-y-4">
                <div className="flex gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-muted animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-1/3 rounded bg-muted animate-pulse" />
                    <div className="h-3 w-2/3 rounded bg-muted animate-pulse" />
                  </div>
                </div>
                <div className="h-2.5 rounded-full bg-muted animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : societyCards.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-10 text-center space-y-3">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              No societies yet
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Create your first society to start organizing events and tasks.
              Use the “New Society” button at the top right.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          {societyCards.map(
            ({
              society,
              societyId,
              societyEvents,
              completedTasks,
              totalTasks,
              progress,
            }) => {
              const isExpanded = expandedSocieties.includes(societyId);
              const isDeleting = deletingSocietyId === societyId;

              return (
                <Card
                  key={societyId}
                  className="shadow-card hover:shadow-card-hover transition-all overflow-hidden"
                >
                  <div
                    className="h-1.5"
                    style={{ backgroundColor: society.color || "#6366f1" }}
                  />

                  <CardContent className="p-6 space-y-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex items-start gap-4 min-w-0">
                        <div
                          className="h-14 w-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                          style={{
                            backgroundColor: `${society.color || "#6366f1"}15`,
                          }}
                        >
                          {society.icon || "📋"}
                        </div>

                        <div className="min-w-0">
                          <h2 className="text-2xl font-semibold text-foreground">
                            {society.name}
                          </h2>
                          <p className="text-muted-foreground max-w-2xl">
                            {society.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <Button
                          variant="outline"
                          onClick={() => toggleExpand(societyId)}
                          className="gap-2"
                        >
                          {isExpanded ? "Collapse" : "Expand"}
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() =>
                            navigate(`/update-society/${societyId}`)
                          }
                        >
                          Update Society
                        </Button>

                        <Button
                          variant="destructive"
                          onClick={() =>
                            handleDeleteSociety(societyId, society.name)
                          }
                          className="gap-2"
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                          {isDeleting ? "Deleting..." : "Delete Society"}
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{society.members?.length || 0} Members</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        <span>{societyEvents.length} Events</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span>
                          Tasks:{" "}
                          <span className="font-semibold text-foreground">
                            {completedTasks}/{totalTasks}
                          </span>
                        </span>
                      </div>

                      <div className="flex items-center gap-3 min-w-[240px]">
                        <Progress value={progress} className="flex-1" />
                        <span className="font-medium text-foreground">
                          {progress}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex -space-x-2">
                        {society.members?.slice(0, 5).map((member, index) => (
                          <div
                            key={getId(member) || index}
                            className="h-8 w-8 rounded-full border-2 border-card flex items-center justify-center text-[10px] font-medium text-white"
                            style={{
                              backgroundColor: member.avatar || "#6366f1",
                            }}
                            title={member.name}
                          >
                            {member.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </div>
                        ))}
                      </div>

                      <div className="text-sm text-muted-foreground">
                        {(society.members || [])
                          .map((member) => member.name)
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t pt-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold tracking-wide text-muted-foreground">
                            EVENTS
                          </h3>

                          <CreateEventDialog
                            preSelectedSocietyId={societyId}
                          />
                        </div>

                        {societyEvents.length === 0 ? (
                          <div className="text-sm text-muted-foreground py-4">
                            No events yet.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {societyEvents.map((event) => {
                              const eventId = getId(event);
                              const accessible = hasEventAccess(eventId);
                              const userRole = getUserEventRole(eventId);

                              return (
                                <div
                                  key={eventId}
                                  className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
                                >
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h4 className="font-semibold text-foreground">
                                        {event.name}
                                      </h4>

                                      <Badge
                                        variant="outline"
                                        className="text-[10px]"
                                      >
                                        {event.status}
                                      </Badge>

                                      {event.eventType && (
                                        <Badge
                                          variant="secondary"
                                          className="text-[10px]"
                                        >
                                          {event.eventType}
                                        </Badge>
                                      )}

                                      {!accessible && (
                                        <Badge
                                          variant="outline"
                                          className="text-[10px] gap-1"
                                        >
                                          <Lock className="h-3 w-3" />
                                          Restricted
                                        </Badge>
                                      )}

                                      {userRole && (
                                        <Badge
                                          variant="outline"
                                          className={`text-[10px] ${
                                            memberRoleColors[userRole] || ""
                                          }`}
                                        >
                                          {memberRoleLabels[userRole] ||
                                            userRole}
                                        </Badge>
                                      )}
                                    </div>

                                    <div className="mt-1 text-sm text-muted-foreground">
                                      {event.date
                                        ? new Date(
                                            event.date
                                          ).toLocaleDateString()
                                        : "No date"}
                                      {" • "}
                                      {event.members?.length || 0} team members
                                    </div>
                                  </div>

                                  <Button
                                    onClick={() =>
                                      handleOpenEvent(eventId, event.status)
                                    }
                                    className="gap-2 self-start md:self-auto"
                                    variant={
                                      accessible ? "default" : "outline"
                                    }
                                  >
                                    {accessible ? "Open" : "View"}
                                    <ArrowRight className="h-4 w-4" />
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}
