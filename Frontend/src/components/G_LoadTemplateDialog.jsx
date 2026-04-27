import { useState } from "react";
import { useEvent } from "@/lib/EventContext";
import { eventTemplates } from "@/lib/eventTemplates";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Check, Loader2 } from "lucide-react";

export function LoadTemplateDialog() {
  const { selectedEventId, eventMembers, addTask } = useEvent();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLoadTemplate = async () => {
    if (!selected) return;
    if (!selectedEventId) return;
    if (!eventMembers.length) return;

    setLoading(true);

    try {
      for (let index = 0; index < selected.tasks.length; index++) {
        const templateTask = selected.tasks[index];
        const assignee = eventMembers[index % eventMembers.length];

        const deadline = new Date();
        deadline.setDate(deadline.getDate() + 7 + index * 2);

        await addTask({
          title: templateTask.title,
          description: templateTask.description,
          phase: "todo",
          priority: templateTask.priority,
          impact: templateTask.impact,
          assigneeId: assignee.id,
          deadline: deadline.toISOString(),
          eventId: selectedEventId,
        });
      }

      setOpen(false);
      setSelected(null);
    } catch (error) {
      console.error("Failed to load template tasks:", error);
      alert("Failed to load template");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setSelected(null);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <FileText className="h-3.5 w-3.5" />
          Load Template
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading">
            Load Event Preparation Template
          </DialogTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            Choose a template to auto-generate standard tasks for your event.
          </p>
        </DialogHeader>

        <div className="mt-2 grid grid-cols-2 gap-3">
          {eventTemplates.map((template) => (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all hover:shadow-card-hover ${
                selected?.id === template.id
                  ? "ring-2 ring-primary shadow-card-hover"
                  : "shadow-card"
              }`}
              onClick={() => setSelected(template)}
            >
              <CardContent className="p-4">
                <div className="mb-2 flex items-center gap-2.5">
                  <span className="text-2xl">{template.icon}</span>

                  <div>
                    <h4 className="text-sm font-heading font-bold text-foreground">
                      {template.name}
                    </h4>
                    <p className="text-[10px] text-muted-foreground">
                      {template.tasks.length} tasks
                    </p>
                  </div>

                  {selected?.id === template.id && (
                    <Check className="ml-auto h-4 w-4 text-primary" />
                  )}
                </div>

                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  {template.description}
                </p>

                <div className="mt-2 flex flex-wrap gap-1">
                  {template.tasks.slice(0, 3).map((t, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="px-1.5 py-0 text-[9px]"
                    >
                      {t.title}
                    </Badge>
                  ))}

                  {template.tasks.length > 3 && (
                    <Badge
                      variant="outline"
                      className="px-1.5 py-0 text-[9px]"
                    >
                      +{template.tasks.length - 3} more
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button
          onClick={handleLoadTemplate}
          disabled={!selected || loading}
          className="mt-2 w-full gradient-primary text-primary-foreground"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Tasks...
            </>
          ) : (
            <>Load {selected ? `${selected.tasks.length} Tasks` : "Template"}</>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}