/*
 * Fixes (no business-logic / API changes):
 *  - Same UX issue as AddTaskDialog — member list was hidden until the user
 *    typed a search query, so reassigning a task looked broken. The list now
 *    renders as soon as the dialog opens, with the search field acting as
 *    a live filter.
 *  - Empty states surfaced explicitly: "No team members available" if the
 *    parent event has none, "No members match your search" while filtering.
 *  - Selected assignee is shown as a primary chip with a Clear button.
 *  - Field labels + h-12 / rounded-2xl inputs + header strip applied so the
 *    form matches the rest of the SmartCampus theme after merge.
 *  - PUT /api/tasks/:id payload, validation thresholds, and the
 *    onTaskUpdated callback are unchanged.
 */

import { useEffect, useMemo, useState } from "react";
import API from "@/lib/api";
import { useEvent } from "@/lib/EventContext";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

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

import { CalendarIcon, Pencil, Users, X } from "lucide-react";
import { format, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";

const getId = (item) => item?._id || item?.id || "";

const getInitials = (nameValue) => {
  if (!nameValue) return "NA";
  return nameValue
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

export function UpdateTaskDialog({ task, open, onOpenChange, onTaskUpdated }) {
  const { eventMembers, currentEvent } = useEvent();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [impact, setImpact] = useState("important");
  const [phase, setPhase] = useState("todo");
  const [deadline, setDeadline] = useState(undefined);
  const [assigneeId, setAssigneeId] = useState("");
  const [assigneeSearch, setAssigneeSearch] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!task || !open) return;

    setTitle(task.title || "");
    setDescription(task.description || "");
    setPriority(task.priority || "medium");
    setImpact(task.impact || "important");
    setPhase(task.phase || "todo");
    setDeadline(task.deadline ? new Date(task.deadline) : undefined);
    setAssigneeId(
      task.assigneeId || task.assignee?._id || task.assignee?.id || ""
    );
    setAssigneeSearch("");
    setErrors({});
  }, [task, open]);

  const filteredMembers = useMemo(() => {
    const q = assigneeSearch.trim().toLowerCase();
    if (!q) return eventMembers;
    return eventMembers.filter((m) =>
      (m.name || "").toLowerCase().includes(q)
    );
  }, [eventMembers, assigneeSearch]);

  const selectedAssignee = useMemo(
    () => eventMembers.find((m) => getId(m) === assigneeId) || null,
    [eventMembers, assigneeId]
  );

  const validate = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    } else if (title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    } else if (title.trim().length > 200) {
      newErrors.title = "Title must be less than 200 characters";
    }

    if (!description.trim()) {
      newErrors.description = "Description is required";
    } else if (description.trim().length < 3) {
      newErrors.description = "Description must be at least 3 characters";
    } else if (description.trim().length > 1000) {
      newErrors.description = "Description must be less than 1000 characters";
    }

    if (!deadline) {
      newErrors.deadline = "Deadline is required";
    } else if (
      phase !== "completed" &&
      startOfDay(deadline) < startOfDay(new Date())
    ) {
      newErrors.deadline = "Deadline cannot be in the past";
    }

    if (!assigneeId) newErrors.assignee = "Assignee is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      const taskId = getId(task);

      const payload = {
        title: title.trim(),
        description: description.trim(),
        priority,
        impact,
        phase,
        deadline: deadline.toISOString(),
        assigneeId,
      };

      const res = await API.put(`/tasks/${taskId}`, payload);

      if (onTaskUpdated) {
        onTaskUpdated(res.data);
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Update task error:", error.response?.data || error);
      alert(error?.response?.data?.message || "Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMember = (member) => {
    setAssigneeId(getId(member));
    setAssigneeSearch("");
    setErrors((prev) => ({ ...prev, assignee: undefined }));
  };

  const handleClearAssignee = () => {
    setAssigneeId("");
    setAssigneeSearch("");
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-3xl overflow-hidden p-0">
        <div className="border-b bg-gradient-to-r from-primary/10 via-background to-primary/5 px-6 py-5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl font-heading">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Pencil className="h-5 w-5" />
              </div>
              Update Task
            </DialogTitle>
          </DialogHeader>
          <p className="mt-2 text-sm text-muted-foreground">
            {currentEvent?.name
              ? `For event: ${currentEvent.name}`
              : "Adjust task details, deadline, assignee or status."}
          </p>
        </div>

        <div className="space-y-5 px-6 py-6 max-h-[70vh] overflow-y-auto">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              placeholder="Task title"
              maxLength={200}
              className="h-12 rounded-2xl"
            />
            {errors.title && (
              <p className="text-xs text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              Description <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrors((prev) => ({ ...prev, description: undefined }));
              }}
              placeholder="Task description"
              maxLength={1000}
              rows={4}
              className="rounded-2xl"
            />
            {errors.description && (
              <p className="text-xs text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Deadline */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              Deadline <span className="text-red-500">*</span>
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "h-12 w-full justify-start rounded-2xl text-left font-normal",
                    !deadline && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deadline ? format(deadline, "PPP") : "Pick a deadline"}
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={deadline}
                  onSelect={(d) => {
                    setDeadline(d);
                    setErrors((prev) => ({ ...prev, deadline: undefined }));
                  }}
                  disabled={(d) =>
                    phase !== "completed" &&
                    startOfDay(d) < startOfDay(new Date())
                  }
                  className="p-3"
                />
              </PopoverContent>
            </Popover>
            {errors.deadline && (
              <p className="text-xs text-red-500">{errors.deadline}</p>
            )}
          </div>

          {/* Priority + Impact */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">
                Priority
              </label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="h-12 rounded-2xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">
                Impact
              </label>
              <Select value={impact} onValueChange={setImpact}>
                <SelectTrigger className="h-12 rounded-2xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="supportive">Supportive</SelectItem>
                  <SelectItem value="important">Important</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Phase */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              Status
            </label>
            <Select value={phase} onValueChange={setPhase}>
              <SelectTrigger className="h-12 rounded-2xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Assignee */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-foreground">
                Assignee <span className="text-red-500">*</span>
              </label>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                {eventMembers.length} member
                {eventMembers.length === 1 ? "" : "s"}
              </span>
            </div>

            {selectedAssignee && (
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                    style={{
                      backgroundColor: selectedAssignee.avatar || "#6366f1",
                    }}
                  >
                    {getInitials(selectedAssignee.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {selectedAssignee.name || "Unnamed member"}
                    </p>
                    {selectedAssignee.email && (
                      <p className="truncate text-xs text-muted-foreground">
                        {selectedAssignee.email}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClearAssignee}
                  className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  aria-label="Clear assignee"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <Input
              placeholder="Search team members…"
              value={assigneeSearch}
              onChange={(e) => setAssigneeSearch(e.target.value)}
              className="h-12 rounded-2xl"
              disabled={eventMembers.length === 0}
            />

            <div className="max-h-48 overflow-y-auto rounded-2xl border border-border bg-card shadow-sm">
              {eventMembers.length === 0 ? (
                <div className="px-4 py-3 text-sm text-muted-foreground">
                  No team members available for this event.
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="px-4 py-3 text-sm text-muted-foreground">
                  No members match your search.
                </div>
              ) : (
                filteredMembers.map((m) => {
                  const memberId = getId(m);
                  const isSelected = memberId === assigneeId;

                  return (
                    <button
                      key={memberId}
                      type="button"
                      onClick={() => handleSelectMember(m)}
                      className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
                        isSelected ? "bg-primary/5" : "hover:bg-muted"
                      }`}
                    >
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                        style={{ backgroundColor: m.avatar || "#6366f1" }}
                      >
                        {getInitials(m.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {m.name || "Unnamed member"}
                        </p>
                        {m.email && (
                          <p className="truncate text-xs text-muted-foreground">
                            {m.email}
                          </p>
                        )}
                      </div>
                      {typeof m.taskCount === "number" && (
                        <span className="text-xs text-muted-foreground shrink-0">
                          {m.taskCount} task
                          {m.taskCount === 1 ? "" : "s"}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {errors.assignee && (
              <p className="text-xs text-red-500">{errors.assignee}</p>
            )}
          </div>

          <Button
            onClick={handleUpdate}
            disabled={loading || eventMembers.length === 0}
            className="gradient-primary h-12 w-full rounded-2xl text-white transition-all duration-200"
          >
            {loading ? "Updating..." : "Update Task"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
