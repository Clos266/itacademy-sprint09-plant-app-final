import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import type { Database } from "@/types/supabase";
import { getPlantById } from "@/services/plantCrudService";

type Plant = Database["public"]["Tables"]["plants"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface PlantDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plantId: number | null;
}

export function PlantDetailsModal({
  open,
  onOpenChange,
  plantId,
}: PlantDetailsModalProps) {
  const [plant, setPlant] = useState<
    (Plant & { profile?: Profile | null }) | null
  >(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!plantId || !open) return;

    const loadPlant = async () => {
      setLoading(true);
      try {
        const data = await getPlantById(plantId, true);
        setPlant(data);
      } catch (err) {
        console.error("Error loading plant details:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPlant();
  }, [plantId, open]);

  if (!open || !plantId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {/* 🔹 Accessibility */}
        <VisuallyHidden>
          <DialogTitle>Plant Details</DialogTitle>
          <DialogDescription>
            Detailed information about the selected plant.
          </DialogDescription>
        </VisuallyHidden>

        {loading ? (
          <div className="p-6 text-center text-muted-foreground">
            Loading...
          </div>
        ) : !plant ? (
          <div className="p-6 text-center text-destructive">
            Could not load this plant.
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            {/* 📸 Image */}
            <div className="relative mx-auto aspect-square w-full max-w-[220px] rounded-xl overflow-hidden border border-border bg-muted">
              <img
                src={plant.image_url || "/imagenotfound.jpeg"}
                alt={plant.nombre_comun}
                className="object-cover w-full h-full"
              />
              <div className="absolute top-2 left-2">
                <Badge variant={plant.disponible ? "default" : "destructive"}>
                  {plant.disponible ? "Available" : "Unavailable"}
                </Badge>
              </div>
            </div>

            {/* 🌿 Header */}
            <DialogHeader>
              <DialogTitle>{plant.nombre_comun}</DialogTitle>
              <DialogDescription>
                {plant.nombre_cientifico || "—"}
              </DialogDescription>
            </DialogHeader>

            {/* 📘 Info */}
            <div className="space-y-1 text-sm text-muted-foreground">
              {plant.especie && (
                <p>
                  <strong>Species:</strong> {plant.especie}
                </p>
              )}
              {plant.familia && (
                <p>
                  <strong>Family:</strong> {plant.familia}
                </p>
              )}
              <p>
                <strong>Water every:</strong>{" "}
                {plant.interval_days
                  ? `${plant.interval_days} days`
                  : "Not defined"}
              </p>
            </div>

            {/* 👤 Owner */}
            {plant.profile && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                <img
                  src={plant.profile.avatar_url || "/avatar-placeholder.png"}
                  alt={plant.profile.username || "User"}
                  className="w-9 h-9 rounded-full object-cover border border-border"
                />
                <div className="flex flex-col leading-tight">
                  <span className="font-medium text-foreground">
                    @{plant.profile.username || "user"}
                  </span>
                  <span className="flex items-center text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3 mr-1" />
                    {plant.profile.ciudad || "Unknown location"}
                  </span>
                </div>
              </div>
            )}

            {/* 🔘 Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button>Propose swap</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
