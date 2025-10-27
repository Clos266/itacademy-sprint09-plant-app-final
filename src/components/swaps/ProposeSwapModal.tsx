import { useEffect, useState, useCallback, useMemo } from "react";
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
import { LoadingState } from "@/components/common/LoadingState";
import { showError, showSuccess } from "@/services/toastService";
import { addSwapProposal } from "@/services/swapCrudService";
import { getCurrentUser } from "@/services/authService";
import { fetchSwapPoints } from "@/services/swapPointsCrudService";
import type { Database } from "@/types/supabase";

type Plant = Database["public"]["Tables"]["plants"]["Row"];
type SwapPoint = Database["public"]["Tables"]["swap_points"]["Row"];

interface ProposeSwapModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetPlant: Plant | null;
  userPlants: Plant[];
}

export function ProposeSwapModal({
  open,
  onOpenChange,
  targetPlant,
  userPlants,
}: ProposeSwapModalProps) {
  const [offeredPlantId, setOfferedPlantId] = useState<number | null>(null);
  const [swapPointId, setSwapPointId] = useState<number | null>(null);
  const [swapPoints, setSwapPoints] = useState<SwapPoint[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingPoints, setLoadingPoints] = useState(true);

  // 🧹 Reset form function
  const resetForm = useCallback(() => {
    setOfferedPlantId(null);
    setSwapPointId(null);
    setMessage("");
  }, []);

  // ✅ Form validation
  const isFormValid = useMemo(() => {
    return !!(targetPlant && offeredPlantId && message.trim().length >= 5);
  }, [targetPlant, offeredPlantId, message]);

  // 🔹 Fetch swap points al abrir el modal
  useEffect(() => {
    if (open) {
      const loadPoints = async () => {
        setLoadingPoints(true);
        const points = await fetchSwapPoints();
        setSwapPoints(points);
        setLoadingPoints(false);
      };
      loadPoints();
    }
  }, [open]);

  const handleSubmit = useCallback(async () => {
    if (!isFormValid) {
      showError(
        "Please fill in all required fields (plant selection and message with at least 5 characters)."
      );
      return;
    }

    try {
      setLoading(true);
      const user = await getCurrentUser();
      if (!user) throw new Error("No active session");

      await addSwapProposal({
        sender_id: user.id,
        receiver_id: targetPlant!.user_id!,
        sender_plant_id: offeredPlantId!,
        receiver_plant_id: targetPlant!.id,
        swap_point_id: swapPointId ?? null,
        status: "pending",
        initialMessage: message,
      });

      showSuccess("Swap proposal sent!");
      resetForm();
      onOpenChange(false);
    } catch (err: any) {
      console.error("Error sending proposal:", err);

      // Enhanced error handling with specific messages
      let errorMessage = "Failed to send proposal";
      if (err?.message?.includes("auth")) {
        errorMessage = "Authentication error. Please log in again.";
      } else if (err?.message?.includes("network")) {
        errorMessage = "Network error. Please check your connection.";
      } else if (err?.message) {
        errorMessage = err.message;
      }

      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [
    isFormValid,
    targetPlant,
    offeredPlantId,
    message,
    swapPointId,
    resetForm,
  ]);

  // 🚀 Memoized handlers for better performance
  const handlePlantChange = useCallback((value: string) => {
    setOfferedPlantId(Number(value));
  }, []);

  const handleSwapPointChange = useCallback((value: string) => {
    setSwapPointId(Number(value));
  }, []);

  const handleMessageChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setMessage(e.target.value);
    },
    []
  );

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
          {/*  Your plant */}
          <div>
            <Label>Your plant to offer</Label>
            <Select
              onValueChange={handlePlantChange}
              value={offeredPlantId ? String(offeredPlantId) : ""}
              disabled={loading}
            >
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Select one of your plants..." />
              </SelectTrigger>
              <SelectContent>
                {userPlants.length === 0 ? (
                  <SelectItem value="none" disabled>
                    You have no available plants for swap
                  </SelectItem>
                ) : (
                  userPlants.map((plant) => (
                    <SelectItem key={plant.id} value={String(plant.id)}>
                      {plant.nombre_comun}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/*  Swap point (optional) */}
          <div>
            <Label>Swap point (optional)</Label>
            {loadingPoints ? (
              <LoadingState size="sm" message="Loading swap points..." />
            ) : (
              <Select
                onValueChange={handleSwapPointChange}
                value={swapPointId ? String(swapPointId) : ""}
                disabled={loading}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Choose a meeting point..." />
                </SelectTrigger>
                <SelectContent>
                  {swapPoints.length > 0 ? (
                    swapPoints.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.name} — {p.city}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No swap points available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          {/*  Message */}
          <div>
            <Label>Message </Label>
            <Textarea
              placeholder="Add a short note to the owner (minimum 5 characters)..."
              value={message}
              onChange={handleMessageChange}
              className="mt-1"
              disabled={loading}
            />
          </div>
        </div>
      )}
    </ModalDialog>
  );
}
