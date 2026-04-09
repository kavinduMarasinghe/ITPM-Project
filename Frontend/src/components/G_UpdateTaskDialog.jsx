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

import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const getId = (item) => item?._id || item?.id || "";

export function UpdateTaskDialog({ task, open, onOpenChange, onTaskUpdated }) {
  const { eventMembers } = useEvent();

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
    setAssigneeId(task.assigneeId || task.assignee?._id || task.assignee?.id || "");
    setAssigneeSearch(task.assignee?.name || "");
    setErrors({});
  }, [task, open]);

  const filteredMembers = useMemo(() => {
    return eventMembers.filter((member) =>
      (member.name || "").toLowerCase().includes(assigneeSearch.toLowerCase())
    );
  }, [eventMembers, assigneeSearch]);

  const validate = () => {
    const newErrors = {};

    if (!title.trim()) newErrors.title = "Title is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!deadline) newErrors.deadline = "Deadline is required";
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

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle>Update Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-500">{errors.title}</p>
            )}
          </div>

          <div>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task description"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-500">{errors.description}</p>
            )}
          </div>

          <div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !deadline && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deadline ? format(deadline, "PPP") : "Pick a deadline"}
                </Button>
              </PopoverTrigger>

              <PopoverContent className="p-0">
                <Calendar
                  mode="single"
                  selected={deadline}
                  onSelect={setDeadline}
                />
              </PopoverContent>
            </Popover>
            {errors.deadline && (
              <p className="mt-1 text-xs text-red-500">{errors.deadline}</p>
            )}
          </div>

          <div>
            <Input
              placeholder="Search member..."
              value={assigneeSearch}
              onChange={(e) => setAssigneeSearch(e.target.value)}
            />

            {assigneeSearch && (
              <div className="mt-2 max-h-40 overflow-y-auto rounded-lg border">
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((member) => {
                    const memberId = getId(member);
                    return (
                      <div
                        key={memberId}
                        className="cursor-pointer px-3 py-2 hover:bg-muted"
                        onClick={() => {
                          setAssigneeId(memberId);
                          setAssigneeSearch(member.name);
                          setErrors((prev) => ({ ...prev, assignee: undefined }));
                        }}
                      >
                        {member.name}
                      </div>
                    );
                  })
                ) : (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    No members found
                  </div>
                )}
              </div>
            )}

            {errors.assignee && (
              <p className="mt-1 text-xs text-red-500">{errors.assignee}</p>
            )}
          </div>

          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>

          <Select value={impact} onValueChange={setImpact}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="supportive">Supportive</SelectItem>
              <SelectItem value="important">Important</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>

          <Select value={phase} onValueChange={setPhase}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={handleUpdate} disabled={loading} className="w-full">
            {loading ? "Updating..." : "Update Task"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}