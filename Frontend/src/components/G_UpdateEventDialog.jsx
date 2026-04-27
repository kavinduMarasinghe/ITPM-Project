/*
 * Fixes (no business-logic / API changes):
 *  - The team validation was rejecting every Update when the creator was a
 *    unified user (UUID id). `users` came from /auth/users, which only lists
 *    legacy User records, so the creator's own id was treated as "outside the
 *    society" and blocked submission. Now we merge the authenticated user
 *    (via useAuth) into the user pool so the pre-filled team validates.
 *  - Added field labels, h-12 / rounded-2xl inputs, header strip, member
 *    avatars + email — matches the visual language of CreateEventDialog so
 *    the dialog isn't plain after the merge.
 *  - Added an explicit asterisk for required fields and visible field errors.
 *  - PUT /api/g-events/:id call, payload, success toast, reload, controlled
 *    open/close props — all unchanged.
 */

import { useState, useMemo, useEffect } from "react";
import { useEvent } from "@/lib/EventContext";
import { useAuth } from "@/context/AuthContext";
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
import { CalendarIcon, Edit, X, Pencil } from "lucide-react";
import { format, startOfDay } from "date-fns";
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

const getInitials = (nameValue) => {
  if (!nameValue) return "NA";
  return nameValue
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

export function UpdateEventDialog({
  event,
  open: controlledOpen,
  onOpenChange,
}) {
  const { allSocieties, userSocieties } = useEvent();
  const { user: authUser } = useAuth();
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

  // FIX: include the authenticated user (UUID-keyed unified users aren't in
  // /auth/users, so without this merge the pre-filled team validates as
  // "outside the chosen society" and Update silently fails.)
  const mergedUsers = useMemo(() => {
    const list = Array.isArray(users) ? [...users] : [];
    const authId = authUser?.id || authUser?._id;

    if (authId && !list.some((u) => u._id === authId)) {
      list.push({
        _id: authId,
        name: authUser?.name || authUser?.fullName || "You",
        email: authUser?.email || "",
        avatar: authUser?.avatar || "#6366f1",
        role: authUser?.role || "",
      });
    }

    return list;
  }, [users, authUser]);

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

  const society = allSocieties.find((s) => getId(s) === societyId);

  const societyMembers = useMemo(() => {
    if (!society) return [];

    return mergedUsers.filter((u) =>
      society.members?.some((m) => getId(m) === u._id)
    );
  }, [society, mergedUsers]);

  const availableMembers = societyMembers.filter(
    (u) =>
      !selectedTeam.some((t) => t.memberId === u._id) &&
      (u.name || "").toLowerCase().includes(teamSearch.toLowerCase())
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
    const trimmedName = name.trim();
    const today = startOfDay(new Date());

    if (!trimmedName) {
      newErrors.name = "Event name is required.";
    } else if (trimmedName.length < 3) {
      newErrors.name = "Event name must be at least 3 characters.";
    } else if (trimmedName.length > 100) {
      newErrors.name = "Event name must be less than 100 characters.";
    }

    if (!societyId) newErrors.societyId = "Please select a society.";
    if (!eventType) newErrors.eventType = "Please select an event type.";
    if (!status) newErrors.status = "Please select a status.";

    if (!date) {
      newErrors.date = "Please select a date.";
    } else if (status !== "completed" && startOfDay(date) < today) {
      newErrors.date = "Event date cannot be in the past.";
    }

    if (selectedTeam.length === 0) {
      newErrors.team = "Add at least one team member.";
    } else if (society) {
      const societyMemberIds = new Set(societyMembers.map((m) => m?._id));
      const hasInvalidMember = selectedTeam.some(
        (member) => !societyMemberIds.has(member.memberId)
      );

      if (hasInvalidMember) {
        newErrors.team =
          "Selected team contains members outside the chosen society.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "Please fix the form",
        description: "Some required fields are missing or invalid.",
      });
      return;
    }

    try {
      setSubmitting(true);

      const eventId = event?._id || event?.id;

      await API.put(`/g-events/${eventId}`, {
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
          <Button variant="outline" size="sm" className="rounded-xl gap-1.5">
            <Edit className="h-3.5 w-3.5" />
            Edit
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="max-w-2xl rounded-3xl overflow-hidden p-0">
        <div className="border-b bg-gradient-to-r from-primary/10 via-background to-primary/5 px-6 py-5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl font-heading">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Pencil className="h-5 w-5" />
              </div>
              Update Event
            </DialogTitle>
          </DialogHeader>
          <p className="mt-2 text-sm text-muted-foreground">
            Update event details, schedule, and team assignments.
          </p>
        </div>

        <div className="space-y-5 px-6 py-6 max-h-[70vh] overflow-y-auto">
          {/* Society */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              Society <span className="text-red-500">*</span>
            </label>
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
              <SelectTrigger className="h-12 rounded-2xl">
                <SelectValue placeholder="Select society" />
              </SelectTrigger>
              <SelectContent>
                {(userSocieties.length > 0 ? userSocieties : allSocieties).map(
                  (s) => (
                    <SelectItem key={getId(s)} value={getId(s)}>
                      {s.icon ? `${s.icon} ` : ""}
                      {s.name}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            {errors.societyId && (
              <p className="text-xs text-red-500">{errors.societyId}</p>
            )}
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              Event Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="e.g. Annual Sports Day"
              className="h-12 rounded-2xl"
              maxLength={100}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Event Type + Status */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">
                Event Type
              </label>
              <Select
                value={eventType}
                onValueChange={(value) => {
                  setEventType(value);
                  setErrors((prev) => ({ ...prev, eventType: undefined }));
                }}
              >
                <SelectTrigger className="h-12 rounded-2xl">
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
                <p className="text-xs text-red-500">{errors.eventType}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">
                Status
              </label>
              <Select
                value={status}
                onValueChange={(value) => {
                  setStatus(value);
                  setErrors((prev) => ({ ...prev, status: undefined }));
                }}
              >
                <SelectTrigger className="h-12 rounded-2xl">
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
                <p className="text-xs text-red-500">{errors.status}</p>
              )}
            </div>
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              Date <span className="text-red-500">*</span>
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 w-full justify-start rounded-2xl text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(selectedDate) => {
                    setDate(selectedDate);
                    setErrors((prev) => ({ ...prev, date: undefined }));
                  }}
                  disabled={(d) =>
                    status !== "completed" &&
                    startOfDay(d) < startOfDay(new Date())
                  }
                  className="p-3"
                />
              </PopoverContent>
            </Popover>
            {errors.date && (
              <p className="text-xs text-red-500">{errors.date}</p>
            )}
          </div>

          {/* Team */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              Event Team <span className="text-red-500">*</span>
            </label>

            {!societyId ? (
              <div className="flex h-12 items-center rounded-2xl bg-muted px-4 text-sm text-muted-foreground">
                Select a society first to choose team members.
              </div>
            ) : (
              <>
                <Input
                  placeholder="Search members…"
                  value={teamSearch}
                  onChange={(e) => setTeamSearch(e.target.value)}
                  className="h-12 rounded-2xl"
                />

                {teamSearch && (
                  <div className="mt-2 max-h-44 overflow-y-auto rounded-2xl border border-border bg-card shadow-sm">
                    {availableMembers.length > 0 ? (
                      availableMembers.map((u) => (
                        <button
                          key={u._id}
                          type="button"
                          onClick={() => addMember(u._id)}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-muted"
                        >
                          <div
                            className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white"
                            style={{ backgroundColor: u.avatar || "#6366f1" }}
                          >
                            {getInitials(u.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">
                              {u.name || "Unknown"}
                            </p>
                            {u.email && (
                              <p className="truncate text-xs text-muted-foreground">
                                {u.email}
                              </p>
                            )}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-muted-foreground">
                        No matching members found
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {errors.team && (
              <p className="text-xs text-red-500">{errors.team}</p>
            )}
          </div>

          {selectedTeam.length > 0 && (
            <div className="space-y-2">
              {selectedTeam.map((tm) => {
                const user = mergedUsers.find((u) => u._id === tm.memberId);
                const displayName = user?.name || "Unknown member";

                return (
                  <div
                    key={tm.memberId}
                    className="flex flex-col gap-3 rounded-2xl border border-border px-4 py-3 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold text-white shrink-0"
                        style={{
                          backgroundColor: user?.avatar || "#6366f1",
                        }}
                      >
                        {getInitials(displayName)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {displayName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {user?.email || "No email"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Select
                        value={tm.role}
                        onValueChange={(value) =>
                          updateRole(tm.memberId, value)
                        }
                      >
                        <SelectTrigger className="h-10 w-[150px] rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(memberRoleLabels).map(
                            ([key, label]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>

                      <button
                        type="button"
                        onClick={() => removeMember(tm.memberId)}
                        className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="gradient-primary h-12 w-full rounded-2xl text-white transition-all duration-200"
          >
            {submitting ? "Updating..." : "Update Event"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
