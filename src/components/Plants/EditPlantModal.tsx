import { useState, useEffect } from "react";
import { ModalDialog } from "@/components/modals/ModalDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { Plant } from "@/types/supabase";
import { ImageUploader } from "@/components/common/ImageUploader";

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
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (plant) setFormData(plant);
  }, [plant]);

  const handleChange = (key: keyof Plant, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (!plant || uploading) return;
    onSave(plant.id, formData);
    // No cerramos aquí, dejamos que el componente padre lo maneje después del éxito
  };

  return (
    <ModalDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Plant"
      description={
        plant
          ? `Editing ${plant.nombre_comun || "plant"}`
          : "Select a plant to edit"
      }
      onConfirm={handleSubmit}
      confirmLabel="Save Changes"
      loading={uploading}
      loadingText="Saving..."
      size="md"
    >
      {/* 🖼️ Cambiar imagen */}

      {plant ? (
        <div className="space-y-4">
          {/* 🧱 Grid compacto 2×2 */}
          <div className="pt-2">
            <ImageUploader
              bucket="plants"
              pathPrefix={`plants/${plant.id}`}
              currentUrl={formData.image_url ?? null}
              label="Change Image"
              onUpload={(publicUrl: string) => {
                setUploading(false);
                handleChange("image_url", publicUrl);
              }}
            />
          </div>
          {/* ✅ Disponible para intercambio */}
          <div className="flex items-center gap-2 pt-1">
            <Checkbox
              id="disponible"
              checked={formData.disponible ?? false}
              onCheckedChange={(checked) =>
                handleChange("disponible", Boolean(checked))
              }
            />
            <Label htmlFor="disponible">Available for swap</Label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="nombre_comun">Common Name</Label>
              <Input
                id="nombre_comun"
                placeholder="e.g. Monstera"
                value={formData.nombre_comun || ""}
                onChange={(e) => handleChange("nombre_comun", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="nombre_cientifico">Scientific Name</Label>
              <Input
                id="nombre_cientifico"
                placeholder="Auto-filled if known"
                value={formData.nombre_cientifico || ""}
                onChange={(e) =>
                  handleChange("nombre_cientifico", e.target.value)
                }
              />
            </div>

            <div>
              <Label htmlFor="especie">Species</Label>
              <Input
                id="especie"
                placeholder="Monstera"
                value={formData.especie || ""}
                onChange={(e) => handleChange("especie", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="familia">Family</Label>
              <Input
                id="familia"
                placeholder="Araceae"
                value={formData.familia || ""}
                onChange={(e) => handleChange("familia", e.target.value)}
              />
            </div>
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
