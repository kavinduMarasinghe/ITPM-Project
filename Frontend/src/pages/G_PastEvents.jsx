import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEvent } from "@/lib/EventContext";
import { societies, getReadinessScore } from "@/lib/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarDays,
  CheckCircle2,
  ArrowRight,
  Search,
  Archive,
  AlertTriangle,
  Clock,
  Trophy,
  FileText,
  Users,
} from "lucide-react";

const eventTypeLabels = {
  sports: "Sports",
  seminar: "Seminar",
  concert: "Concert",
  social: "Social",
  community: "Community",
  exhibition: "Exhibition",
  workshop: "Workshop",
};

const completionStyles = {
  completed: "bg-success/10 text-success border-success/20",
  partial: "bg-warning/10 text-warning border-warning/20",
  delayed: "bg-risk/10 text-risk border-risk/20",
};

const completionIcons = {
  completed: CheckCircle2,
  partial: AlertTriangle,
  delayed: Clock,
};

function getEventPrimaryId(event) {
  return String(event?._id || event?.id || "");
}

function normalizeRelationId(value) {
  if (!value) return "";
  if (typeof value === "object") {
    return String(value._id || value.id || "");
  }
  return String(value);
}

function formatEventDate(dateValue) {
  if (!dateValue) return "N/A";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getCompletionStatus(event, delayedCount, completedCount, totalCount) {
  if (event?.completionStatus) return event.completionStatus;
  if (delayedCount > 0) return "delayed";
  if (totalCount > 0 && completedCount === totalCount) return "completed";
  return "partial";
}

export default function PastEvents() {
  const navigate = useNavigate();
  const { allTasks, setSelectedEventId, userEvents } = useEvent();

  const [search, setSearch] = useState("");
  const [filterSociety, setFilterSociety] = useState("all");
  const [filterType, setFilterType] = useState("all");

  const pastEvents = useMemo(() => {
    return (userEvents || [])
      .filter((e) => e?.status === "completed")
      .map((event) => {
        const eventId = getEventPrimaryId(event);

        const society = societies.find(
          (s) =>
            String(s.id || s._id) === normalizeRelationId(event.societyId)
        );

        const eventTasks = (allTasks || []).filter((t) => {
          const taskEventId = normalizeRelationId(t.eventId);
          return taskEventId === String(eventId);
        });

        const completedCount = eventTasks.filter(
          (t) => t.phase === "completed"
        ).length;

        const totalCount = eventTasks.length;

        const delayedCount = eventTasks.filter((t) => t.isOverdue).length;

        const score = event.finalScore ?? getReadinessScore(eventTasks);

        return {
          event,
          eventId,
          society,
          eventTasks,
          completedCount,
          totalCount,
          delayedCount,
          score,
        };
      })
      .filter(({ event }) => {
        const eventName = String(event?.name || "").toLowerCase();
        const matchesSearch = eventName.includes(search.toLowerCase());

        const matchesSociety =
          filterSociety === "all" ||
          normalizeRelationId(event?.societyId) === String(filterSociety);

        const matchesType =
          filterType === "all" || String(event?.eventType) === String(filterType);

        return matchesSearch && matchesSociety && matchesType;
      })
      .sort((a, b) => {
        const aDate = new Date(a.event?.date || 0).getTime();
        const bDate = new Date(b.event?.date || 0).getTime();
        return bDate - aDate;
      });
  }, [userEvents, allTasks, search, filterSociety, filterType]);

  const userSocieties = useMemo(() => {
    const ids = [
      ...new Set(
        (userEvents || [])
          .filter((e) => e?.status === "completed")
          .map((e) => normalizeRelationId(e.societyId))
      ),
    ];

    return ids
      .map((id) =>
        societies.find((s) => String(s.id || s._id) === String(id))
      )
      .filter(Boolean);
  }, [userEvents]);

  const handleOpen = (eventId) => {
    if (setSelectedEventId) {
      setSelectedEventId(eventId);
    }
    navigate(`/past-events/${eventId}`);
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
            <Archive className="h-6 w-6 text-muted-foreground" />
            Past Events Archive
          </h1>
          <p className="text-sm text-muted-foreground">
            Browse completed events, reports, and files
          </p>
        </div>

        <div className="flex items-center gap-2 bg-card rounded-xl px-4 py-2.5 shadow-card border border-border">
          <Trophy className="h-4 w-4 text-warning" />
          <span className="text-xs font-semibold text-foreground">
            {pastEvents.length} archived events
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search past events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <Select value={filterSociety} onValueChange={setFilterSociety}>
          <SelectTrigger className="w-[180px] h-9 text-xs">
            <SelectValue placeholder="All Communities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">
              All Communities
            </SelectItem>
            {userSocieties.map(
              (s) =>
                s && (
                  <SelectItem
                    key={String(s._id || s.id)}
                    value={String(s._id || s.id)}
                    className="text-xs"
                  >
                    {s.icon} {s.name}
                  </SelectItem>
                )
            )}
          </SelectContent>
        </Select>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[160px] h-9 text-xs">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">
              All Types
            </SelectItem>
            {Object.entries(eventTypeLabels).map(([k, v]) => (
              <SelectItem key={k} value={k} className="text-xs">
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {pastEvents.map(
          ({
            event,
            eventId,
            society,
            completedCount,
            totalCount,
            delayedCount,
            score,
          }) => {
            const status = getCompletionStatus(
              event,
              delayedCount,
              completedCount,
              totalCount
            );
            const StatusIcon = completionIcons[status] || CheckCircle2;
            const memberCount = Array.isArray(event.members)
              ? event.members.length
              : 0;
            const fileCount = Array.isArray(event.files)
              ? event.files.length
              : Array.isArray(event.attachments)
              ? event.attachments.length
              : 0;

            return (
              <Card
                key={eventId}
                className="shadow-card hover:shadow-card-hover transition-all duration-300 group overflow-hidden opacity-95 hover:opacity-100 hover:-translate-y-1"
              >
                <div className="h-1.5 bg-muted-foreground/30" />

                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-10 w-10 rounded-xl flex items-center justify-center text-lg shrink-0 bg-muted">
                        {society?.icon ?? "📋"}
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-sm font-heading font-bold text-foreground leading-tight truncate">
                          {event.name}
                        </h3>
                        <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                          {society?.name ?? "Unknown"}
                        </p>
                      </div>
                    </div>

                    <Badge
                      variant="outline"
                      className={`text-[10px] px-2 py-0.5 capitalize shrink-0 ${
                        completionStyles[status] || completionStyles.completed
                      }`}
                    >
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" />
                    <span>{formatEventDate(event.date)}</span>
                  </div>

                  {event.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                      {event.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-muted/50 rounded-lg px-3 py-2 text-center">
                      <p className="text-lg font-heading font-bold text-foreground">
                        {score}%
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Final Score
                      </p>
                    </div>

                    <div className="bg-muted/50 rounded-lg px-3 py-2 text-center">
                      <p className="text-lg font-heading font-bold text-foreground">
                        {completedCount}/{totalCount}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Tasks Done
                      </p>
                    </div>
                  </div>

                  {delayedCount > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-risk">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>
                        {delayedCount} delayed task{delayedCount > 1 ? "s" : ""}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      <span>{memberCount} members</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5" />
                      <span>{fileCount} files</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleOpen(eventId)}
                    variant="outline"
                    className="w-full gap-2"
                    size="sm"
                  >
                    View Details
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </CardContent>
              </Card>
            );
          }
        )}
      </div>

      {pastEvents.length === 0 && (
        <div className="text-center py-16">
          <Archive className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-lg text-muted-foreground">No past events found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
}