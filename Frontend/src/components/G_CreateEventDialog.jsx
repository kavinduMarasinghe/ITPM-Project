import { useState, useMemo, useEffect } from "react";
import { useEvent } from "@/lib/EventContext";
import API from "@/lib/api";
import { memberRoleLabels } from "@/lib/mockData";
import { eventTemplates } from "@/lib/eventTemplates";

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

import {
  CalendarIcon,
  Plus,
  X,
  Users,
  Sparkles,
  FolderKanban,
} from "lucide-react";
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

export function CreateEventDialog({ preSelectedSocietyId }) {
  const { allSocieties, userSocieties } = useEvent();
  const { toast } = useToast();

  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [societyId, setSocietyId] = useState(preSelectedSocietyId ?? "");
  const [eventType, setEventType] = useState("social");
  const [date, setDate] = useState(undefined);
  const [teamSearch, setTeamSearch] = useState("");
  const [selectedTeam, setSelectedTeam] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");

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

  const society = allSocieties.find(
    (s) => s.id === societyId || s._id === societyId
  );

  const societyMembers = useMemo(() => {
    if (!society) return [];

    return users.filter((u) =>
      society.members?.some((m) => (typeof m === "string" ? m : m._id) === u._id)
    );
  }, [society, users]);

  const availableMembers = societyMembers.filter(
    (u) =>
      !selectedTeam.some((t) => t.memberId === u._id) &&
      u.name.toLowerCase().includes(teamSearch.toLowerCase())
  );

  const selectedTemplate = eventTemplates.find((t) => t.id === selectedTemplateId);

  const resetForm = () => {
    setName("");
    setSocietyId(preSelectedSocietyId ?? "");
    setEventType("social");
    setDate(undefined);
    setTeamSearch("");
    setSelectedTeam([]);
    setErrors({});
    setSubmitting(false);
    setSelectedTemplateId("");
  };

  const addMember = (memberId, role = "team-member") => {
    const alreadyExists = selectedTeam.some((t) => t.memberId === memberId);
    if (alreadyExists) return;

    setSelectedTeam((prev) => [...prev, { memberId, role }]);
    setTeamSearch("");
    setErrors((prev) => ({ ...prev, team: undefined }));
  };

  const removeMember = (memberId) => {
    setSelectedTeam((prev) => prev.filter((t) => t.memberId !== memberId));
  };

  const updateRole = (memberId, role) => {
    setSelectedTeam((prev) =>
      prev.map((t) => (t.memberId === memberId ? { ...t, role } : t))
    );
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

  const validateForm = () => {
    const newErrors = {};
    const trimmedName = name.trim();
    const today = startOfDay(new Date());

    if (!societyId) {
      newErrors.societyId = "Please select a society.";
    }

    if (!trimmedName) {
      newErrors.name = "Event name is required.";
    } else if (trimmedName.length < 3) {
      newErrors.name = "Event name must be at least 3 characters.";
    } else if (trimmedName.length > 100) {
      newErrors.name = "Event name must be less than 100 characters.";
    }

    if (!eventType) {
      newErrors.eventType = "Please select an event type.";
    }

    if (!date) {
      newErrors.date = "Please select a date.";
    } else if (startOfDay(date) < today) {
      newErrors.date = "Event date cannot be in the past.";
    }

    if (selectedTeam.length === 0) {
      newErrors.team = "Please add at least one team member.";
    } else {
      const societyMemberIds = new Set(societyMembers.map((m) => m._id));
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

      await API.post("/events", {
        name: name.trim(),
        societyId,
        eventType,
        date,
        memberRoles: selectedTeam,
        templateId: selectedTemplateId || undefined,
      });

      toast({
        title: "Event Created",
        description: `${name.trim()} created successfully`,
      });

      setOpen(false);
      resetForm();
      window.location.reload();
    } catch (error) {
      console.error("Create event failed:", error.response?.data || error);
      toast({
        title: "Creation failed",
        description:
          error?.response?.data?.message ||
          "Something went wrong while creating the event.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (!value) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="gradient-primary text-primary-foreground gap-2 rounded-xl"
        >
          <Plus className="h-4 w-4" />
          New Event
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl rounded-3xl p-0 overflow-hidden">
        <div className="border-b bg-gradient-to-r from-primary/10 via-background to-primary/5 px-6 py-5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl font-heading">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <FolderKanban className="h-5 w-5" />
              </div>
              Create New Event
            </DialogTitle>
          </DialogHeader>
          <p className="mt-2 text-sm text-muted-foreground">
            Set up an event, assign the team, and optionally start from a template.
          </p>
        </div>

        <div className="space-y-6 px-6 py-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
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
                {userSocieties.map((s) => (
                  <SelectItem key={s._id || s.id} value={s._id || s.id}>
                    {s.icon ? `${s.icon} ` : ""}
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
            <label className="mb-2 block text-sm font-medium text-foreground">
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
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Event Type
              </label>
              <Select
                value={eventType}
                onValueChange={(v) => {
                  setEventType(v);
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
                <p className="mt-1 text-sm text-red-500">{errors.eventType}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
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
                    disabled={(d) => startOfDay(d) < startOfDay(new Date())}
                    className="p-3"
                  />
                </PopoverContent>
              </Popover>

              {errors.date && (
                <p className="mt-1 text-sm text-red-500">{errors.date}</p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Load Template (optional)
            </label>

            <Select
              value={selectedTemplateId}
              onValueChange={setSelectedTemplateId}
            >
              <SelectTrigger className="h-12 rounded-2xl">
                <SelectValue placeholder="No template" />
              </SelectTrigger>
              <SelectContent>
                {eventTemplates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedTemplate && (
              <div className="mt-3 rounded-2xl border border-border bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Template Preview
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {selectedTemplate.description || "No description available."}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Event Team <span className="text-red-500">*</span>
            </label>

            {!societyId ? (
              <div className="flex h-12 items-center rounded-2xl bg-muted px-4 text-sm text-muted-foreground">
                Select a society first to choose team members.
              </div>
            ) : (
              <>
                <Input
                  value={teamSearch}
                  onChange={(e) => setTeamSearch(e.target.value)}
                  placeholder="Search members..."
                  className="mb-2 h-12 rounded-2xl"
                />

                {teamSearch && (
                  <div className="max-h-44 overflow-y-auto rounded-2xl border border-border">
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
                            style={{
                              backgroundColor: u.avatar || "#6366f1",
                            }}
                          >
                            {getInitials(u.name)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {u.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {u.email}
                            </p>
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

                <div className="mt-3 space-y-2">
                  {selectedTeam.map((tm) => {
                    const user = users.find((u) => u._id === tm.memberId);

                    return (
                      <div
                        key={tm.memberId}
                        className="flex flex-col gap-3 rounded-2xl border border-border px-4 py-3 md:flex-row md:items-center md:justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold text-white"
                            style={{
                              backgroundColor: user?.avatar || "#6366f1",
                            }}
                          >
                            {getInitials(user?.name)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {user?.name || "Unknown member"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {user?.email || "No email"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Select
                            value={tm.role}
                            onValueChange={(v) => updateRole(tm.memberId, v)}
                          >
                            <SelectTrigger className="h-10 w-[150px] rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(memberRoleLabels).map(([k, v]) => (
                                <SelectItem key={k} value={k}>
                                  {v}
                                </SelectItem>
                              ))}
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
              </>
            )}

            {errors.team && (
              <p className="mt-1 text-sm text-red-500">{errors.team}</p>
            )}
          </div>

          <Button
            className="h-12 w-full rounded-2xl gradient-primary text-white"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Creating Event..." : "Create Event"}
          </Button>
        </div>

        {selectedTeam.length > 0 && (
          <div className="border-t bg-muted/20 px-6 py-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Users className="h-4 w-4 text-primary" />
              Team Summary
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {selectedTeam.length} member{selectedTeam.length > 1 ? "s" : ""} selected for this event.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}