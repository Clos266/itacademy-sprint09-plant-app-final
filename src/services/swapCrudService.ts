import { supabase } from "./supabaseClient";
import type { Database } from "@/types/supabase";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { showError, showSuccess } from "@/services/toastService";

export type Swap = Database["public"]["Tables"]["swaps"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Plant = Database["public"]["Tables"]["plants"]["Row"];

export type SwapInsert = Omit<
  Swap,
  "id" | "created_at" | "updated_at" | "status"
> & { status?: Swap["status"] };

export type SwapUpdate = Partial<Swap>;

export interface FullSwap extends Swap {
  sender: Profile | null;
  receiver: Profile | null;
  senderPlant: Plant | null;
  receiverPlant: Plant | null;
}

export interface SwapActionParams {
  swapId: number;
  senderPlantId?: number;
  receiverPlantId?: number;
  userId?: string;
}

export interface SwapProposalParams {
  sender_id: string;
  receiver_id: string;
  sender_plant_id: number;
  receiver_plant_id: number;
  swap_point_id?: number | null;
  status?: Swap["status"];
  initialMessage?: string;
}

const TABLES = {
  SWAPS: "swaps",
  MESSAGES: "swap_messages",
  POINTS: "swap_points",
  PLANTS: "plants",
  PROFILES: "profiles",
} as const;

export const SWAP_STATUS_MAPPINGS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  COMPLETED: "completed",
} as const;

export async function fetchSwapsWithRelations(
  userId?: string
): Promise<FullSwap[]> {
  try {
    let query = supabase
      .from(TABLES.SWAPS)
      .select(
        `
        *,
        sender:sender_id(*),
        receiver:receiver_id(*),
        senderPlant:sender_plant_id(*),
        receiverPlant:receiver_plant_id(*)
      `
      )
      .order("created_at", { ascending: false });

    if (userId) {
      query = query.or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching swaps with relations:", error.message);
      throw new Error(`Failed to fetch swaps: ${error.message}`);
    }

    return (data || []).map((s: any) => ({
      ...s,
      sender: s.sender || null,
      receiver: s.receiver || null,
      senderPlant: s.senderPlant || null,
      receiverPlant: s.receiverPlant || null,
    })) as FullSwap[];
  } catch (error) {
    console.error("Service error in fetchSwapsWithRelations:", error);
    throw error;
  }
}

export async function addSwapProposal(
  params: SwapProposalParams
): Promise<Swap> {
  try {
    const {
      sender_id,
      receiver_id,
      sender_plant_id,
      receiver_plant_id,
      swap_point_id = null,
      status = SWAP_STATUS_MAPPINGS.PENDING,
      initialMessage,
    } = params;

    if (!sender_id || !receiver_id || !sender_plant_id || !receiver_plant_id) {
      throw new Error("Missing required swap proposal parameters");
    }

    const { data, error } = await supabase
      .from(TABLES.SWAPS)
      .insert({
        sender_id,
        receiver_id,
        sender_plant_id,
        receiver_plant_id,
        swap_point_id,
        status,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating swap proposal:", error.message);
      showError("Failed to send swap proposal.");
      throw new Error(`Swap proposal failed: ${error.message}`);
    }

    if (initialMessage?.trim()) {
      try {
        await supabase.from(TABLES.MESSAGES).insert({
          swap_id: data.id,
          sender_id,
          message: initialMessage.trim(),
        });
      } catch (msgError) {
        console.warn(
          "Failed to add initial message, but swap was created:",
          msgError
        );
      }
    }

    showSuccess("Swap proposal sent!");
    return data;
  } catch (error) {
    console.error("Service error in addSwapProposal:", error);
    throw error;
  }
}

export async function acceptSwapProposal(
  params: SwapActionParams
): Promise<Swap> {
  try {
    const { swapId, senderPlantId, receiverPlantId } = params;

    const result = await updateSwapStatusWithAvailability(
      swapId,
      SWAP_STATUS_MAPPINGS.ACCEPTED,
      senderPlantId,
      receiverPlantId
    );

    if (!result.success) {
      throw new Error("Failed to update swap status with plant availability");
    }

    const { data, error } = await supabase
      .from(TABLES.SWAPS)
      .select("*")
      .eq("id", swapId)
      .single();

    if (error) throw new Error(error.message);

    showSuccess("Swap accepted successfully!");
    return data;
  } catch (error) {
    console.error("Error accepting swap:", error);
    showError("Failed to accept swap");
    throw error;
  }
}

export async function declineSwapProposal(
  params: SwapActionParams
): Promise<Swap> {
  try {
    const { swapId, senderPlantId, receiverPlantId } = params;

    const result = await updateSwapStatusWithAvailability(
      swapId,
      SWAP_STATUS_MAPPINGS.REJECTED,
      senderPlantId,
      receiverPlantId
    );

    if (!result.success) {
      throw new Error("Failed to update swap status with plant availability");
    }

    const { data, error } = await supabase
      .from(TABLES.SWAPS)
      .select("*")
      .eq("id", swapId)
      .single();

    if (error) throw new Error(error.message);

    showSuccess("Swap declined successfully");
    return data;
  } catch (error) {
    console.error("Error declining swap:", error);
    showError("Failed to decline swap");
    throw error;
  }
}

export async function completeSwapProposal(
  params: SwapActionParams
): Promise<Swap> {
  try {
    const { swapId, senderPlantId, receiverPlantId } = params;

    const result = await updateSwapStatusWithAvailability(
      swapId,
      SWAP_STATUS_MAPPINGS.COMPLETED,
      senderPlantId,
      receiverPlantId
    );

    if (!result.success) {
      throw new Error("Failed to complete swap");
    }

    const { data, error } = await supabase
      .from(TABLES.SWAPS)
      .select("*")
      .eq("id", swapId)
      .single();

    if (error) throw new Error(error.message);

    showSuccess("Swap completed successfully!");
    return data;
  } catch (error) {
    console.error("Error completing swap:", error);
    showError("Failed to complete swap");
    throw error;
  }
}

export async function cancelSwapProposal(swapId: number): Promise<void> {
  try {
    const { error } = await supabase
      .from(TABLES.SWAPS)
      .delete()
      .eq("id", swapId);

    if (error) throw new Error(error.message);

    showSuccess("Swap cancelled successfully");
  } catch (error) {
    console.error("Error cancelling swap:", error);
    showError("Failed to cancel swap");
    throw error;
  }
}

export function subscribeToUserSwaps(
  userId: string,
  onChange: (payload: RealtimePostgresChangesPayload<Swap>) => void
) {
  if (!userId) return () => {};

  const channel = supabase
    .channel(`swaps-user-${userId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: TABLES.SWAPS },
      (payload) => {
        const rec = (payload.new || payload.old) as Swap | null;
        if (!rec) return;

        // Only trigger for swaps involving this user
        if (rec.sender_id === userId || rec.receiver_id === userId) {
          onChange(payload as RealtimePostgresChangesPayload<Swap>);
        }
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}

export async function updateSwapStatusWithAvailability(
  swapId: number,
  status: "accepted" | "rejected" | "pending" | "completed",
  senderPlantId?: number,
  receiverPlantId?: number
): Promise<{ success: boolean }> {
  try {
    // Update swap status with timestamp
    const { error: swapError } = await supabase
      .from(TABLES.SWAPS)
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", swapId);

    if (swapError) {
      console.error("Error updating swap status:", swapError.message);
      throw new Error(`Failed to update swap status: ${swapError.message}`);
    }

    // Handle plant availability based on status
    const plantIds = [senderPlantId, receiverPlantId].filter(
      Boolean
    ) as number[];

    if (plantIds.length > 0) {
      let availability: boolean;

      switch (status) {
        case SWAP_STATUS_MAPPINGS.ACCEPTED:
        case SWAP_STATUS_MAPPINGS.PENDING:
          availability = false; // Make plants unavailable
          break;
        case SWAP_STATUS_MAPPINGS.REJECTED:
        case SWAP_STATUS_MAPPINGS.COMPLETED:
          availability = true; // Make plants available again
          break;
        default:
          throw new Error(`Invalid swap status: ${status}`);
      }

      const { error: plantError } = await supabase
        .from(TABLES.PLANTS)
        .update({ disponible: availability })
        .in("id", plantIds);

      if (plantError) {
        console.error("Error updating plant availability:", plantError.message);
        throw new Error(
          `Failed to update plant availability: ${plantError.message}`
        );
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Service error in updateSwapStatusWithAvailability:", error);
    throw error;
  }
}

export async function markSwapAsCompletedByUser(
  swapId: number,
  userId: string
): Promise<void> {
  try {
    // Fetch current swap state with plant information
    const { data: swap, error: fetchError } = await supabase
      .from(TABLES.SWAPS)
      .select(
        `
        id,
        sender_id,
        receiver_id,
        sender_completed,
        receiver_completed,
        senderPlant:sender_plant_id(id, user_id),
        receiverPlant:receiver_plant_id(id, user_id)
        `
      )
      .eq("id", swapId)
      .single();

    if (fetchError || !swap) {
      throw new Error(
        `Failed to fetch swap: ${fetchError?.message || "Swap not found"}`
      );
    }

    // Normalize plant data (handle potential arrays)
    const senderPlant = Array.isArray(swap.senderPlant)
      ? swap.senderPlant[0]
      : swap.senderPlant;
    const receiverPlant = Array.isArray(swap.receiverPlant)
      ? swap.receiverPlant[0]
      : swap.receiverPlant;

    // Determine user role and completion field
    const isSender = swap.sender_id === userId;
    const updateField = isSender ? "sender_completed" : "receiver_completed";

    // Mark user as completed
    const { error: updateError } = await supabase
      .from(TABLES.SWAPS)
      .update({ [updateField]: true })
      .eq("id", swapId);

    if (updateError) {
      throw new Error(`Failed to mark completion: ${updateError.message}`);
    }

    // Check if both users have completed - if so, finalize the swap
    const otherUserCompleted = isSender
      ? swap.receiver_completed
      : swap.sender_completed;

    if (otherUserCompleted) {
      // Both users confirmed - complete the swap
      const { error: completeError } = await supabase
        .from(TABLES.SWAPS)
        .update({ status: SWAP_STATUS_MAPPINGS.COMPLETED })
        .eq("id", swapId);

      if (completeError) {
        throw new Error(`Failed to complete swap: ${completeError.message}`);
      }

      // Transfer plant ownership if both plants exist
      if (senderPlant?.id && receiverPlant?.id) {
        try {
          const ownershipUpdates = [
            supabase
              .from(TABLES.PLANTS)
              .update({
                user_id: swap.receiver_id,
                disponible: false, // Keep unavailable after ownership transfer
              })
              .eq("id", senderPlant.id),
            supabase
              .from(TABLES.PLANTS)
              .update({
                user_id: swap.sender_id,
                disponible: false, // Keep unavailable after ownership transfer
              })
              .eq("id", receiverPlant.id),
          ];

          const results = await Promise.all(ownershipUpdates);
          const hasError = results.some((r) => r.error);

          if (hasError) {
            console.error(
              "Plant ownership transfer errors:",
              results.filter((r) => r.error)
            );
            showError("Swap completed but plant ownership update failed");
          } else {
            showSuccess(
              "Swap completed successfully! Plant ownership has been transferred."
            );
          }
        } catch (ownershipError) {
          console.error("Error in ownership transfer:", ownershipError);
          showError("Swap completed but plant ownership update failed");
        }
      } else {
        showSuccess("Swap marked as completed!");
      }
    } else {
      showSuccess("Completion confirmed! Waiting for other user to confirm.");
    }
  } catch (error) {
    console.error("Service error in markSwapAsCompletedByUser:", error);
    showError("Failed to mark swap as completed");
    throw error;
  }
}

export function canUserActOnSwap(
  swap: FullSwap,
  userId: string
): {
  canAccept: boolean;
  canDecline: boolean;
  canView: boolean;
  isReceiver: boolean;
  isSender: boolean;
} {
  const isSender = swap.sender_id === userId;
  const isReceiver = swap.receiver_id === userId;
  const isNewSwap = swap.status === SWAP_STATUS_MAPPINGS.PENDING;

  return {
    canAccept: isReceiver && isNewSwap,
    canDecline: isReceiver && isNewSwap,
    canView: isSender || isReceiver,
    isReceiver,
    isSender,
  };
}
