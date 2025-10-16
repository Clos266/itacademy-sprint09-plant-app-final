import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { supabase } from "@/services/supabaseClient";
import type { Database } from "@/types/supabase";

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
  const [plant, setPlant] = useState<Plant | null>(null);
  const [owner, setOwner] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // 🪴 Fetch plant + owner info
  useEffect(() => {
    if (!plantId || !open) return;

    const fetchPlantAndOwner = async () => {
      setLoading(true);

      // 🌿 1️⃣ Obtener planta
      const { data: plantData, error: plantError } = await supabase
        .from("plants")
        .select("*")
        .eq("id", plantId)
        .single();

      if (plantError) {
        console.error("Error fetching plant:", plantError.message);
        setLoading(false);
        return;
      }

      setPlant(plantData);

      // 👤 2️⃣ Obtener dueño
      if (plantData?.user_id) {
        const { data: ownerData, error: ownerError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", plantData.user_id)
          .single();

        if (ownerError) {
          console.error("Error fetching owner:", ownerError.message);
        } else {
          setOwner(ownerData);
        }
      }

      setLoading(false);
    };

    fetchPlantAndOwner();
  }, [plantId, open]);

  if (!open || !plantId) return null;
  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="p-8 text-center text-muted-foreground">
            Cargando...
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  if (!plant) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg p-0 overflow-hidden">
        <div className="flex flex-col p-5">
          {/* 📸 Imagen */}
          <div className="relative rounded-xl overflow-hidden mb-5">
            <img
              src={plant.image_url || "/imagenotfound.jpeg"}
              alt={plant.nombre_comun}
              className="object-cover w-full h-64 rounded-xl border border-border shadow-sm"
            />
            <div className="absolute top-3 left-3">
              <Badge variant={plant.disponible ? "default" : "destructive"}>
                {plant.disponible ? "Disponible" : "No disponible"}
              </Badge>
            </div>
          </div>

          {/* 🌿 Header */}
          <DialogHeader className="text-center space-y-1 mb-3">
            <DialogTitle className="text-2xl font-semibold">
              {plant.nombre_comun}
            </DialogTitle>
            <DialogDescription className="italic text-muted-foreground">
              {plant.nombre_cientifico || "—"}
            </DialogDescription>
          </DialogHeader>

          {/* 📘 Info */}
          <div className="space-y-2 text-sm text-muted-foreground">
            {plant.especie && (
              <p>
                <strong>Especie:</strong> {plant.especie}
              </p>
            )}
            {plant.familia && (
              <p>
                <strong>Familia:</strong> {plant.familia}
              </p>
            )}
            <p>
              <strong>Riego cada:</strong>{" "}
              {plant.interval_days
                ? `${plant.interval_days} días`
                : "No definido"}
            </p>
          </div>

          {/* 👤 Dueño */}
          {owner && (
            <div className="flex items-center gap-3 mt-5 p-3 rounded-lg bg-muted/50 border border-border">
              <img
                src={owner.avatar_url || "/avatar-placeholder.png"}
                alt={owner.username || "Usuario"}
                className="w-10 h-10 rounded-full object-cover border border-border"
              />
              <div className="flex flex-col leading-tight">
                <span className="font-medium text-foreground">
                  @{owner.username || "usuario"}
                </span>
                <span className="flex items-center text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3 mr-1" />
                  {owner.ciudad || "Ubicación desconocida"}
                </span>
              </div>
            </div>
          )}

          {/* 🔘 Acciones */}
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
            <Button>Proponer intercambio</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
