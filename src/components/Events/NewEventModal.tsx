import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ModalDialog } from "@/components/modals/ModalDialog";
import { Plus } from "lucide-react";

export function NewEventButton() {
  const [open, setOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState("");

  const handleCreate = () => {
    console.log("Creating event:", eventTitle);
    setOpen(false);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus />
      </Button>

      <ModalDialog
        open={open}
        onOpenChange={setOpen}
        title="Create New Event"
        description="Share a new community plant swap or event."
        onConfirm={handleCreate}
        confirmLabel="Create Event"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Event Title
            </label>
            <Input
              placeholder="e.g. Autumn Plant Swap"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <Input placeholder="City or address" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <Textarea placeholder="Describe your event..." />
          </div>
        </div>
      </ModalDialog>
    </>
  );
}
