import { useState, useEffect } from "react";
import { ModalDialog } from "@/components/modals/ModalDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUploader } from "@/components/common/ImageUploader";
import type { Plant } from "@/types/supabase";
import type { EditPlantModalProps, PlantFormData } from "./Plants.types";

export function EditPlantModal({
  open,
  onOpenChange,
  plant,
  onSave,
}: EditPlantModalProps) {
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<Partial<PlantFormData>>({});

  useEffect(() => {
    if (plant) {
      setFormData({
        nombre_comun: plant.nombre_comun,
        nombre_cientifico: plant.nombre_cientifico || "",
        familia: plant.familia || "",
        especie: plant.especie || "",
        disponible: plant.disponible,
        interval_days: plant.interval_days,
        last_watered: plant.last_watered,
        image_url: plant.image_url || "",
      });
    }
  }, [plant]);

  const handleChange = (key: keyof PlantFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!plant) return;
    await onSave(plant.id, formData);
    onOpenChange(false);
  };

  return (
    <ModalDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Plant"
      onConfirm={handleSave}
      confirmLabel="Save Changes"
      loading={uploading}
    >
      {/* 🖼️ Cambiar imagen */}

      {plant ? (
        <div className="max-w-sm sm:max-w-md lg:max-w-md mx-auto max-h-[75vh] overflow-y-auto space-y-4">
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
              <Label className="p-2" htmlFor="nombre_comun">
                Common Name
              </Label>
              <Input
                id="nombre_comun"
                placeholder="e.g. Monstera"
                value={formData.nombre_comun || ""}
                onChange={(e) => handleChange("nombre_comun", e.target.value)}
              />
            </div>

            <div>
              <Label className="p-2" htmlFor="nombre_cientifico">
                Scientific Name
              </Label>
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
              <Label className="p-2" htmlFor="especie">
                Species
              </Label>
              <Input
                id="especie"
                placeholder="Monstera"
                value={formData.especie || ""}
                onChange={(e) => handleChange("especie", e.target.value)}
              />
            </div>

            <div>
              <Label className="p-2" htmlFor="familia">
                Family
              </Label>
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
