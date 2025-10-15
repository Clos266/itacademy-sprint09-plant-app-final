import { useState, useEffect } from "react";
import { ModalDialog } from "@/components/modals/ModalDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import type { Plant } from "@/services/plantCrudService";

interface EditPlantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plant: Plant | null;
  onSave: (id: number, data: Partial<Plant>) => void;
}

export function EditPlantModal({
  open,
  onOpenChange,
  plant,
  onSave,
}: EditPlantModalProps) {
  const [formData, setFormData] = useState<Partial<Plant>>({});

  // Load plant data into state when modal opens
  useEffect(() => {
    if (plant) setFormData(plant);
  }, [plant]);

  const handleChange = (key: keyof Plant, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (!plant) return;
    onSave(plant.id, formData);
    onOpenChange(false);
  };

  return (
    <ModalDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Plant"
      description="Update your plant details below."
      onConfirm={handleSubmit}
      confirmLabel="Save Changes"
    >
      {plant ? (
        <div className="space-y-4">
          <div>
            <Label htmlFor="nombre_comun">Common Name</Label>
            <Input
              id="nombre_comun"
              value={formData.nombre_comun || ""}
              onChange={(e) => handleChange("nombre_comun", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="nombre_cientifico">Scientific Name</Label>
            <Input
              id="nombre_cientifico"
              value={formData.nombre_cientifico || ""}
              onChange={(e) =>
                handleChange("nombre_cientifico", e.target.value)
              }
            />
          </div>

          <div>
            <Label htmlFor="familia">Family</Label>
            <Input
              id="familia"
              value={formData.familia || ""}
              onChange={(e) => handleChange("familia", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="especie">Species</Label>
            <Input
              id="especie"
              value={formData.especie || ""}
              onChange={(e) => handleChange("especie", e.target.value)}
            />
          </div>

          {/* <div>
            <Label htmlFor="notas">Notes</Label>
            <Textarea
              id="notas"
              value={formData.notas || ""}
              onChange={(e) => handleChange("notas", e.target.value)}
            />
          </div> */}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="disponible"
              checked={formData.disponible ?? false}
              onCheckedChange={(checked) =>
                handleChange("disponible", Boolean(checked))
              }
            />
            <Label htmlFor="disponible">Available for swap</Label>
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          No plant selected for editing.
        </p>
      )}
    </ModalDialog>
  );
}
