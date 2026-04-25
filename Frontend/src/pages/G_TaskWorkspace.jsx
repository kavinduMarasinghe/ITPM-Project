import { useMemo, useState } from "react";
import { useEvent } from "@/lib/EventContext";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TaskDetailDialog } from "@/components/G_TaskDetailDialog";
import { AddTaskDialog } from "@/components/G_AddTaskDialog";
import { UpdateTaskDialog } from "@/components/G_UpdateTaskDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  CalendarDays,
  CheckCircle2,
  ListTodo,
  FolderKanban,
  Pencil,
} from "lucide-react";

const getId = (item) => item?._id || item?.id || "";

const columns = [
  { id: "todo", label: "To Do" },
  { id: "in-progress", label: "In Progress" },
  { id: "review", label: "Review" },
  { id: "completed", label: "Completed" },
];

const columnStyles = {
  todo: {
    header: "text-slate-600",
    badge: "bg-slate-100 text-slate-700",
    border: "border-slate-200",
    bg: "bg-slate-50/80",
  },
  "in-progress": {
    header: "text-primary",
    badge: "bg-primary/10 text-primary",
    border: "border-primary/20",
    bg: "bg-primary/5",
  },
  review: {
    header: "text-warning",
    badge: "bg-warning/10 text-warning",
    border: "border-warning/20",
    bg: "bg-warning/5",
  },
  completed: {
    header: "text-success",
    badge: "bg-success/10 text-success",
    border: "border-success/20",
    bg: "bg-success/5",
  },
};

function TaskCard({
  task,
  onDragStart,
  onClick,
  onQuickMove,
  onDelete,
  onEdit,
}) {
  const taskId = getId(task);

  return (
    <Card
      draggable
      onDragStart={(e) => onDragStart(e, taskId)}
      onClick={onClick}
      className="cursor-grab border border-border/60 shadow-card hover:shadow-card-hover transition-all hover:-translate-y-0.5"
    >
      <CardContent className="p-3 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-foreground line-clamp-2">
              {task.title}
            </h4>
            {task.description && (
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                {task.description}
              </p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <button className="shrink-0 rounded-md p-1 hover:bg-muted">
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(task);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Update
              </DropdownMenuItem>

              {columns
                .filter((c) => c.id !== task.phase)
                .map((c) => (
                  <DropdownMenuItem
                    key={c.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuickMove(taskId, c.id);
                    }}
                  >
                    Move to {c.label}
                  </DropdownMenuItem>
                ))}

              <DropdownMenuItem
                className="text-red-500 focus:text-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(taskId);
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Progress value={task.progress || 0} className="h-1.5" />

        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>
              {task.deadline
                ? new Date(task.deadline).toLocaleDateString()
                : "No deadline"}
            </span>
          </div>

          <span>{task.comments || 0} 💬</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TaskWorkspace() {
  const {
    selectedEventId,
    setSelectedEventId,
    eventTasks,
    moveTask,
    updateTask,
    deleteTask,
    userEvents,
    allSocieties,
  } = useEvent();

  const [selectedTask, setSelectedTask] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const getSociety = (event) => {
    const societyValue = event?.societyId;
    const socId =
      typeof societyValue === "object"
        ? getId(societyValue)
        : String(societyValue || "");
    return allSocieties.find((s) => getId(s) === socId);
  };

  const completedCount = eventTasks.filter(
    (t) => t.phase === "completed"
  ).length;

  const completionPct =
    eventTasks.length > 0
      ? Math.round((completedCount / eventTasks.length) * 100)
      : 0;

  const grouped = useMemo(() => {
    const map = {};
    columns.forEach((c) => {
      map[c.id] = [];
    });
    eventTasks.forEach((t) => {
      if (map[t.phase]) {
        map[t.phase].push(t);
      }
    });
    return map;
  }, [eventTasks]);

  const handleDragStart = (e, id) => {
    e.dataTransfer.setData("taskId", id);
  };

  const handleDrop = (e, phase) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (!taskId) return;
    moveTask(taskId, phase);
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setDetailOpen(true);
  };

  const handleTaskEdit = (task) => {
    setSelectedTask(task);
    setEditOpen(true);
  };

  const handleTaskUpdated = (updatedTask) => {
    updateTask(getId(updatedTask), updatedTask);
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <FolderKanban className="h-6 w-6 text-primary" />
            Task Board
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage tasks across workflow stages
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Select value={selectedEventId} onValueChange={setSelectedEventId}>
            <SelectTrigger className="w-full sm:w-[280px]">
              <SelectValue placeholder="Select an event" />
            </SelectTrigger>

            <SelectContent>
              {userEvents.map((ev) => {
                const eventId = getId(ev);
                const soc = getSociety(ev);

                return (
                  <SelectItem key={eventId} value={eventId}>
                    {soc?.icon} {ev.name}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <AddTaskDialog />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="shadow-card">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ListTodo className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {eventTasks.length}
              </p>
              <p className="text-xs text-muted-foreground">Total Tasks</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {completedCount}
              </p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Progress</p>
              <p className="text-sm font-semibold text-foreground">
                {completionPct}%
              </p>
            </div>
            <Progress value={completionPct} className="h-2.5" />
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {columns.map((col) => {
          const style = columnStyles[col.id];
          const taskCount = grouped[col.id]?.length || 0;

          return (
            <div
              key={col.id}
              className="min-w-[300px] max-w-[300px] flex-shrink-0"
              onDrop={(e) => handleDrop(e, col.id)}
              onDragOver={(e) => e.preventDefault()}
            >
              <div
                className={`h-full rounded-2xl border ${style.border} ${style.bg} p-3`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className={`text-sm font-bold ${style.header}`}>
                    {col.label}
                  </h3>
                  <span
                    className={`rounded-full px-2 py-1 text-[11px] font-semibold ${style.badge}`}
                  >
                    {taskCount}
                  </span>
                </div>

                <div className="min-h-[420px] space-y-3">
                  {grouped[col.id]?.length > 0 ? (
                    grouped[col.id].map((task) => (
                      <TaskCard
                        key={getId(task)}
                        task={task}
                        onDragStart={handleDragStart}
                        onClick={() => handleTaskClick(task)}
                        onEdit={handleTaskEdit}
                        onQuickMove={moveTask}
                        onDelete={deleteTask}
                      />
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-border bg-background/60 p-4 text-center text-xs text-muted-foreground">
                      No tasks in {col.label.toLowerCase()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <TaskDetailDialog
        task={selectedTask}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onUpdateTask={updateTask}
      />

      <UpdateTaskDialog
        task={selectedTask}
        open={editOpen}
        onOpenChange={setEditOpen}
        onTaskUpdated={handleTaskUpdated}
      />
    </div>
  );
}