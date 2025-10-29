import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import type { Database } from "@/types/supabase";
import { getPlantById } from "@/services/plantCrudService";
import { LoadingState } from "@/components/common/LoadingState";
import { ModalDialog } from "@/components/modals/ModalDialog";

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
    <ModalDialog
      open={open}
      onOpenChange={onOpenChange}
      title={plant?.nombre_comun || "Plant Details"}
      description={
        loading
          ? "Loading plant details..."
          : plant?.nombre_cientifico ||
            "Detailed information about the selected plant."
      }
      showFooter={false}
      size="md"
    >
      {loading ? (
        <LoadingState className="p-6" />
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
          </div>

          {/* 👤 Owner */}
          {plant.profile && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
              <img
                src={plant.profile.avatar_url || "/imagenotfound.jpeg"}
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
        </div>
      )}
    </ModalDialog>
  );
}
