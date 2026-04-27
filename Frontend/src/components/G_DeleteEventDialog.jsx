import { useState } from "react";
import API from "@/lib/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function DeleteEventDialog({ event }) {
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e) => {
    e.preventDefault();

    try {
      setDeleting(true);

      const eventId = event?._id || event?.id;

      await API.delete(`/g-events/${eventId}`);

      toast({
        title: "Event Deleted",
        description: `${event.name} was deleted successfully.`,
      });

      window.location.reload();
    } catch (error) {
      console.error("Delete event error:", error.response?.data || error);

      toast({
        title: "Delete failed",
        description:
          error?.response?.data?.message ||
          "Something went wrong while deleting the event.",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="rounded-2xl max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>

            <div>
              <AlertDialogTitle className="text-lg font-bold">
                Delete Event?
              </AlertDialogTitle>
              <p className="text-xs text-muted-foreground">
                This action cannot be undone
              </p>
            </div>
          </div>

          <AlertDialogDescription className="mt-3 text-sm">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              {event.name}
            </span>
            ? This will remove all related data permanently.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-4 flex gap-2">
          <AlertDialogCancel disabled={deleting} className="rounded-xl">
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all"
          >
            {deleting ? "Deleting..." : "Delete Event"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}