import { useState, useMemo, useEffect } from "react";
import { useEvent } from "@/lib/EventContext";
import API from "@/lib/api";
import { memberRoleLabels } from "@/lib/mockData";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Edit, X } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const EVENT_TYPES = [
  { value: "sports", label: "Sports" },
  { value: "seminar", label: "Seminar" },
  { value: "concert", label: "Concert" },
  { value: "social", label: "Social" },
  { value: "community", label: "Community Service" },
  { value: "exhibition", label: "Exhibition" },
  { value: "workshop", label: "Workshop" },
];

const STATUS_OPTIONS = [
  { value: "upcoming", label: "Upcoming" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
];

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || value.id || "";
};

const normalizeMemberRoles = (memberRoles) => {
  if (!Array.isArray(memberRoles)) return [];

  return memberRoles
    .map((item) => ({
      memberId: getId(item.memberId || item.member),
      role: item.role || "team-member",
    }))
    .filter((item) => item.memberId);
};

export function UpdateEventDialog({
  event,
  open: controlledOpen,
  onOpenChange,
}) {
  const { allSocieties, userSocieties } = useEvent();
  const { toast } = useToast();

  const [users, setUsers] = useState([]);
  const [internalOpen, setInternalOpen] = useState(false);

  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const [name, setName] = useState("");
  const [societyId, setSocietyId] = useState("");
  const [eventType, setEventType] = useState("social");
  const [status, setStatus] = useState("upcoming");
  const [date, setDate] = useState(undefined);
  const [teamSearch, setTeamSearch] = useState("");
  const [selectedTeam, setSelectedTeam] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await API.get("/auth/users");
        setUsers(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        setUsers([]);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (!open || !event) return;

    setName(event?.name || "");
    setSocietyId(getId(event?.societyId));
    setEventType(event?.eventType || "social");
    setStatus(event?.status || "upcoming");
    setDate(event?.date ? new Date(event.date) : undefined);
    setSelectedTeam(normalizeMemberRoles(event?.memberRoles));
    setTeamSearch("");
    setErrors({});
  }, [open, event]);

  const society = allSocieties.find(
    (s) => getId(s) === societyId
  );

  const societyMembers = useMemo(() => {
    if (!society) return [];

    return users.filter((u) =>
      society.members?.some((m) => getId(m) === u._id)
    );
  }, [society, users]);

  const availableMembers = societyMembers.filter(
    (u) =>
      !selectedTeam.some((t) => t.memberId === u._id) &&
      u.name.toLowerCase().includes(teamSearch.toLowerCase())
  );

  const addMember = (id) => {
    if (selectedTeam.some((t) => t.memberId === id)) return;

    setSelectedTeam((prev) => [
      ...prev,
      { memberId: id, role: "team-member" },
    ]);
    setTeamSearch("");
    setErrors((prev) => ({ ...prev, team: undefined }));
  };

  const removeMember = (id) => {
    setSelectedTeam((prev) => prev.filter((t) => t.memberId !== id));
  };

  const updateRole = (id, role) => {
    setSelectedTeam((prev) =>
      prev.map((t) => (t.memberId === id ? { ...t, role } : t))
    );
  };

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) newErrors.name = "Event name is required.";
    if (!societyId) newErrors.societyId = "Please select a society.";
    if (!eventType) newErrors.eventType = "Please select an event type.";
    if (!status) newErrors.status = "Please select a status.";
    if (!date) newErrors.date = "Please select a date.";
    if (selectedTeam.length === 0) newErrors.team = "Add at least one member.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "Please fix the form",
        description: "Some required fields are missing.",
      });
      return;
    }

    try {
      setSubmitting(true);

      const eventId = event?._id || event?.id;

      await API.put(`/events/${eventId}`, {
        name: name.trim(),
        societyId,
        eventType,
        status,
        date,
        members: selectedTeam.map((item) => item.memberId),
        memberRoles: selectedTeam,
      });

      toast({
        title: "Updated successfully",
        description: `${name.trim()} was updated.`,
      });

      setOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Update failed:", error.response?.data || error);

      toast({
        title: "Update failed",
        description:
          error?.response?.data?.message ||
          "Something went wrong while updating the event.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!onOpenChange && (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Edit className="mr-1 h-4 w-4" />
            Edit
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="max-w-xl rounded-3xl">
        <DialogHeader>
          <DialogTitle>Update Event</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="Event name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div>
            <Select
              value={societyId}
              onValueChange={(value) => {
                setSocietyId(value);
                setSelectedTeam([]);
                setTeamSearch("");
                setErrors((prev) => ({
                  ...prev,
                  societyId: undefined,
                  team: undefined,
                }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Society" />
              </SelectTrigger>
              <SelectContent>
                {userSocieties.map((s) => (
                  <SelectItem key={getId(s)} value={getId(s)}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.societyId && (
              <p className="mt-1 text-sm text-red-500">{errors.societyId}</p>
            )}
          </div>

          <div>
            <Select
              value={eventType}
              onValueChange={(value) => {
                setEventType(value);
                setErrors((prev) => ({ ...prev, eventType: undefined }));
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.eventType && (
              <p className="mt-1 text-sm text-red-500">{errors.eventType}</p>
            )}
          </div>

          <div>
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value);
                setErrors((prev) => ({ ...prev, status: undefined }));
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-500">{errors.status}</p>
            )}
          </div>

          <div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <Calendar mode="single" selected={date} onSelect={setDate} />
              </PopoverContent>
            </Popover>
            {errors.date && (
              <p className="mt-1 text-sm text-red-500">{errors.date}</p>
            )}
          </div>

          <div>
            <Input
              placeholder="Search members"
              value={teamSearch}
              onChange={(e) => setTeamSearch(e.target.value)}
            />

            {teamSearch && (
              <div className="mt-2 max-h-40 overflow-y-auto rounded-xl border">
                {availableMembers.length > 0 ? (
                  availableMembers.map((u) => (
                    <button
                      key={u._id}
                      type="button"
                      onClick={() => addMember(u._id)}
                      className="block w-full px-3 py-2 text-left hover:bg-muted"
                    >
                      {u.name}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    No matching members found
                  </div>
                )}
              </div>
            )}

            {errors.team && (
              <p className="mt-1 text-sm text-red-500">{errors.team}</p>
            )}
          </div>

          <div className="space-y-2">
            {selectedTeam.map((tm) => {
              const user = users.find((u) => u._id === tm.memberId);

              return (
                <div
                  key={tm.memberId}
                  className="flex items-center justify-between gap-3 rounded-xl border p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {user?.name || "Unknown member"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user?.email || "No email"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Select
                      value={tm.role}
                      onValueChange={(value) => updateRole(tm.memberId, value)}
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(memberRoleLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <button
                      type="button"
                      onClick={() => removeMember(tm.memberId)}
                      className="rounded-md p-2 hover:bg-muted"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Updating..." : "Update Event"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}