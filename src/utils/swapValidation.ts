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
  requiresConfirmation?: boolean;
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

export function validatePlantForSwap(plant: FullPlant): SwapValidationResult {
  if (!plant.disponible) {
    return {
      isValid: false,
      errorMessage: "This plant is not available for swapping.",
    };
  }

  if (!plant.nombre_comun || plant.nombre_comun.trim() === "") {
    return {
      isValid: false,
      errorMessage: "Plant must have a common name to be used in swaps.",
    };
  }

  return {
    isValid: true,
  };
}

export function validatePlantCompatibility(
  userPlant: FullPlant,
  targetPlant: FullPlant
): SwapValidationResult {
  const userPlantValidation = validatePlantForSwap(userPlant);
  if (!userPlantValidation.isValid) {
    return userPlantValidation;
  }

  const targetPlantValidation = validatePlantForSwap(targetPlant);
  if (!targetPlantValidation.isValid) {
    return targetPlantValidation;
  }

  if (userPlant.id === targetPlant.id) {
    return {
      isValid: false,
      errorMessage: "Cannot swap a plant with itself.",
    };
  }

  if (
    userPlant.especie &&
    targetPlant.especie &&
    userPlant.especie.toLowerCase() === targetPlant.especie.toLowerCase()
  ) {
    return {
      isValid: true,
      warningMessage:
        "You're swapping plants of the same species. Are you sure you want to continue?",
      requiresConfirmation: true,
    };
  }

  return {
    isValid: true,
  };
}

export function getAvailablePlantsForSwap(
  userPlants: FullPlant[]
): FullPlant[] {
  return userPlants.filter((plant) => {
    const validation = validatePlantForSwap(plant);
    return validation.isValid;
  });
}

export class SwapValidationUtils {
  static validateCompleteSwap(
    userPlants: FullPlant[],
    selectedUserPlant: FullPlant,
    targetPlant: FullPlant
  ): SwapValidationResult {
    const eligibilityResult = validateSwapEligibility(userPlants, targetPlant);
    if (!eligibilityResult.isValid) {
      return eligibilityResult;
    }

    const compatibilityResult = validatePlantCompatibility(
      selectedUserPlant,
      targetPlant
    );
    if (!compatibilityResult.isValid) {
      return compatibilityResult;
    }

    return compatibilityResult;
  }

  static getValidationSummary(
    userPlants: FullPlant[],
    targetPlant?: FullPlant
  ): {
    canSwap: boolean;
    availablePlantsCount: number;
    totalPlantsCount: number;
    issues: string[];
  } {
    const availablePlants = getAvailablePlantsForSwap(userPlants);
    const issues: string[] = [];

    if (userPlants.length === 0) {
      issues.push("No plants in collection");
    }

    if (availablePlants.length === 0) {
      issues.push("No available plants for swapping");
    }

    if (targetPlant && !targetPlant.disponible) {
      issues.push("Target plant is not available");
    }

    return {
      canSwap: issues.length === 0,
      availablePlantsCount: availablePlants.length,
      totalPlantsCount: userPlants.length,
      issues,
    };
  }
}
