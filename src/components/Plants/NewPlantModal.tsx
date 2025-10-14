import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModalDialog } from "@/components/modals/ModalDialog";
import { Plus } from "lucide-react";

export function NewPlantButton() {
  const [open, setOpen] = useState(false);
  const [plantName, setPlantName] = useState("");

  const handleSave = () => {
    console.log("Saving new plant:", plantName);
    // aquí puedes llamar a Supabase o tu servicio CRUD
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
        title="Add New Plant"
        description="Fill in the details of your new plant."
        onConfirm={handleSave}
        confirmLabel="Add Plant"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Common Name
            </label>
            <Input
              placeholder="e.g. Monstera deliciosa"
              value={plantName}
              onChange={(e) => setPlantName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Scientific Name
            </label>
            <Input placeholder="Optional" />
          </div>
        </div>
      </ModalDialog>
    </>
  );
}
