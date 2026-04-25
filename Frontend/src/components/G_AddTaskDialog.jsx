import { useState } from "react";
import API from "@/lib/api";
import { useEvent } from "@/lib/EventContext";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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

import { CalendarIcon, Plus } from "lucide-react";
import { format, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";

export function AddTaskDialog() {
  const { selectedEventId, eventMembers } = useEvent();

  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState(undefined);
  const [priority, setPriority] = useState("medium");
  const [impact, setImpact] = useState("important");
  const [assigneeId, setAssigneeId] = useState("");
  const [assigneeSearch, setAssigneeSearch] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // ✅ FIXED: safe filtering
  const filteredMembers = eventMembers.filter((m) =>
    (m.name || "").toLowerCase().includes(assigneeSearch.toLowerCase())
  );

  const validate = () => {
    const errs = {};

    if (!title.trim()) {
      errs.title = "Title is required";
    } else if (title.trim().length < 3) {
      errs.title = "Title must be at least 3 characters";
    } else if (title.trim().length > 200) {
      errs.title = "Title must be less than 200 characters";
    }

    if (!description.trim()) {
      errs.description = "Description is required";
    } else if (description.trim().length < 3) {
      errs.description = "Description must be at least 3 characters";
    } else if (description.trim().length > 1000) {
      errs.description = "Description must be less than 1000 characters";
    }

    if (!deadline) {
      errs.deadline = "Deadline is required";
    } else if (startOfDay(deadline) < startOfDay(new Date())) {
      errs.deadline = "Deadline cannot be in the past";
    }

    if (!assigneeId) errs.assignee = "Assignee is required";
    if (!selectedEventId) errs.event = "Select an event first";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      const payload = {
        title: title.trim(),
        description: description.trim(),
        phase: "todo",
        priority,
        impact,
        deadline: deadline.toISOString(),
        eventId: selectedEventId,
        assigneeId,
      };

      console.log("Creating task:", payload);

      // ✅ FIXED: real backend call
      await API.post("/tasks", payload);

      alert("Task created successfully");

      setOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Create task error:", error.response?.data || error);

      alert(
        error?.response?.data?.message ||
          "Failed to create task"
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDeadline(undefined);
    setPriority("medium");
    setImpact("important");
    setAssigneeId("");
    setAssigneeSearch("");
    setErrors({});
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button className="gradient-primary text-white gap-1.5">
          <Plus className="h-4 w-4" /> Add Task
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Title */}
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            maxLength={200}
          />
          {errors.title && <p className="text-red-500 text-xs">{errors.title}</p>}

          {/* Description */}
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Task description"
            maxLength={1000}
          />
          {errors.description && (
            <p className="text-red-500 text-xs">{errors.description}</p>
          )}

          {/* Date */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {deadline ? format(deadline, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>

            <PopoverContent>
              <Calendar
                mode="single"
                selected={deadline}
                onSelect={setDeadline}
                disabled={(d) => startOfDay(d) < startOfDay(new Date())}
              />
            </PopoverContent>
          </Popover>
          {errors.deadline && (
            <p className="text-red-500 text-xs">{errors.deadline}</p>
          )}

          {/* Assignee Search */}
          <Input
            placeholder="Search member..."
            value={assigneeSearch}
            onChange={(e) => setAssigneeSearch(e.target.value)}
          />

          {/* ✅ FIXED: show search results */}
          {assigneeSearch && (
            <div className="border rounded-lg max-h-40 overflow-y-auto">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((m) => (
                  <div
                    key={m._id || m.id}
                    className="p-2 hover:bg-muted cursor-pointer"
                    onClick={() => {
                      setAssigneeId(m._id || m.id);
                      setAssigneeSearch(m.name);
                    }}
                  >
                    {m.name}
                  </div>
                ))
              ) : (
                <div className="p-2 text-sm text-muted-foreground">
                  No members found
                </div>
              )}
            </div>
          )}

          {/* Priority */}
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>

          {/* Impact */}
          <Select value={impact} onValueChange={setImpact}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="supportive">Supportive</SelectItem>
              <SelectItem value="important">Important</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating..." : "Create Task"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}