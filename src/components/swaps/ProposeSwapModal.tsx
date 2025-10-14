import { useState } from "react";
import { ModalDialog } from "@/components/modals/ModalDialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Plant } from "@/data/mockPlants";

interface ProposeSwapModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetPlant: Plant | null; // Planta del otro usuario
  userPlants: Plant[]; // Tus plantas disponibles
  onConfirm: (proposal: {
    offeredPlantId: number;
    targetPlantId: number;
    swapPointId?: number | null;
    message?: string;
  }) => void;
}

export function ProposeSwapModal({
  open,
  onOpenChange,
  targetPlant,
  userPlants,
  onConfirm,
}: ProposeSwapModalProps) {
  const [offeredPlantId, setOfferedPlantId] = useState<number | null>(null);
  const [swapPointId, setSwapPointId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (!targetPlant || !offeredPlantId) return;
    setLoading(true);

    // 🔹 Simula una llamada a la base de datos
    setTimeout(() => {
      onConfirm({
        offeredPlantId,
        targetPlantId: targetPlant.id,
        swapPointId,
        message,
      });
      setLoading(false);
      onOpenChange(false);
    }, 1000);
  };

  return (
    <ModalDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Propose a Swap"
      description={
        targetPlant
          ? `Offer one of your plants in exchange for "${targetPlant.nombre_comun}".`
          : "Select a plant to propose an exchange."
      }
      onConfirm={handleSubmit}
      confirmLabel={loading ? "Sending..." : "Send Proposal"}
      loading={loading}
    >
      {!targetPlant ? (
        <p className="text-muted-foreground text-sm">
          No target plant selected.
        </p>
      ) : (
        <div className="space-y-4">
          {/* 🌿 Your plant */}
          <div>
            <Label>Your plant to offer</Label>
            <Select
              onValueChange={(val) => setOfferedPlantId(Number(val))}
              value={offeredPlantId ? String(offeredPlantId) : ""}
            >
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Select one of your plants..." />
              </SelectTrigger>
              <SelectContent>
                {userPlants
                  .filter((p) => p.disponible)
                  .map((plant) => (
                    <SelectItem key={plant.id} value={String(plant.id)}>
                      {plant.nombre_comun}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* 🗺️ Optional swap point */}
          <div>
            <Label>Swap point (optional)</Label>
            <Select
              onValueChange={(val) => setSwapPointId(Number(val))}
              value={swapPointId ? String(swapPointId) : ""}
            >
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Choose a meeting point..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Community Garden</SelectItem>
                <SelectItem value="2">Local Market</SelectItem>
                <SelectItem value="3">Botanical Park</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 💬 Optional message */}
          <div>
            <Label>Message (optional)</Label>
            <Textarea
              placeholder="Add a short note to the owner..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      )}
    </ModalDialog>
  );
}
