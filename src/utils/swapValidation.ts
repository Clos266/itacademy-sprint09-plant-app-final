import type { Database } from "@/types/supabase";

type Plant = Database["public"]["Tables"]["plants"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export interface FullPlant extends Plant {
  profile?: Profile | null;
}

export interface SwapValidationResult {
  isValid: boolean;
  errorMessage?: string;
  warningMessage?: string;
}

export function validateSwapEligibility(
  userPlants: FullPlant[],
  targetPlant: FullPlant
): SwapValidationResult {
  if (userPlants.length === 0) {
    return {
      isValid: false,
      errorMessage: "You need to add your own plants before proposing swaps.",
    };
  }

  const availablePlants = userPlants.filter((plant) => plant.disponible);
  if (availablePlants.length === 0) {
    return {
      isValid: false,
      errorMessage:
        "You don't have any available plants for swapping. Make sure at least one of your plants is marked as available.",
    };
  }

  if (!targetPlant.disponible) {
    return {
      isValid: false,
      errorMessage: "This plant is no longer available for swapping.",
    };
  }

  const currentUserId = userPlants[0]?.user_id;
  if (targetPlant.user_id === currentUserId) {
    return {
      isValid: false,
      errorMessage: "You cannot propose a swap with your own plants.",
    };
  }

  return {
    isValid: true,
  };
}
