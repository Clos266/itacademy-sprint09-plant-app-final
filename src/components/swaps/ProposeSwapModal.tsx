import { useCallback } from "react";
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
import { useSwapProposalForm } from "@/hooks/useSwapProposalForm";
import { useSwapPoints } from "@/hooks/useSwapPoints";
import { useSwapProposalSubmission } from "@/hooks/useSwapProposalSubmission";
import type { Database } from "@/types/supabase";

type Plant = Database["public"]["Tables"]["plants"]["Row"];

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
  const {
    formData,
    isValid,
    resetForm,
    handlePlantChange,
    handleSwapPointChange,
    handleMessageChange,
  } = useSwapProposalForm({ targetPlant });

  const { swapPoints, loading: loadingPoints } = useSwapPoints();

  const { submitting, submitProposal } = useSwapProposalSubmission();

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      onOpenChange(nextOpen);
      if (!nextOpen) {
        resetForm();
      }
    },
    [onOpenChange, resetForm]
  );

  const handleSubmit = useCallback(async () => {
    if (!isValid || !targetPlant) {
      return;
    }

    await submitProposal({
      offeredPlantId: formData.offeredPlantId!,
      targetPlant,
      swapPointId: formData.swapPointId,
      message: formData.message,
    });

    onOpenChange(false);
  }, [isValid, targetPlant, formData, submitProposal, onOpenChange]);

  return (
    <ModalDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Propose a Swap"
      description={
        targetPlant
          ? `Offer one of your plants in exchange for "${targetPlant.nombre_comun}".`
          : "Select a plant to propose an exchange."
      }
      onConfirm={isValid ? handleSubmit : undefined}
      confirmLabel="Send Proposal"
      loading={submitting}
      loadingText="Sending..."
      size="md"
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
              value={
                formData.offeredPlantId ? String(formData.offeredPlantId) : ""
              }
              disabled={submitting}
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

          <div>
            <Label>Swap point (optional)</Label>
            {loadingPoints ? (
              <LoadingState size="sm" message="Loading swap points..." />
            ) : (
              <Select
                onValueChange={handleSwapPointChange}
                value={formData.swapPointId ? String(formData.swapPointId) : ""}
                disabled={submitting}
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

          <div>
            <Label>Message </Label>
            <Textarea
              placeholder="Add a short note to the owner (minimum 5 characters)..."
              value={formData.message}
              onChange={handleMessageChange}
              className="mt-1"
              disabled={submitting}
            />
          </div>
        </div>
      )}
    </ModalDialog>
  );
}
