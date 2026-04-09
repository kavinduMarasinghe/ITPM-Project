import { useState } from "react";
import { teamMembers } from "@/lib/mockData";
import { useEvent } from "@/lib/EventContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarDays,
  Link2,
  MessageSquare,
  Paperclip,
  User,
  Flag,
  Activity,
  Send,
} from "lucide-react";

const phaseLabels = {
  todo: "To Do",
  "in-progress": "In Progress",
  review: "Review",
  completed: "Completed",
};

export function TaskDetailDialog({
  task,
  open,
  onOpenChange,
  onUpdateTask,
}) {
  const [comment, setComment] = useState("");
  const { addComment, allTasks } = useEvent();

  const liveTask = task
    ? allTasks.find((t) => t.id === task.id) || task
    : null;

  if (!liveTask) return null;

  const handleAddComment = () => {
    if (!comment.trim()) return;

    addComment(liveTask.id, comment.trim(), teamMembers[0]);
    setComment("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <div className="flex gap-3">
            <div className="flex-1">
              <DialogTitle className="text-lg font-heading font-bold">
                {liveTask.title}
              </DialogTitle>

              <div className="flex flex-wrap gap-1.5 mt-2">
                <Badge variant="outline" className="text-[10px]">
                  {liveTask.priority} priority
                </Badge>

                <Badge variant="secondary" className="text-[10px]">
                  {liveTask.impact}
                </Badge>

                {liveTask.isOverdue && (
                  <Badge variant="destructive" className="text-[10px]">
                    Overdue
                  </Badge>
                )}

                {liveTask.isBlocked && (
                  <Badge className="text-[10px] border text-red-500">
                    <Link2 className="h-3 w-3 mr-1" /> Blocked
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 mt-3">
          {/* Description */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
              Description
            </h4>
            <p className="text-sm">{liveTask.description}</p>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs flex gap-1 items-center">
                <Flag className="h-3 w-3" /> Status
              </label>

              <Select
                value={liveTask.phase}
                onValueChange={(val) =>
                  onUpdateTask?.(liveTask.id, { phase: val })
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(phaseLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs flex gap-1 items-center">
                <User className="h-3 w-3" /> Assigned To
              </label>

              <div className="flex items-center gap-2 mt-1">
                <div className="h-6 w-6 rounded-full bg-primary text-white text-[10px] flex items-center justify-center">
                  {liveTask.assignee?.name?.[0] || "U"}
                </div>
                <span className="text-xs">{liveTask.assignee?.name}</span>
              </div>
            </div>

            <div>
              <label className="text-xs flex gap-1 items-center">
                <CalendarDays className="h-3 w-3" /> Deadline
              </label>

              <p className="text-xs mt-1">
                {new Date(liveTask.deadline).toLocaleDateString()}
              </p>
            </div>

            <div>
              <label className="text-xs">Progress</label>
              <div className="flex gap-2 items-center mt-1">
                <Progress value={liveTask.progress} className="h-2 flex-1" />
                <span className="text-xs">{liveTask.progress}%</span>
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div>
            <h4 className="text-xs flex gap-1 items-center mb-2">
              <Paperclip className="h-3 w-3" /> Attachments
            </h4>

            {liveTask.attachments > 0 ? (
              <div className="space-y-2">
                {Array.from({ length: liveTask.attachments }).map((_, i) => (
                  <div key={i} className="text-xs bg-muted p-2 rounded-lg">
                    document-{i + 1}.pdf
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No attachments</p>
            )}
          </div>

          {/* Comments */}
          <div>
            <h4 className="text-xs flex gap-1 items-center mb-2">
              <MessageSquare className="h-3 w-3" /> Comments
            </h4>

            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {liveTask.commentList?.map((c) => (
                <div key={c.id} className="text-xs bg-muted p-2 rounded-lg">
                  <strong>{c.user.name}</strong>: {c.text}
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-2">
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="flex-1 text-xs p-2 border rounded-lg"
                placeholder="Add comment..."
              />
              <Button size="sm" onClick={handleAddComment}>
                <Send className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Activity */}
          <div>
            <h4 className="text-xs flex gap-1 items-center mb-2">
              <Activity className="h-3 w-3" /> Activity
            </h4>

            <div className="space-y-2 text-xs">
              {liveTask.activityLog?.map((item) => (
                <div key={item.id}>
                  <strong>{item.user}</strong> {item.action}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}