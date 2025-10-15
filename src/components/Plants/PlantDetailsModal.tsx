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
import type { Plant } from "@/data/mockPlants";
import { mockUsers } from "@/data/mockUsers";

interface PlantDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plant: Plant | null;
}

export function PlantDetailsModal({
  open,
  onOpenChange,
  plant,
}: PlantDetailsModalProps) {
  if (!plant) return null;

  const owner = mockUsers.find((u) => u.id === plant.user_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg p-0 overflow-hidden">
        <div className="flex flex-col p-5">
          {/* 📸 Image */}
          <div className="relative rounded-xl overflow-hidden mb-5">
            <img
              src={plant.image_url || "/public/imagenotfound.jpeg"}
              alt={plant.nombre_comun}
              className="object-cover w-full h-64 rounded-xl border border-border shadow-sm"
            />
            <div className="absolute top-3 left-3">
              <Badge variant={plant.disponible ? "default" : "destructive"}>
                {plant.disponible ? "Available" : "Unavailable"}
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
                <strong>Species:</strong> {plant.especie}
              </p>
            )}
            {plant.familia && (
              <p>
                <strong>Family:</strong> {plant.familia}
              </p>
            )}
            <p>
              <strong>Watering Interval:</strong>{" "}
              {plant.interval_days ? `${plant.interval_days} days` : "Not set"}
            </p>
          </div>

          {/* 👤 Owner */}
          {owner && (
            <div className="flex items-center gap-3 mt-5 p-3 rounded-lg bg-muted/50 border border-border">
              <img
                src={owner.avatar_url}
                alt={owner.username}
                className="w-10 h-10 rounded-full object-cover border border-border"
              />
              <div className="flex flex-col leading-tight">
                <span className="font-medium text-foreground">
                  @{owner.username}
                </span>
                <span className="flex items-center text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3 mr-1" />
                  {owner.city || "Unknown location"}
                </span>
              </div>
            </div>
          )}

          {/* 🔘 Actions */}
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button>Propose Swap</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
