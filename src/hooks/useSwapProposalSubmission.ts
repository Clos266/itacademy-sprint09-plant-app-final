import { useState, useCallback } from "react";
import { addSwapProposal } from "@/services/swapCrudService";
import { getCurrentUser } from "@/services/authService";
import { showError, showSuccess } from "@/services/toastService";
import type { Database } from "@/types/supabase";

type Plant = Database["public"]["Tables"]["plants"]["Row"];

interface SwapProposalData {
  offeredPlantId: number;
  targetPlant: Plant;
  swapPointId?: number | null;
  message: string;
}

export function useSwapProposalSubmission() {
  const [submitting, setSubmitting] = useState(false);

  const submitProposal = useCallback(async (data: SwapProposalData) => {
    try {
      setSubmitting(true);
      const user = await getCurrentUser();
      if (!user) throw new Error("No active session");

      await addSwapProposal({
        sender_id: user.id,
        receiver_id: data.targetPlant.user_id!,
        sender_plant_id: data.offeredPlantId,
        receiver_plant_id: data.targetPlant.id,
        swap_point_id: data.swapPointId ?? null,
        status: "pending",
        initialMessage: data.message,
      });

      showSuccess("Swap proposal sent!");
    } catch (err: any) {
      console.error("Error sending proposal:", err);
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
      setSubmitting(false);
    }
  }, []);

  return {
    submitting,
    submitProposal,
  };
}

export type { SwapProposalData };
