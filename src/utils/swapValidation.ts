import type { Database } from "@/types/supabase";

type Plant = Database["public"]["Tables"]["plants"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export interface FullPlant extends Plant {
  profile?: Profile | null;
}

/**
 * 🛡️ Swap Validation Utilities
 *
 * Centralized validation logic for plant swap operations.
 * These utilities ensure consistent validation across the application
 * and provide clear error messages for different swap scenarios.
 */

export interface SwapValidationResult {
  isValid: boolean;
  errorMessage?: string;
  warningMessage?: string;
  requiresConfirmation?: boolean;
}

/**
 * Validates if a user can propose a swap for a target plant
 *
 * @param userPlants - Array of plants owned by the current user
 * @param targetPlant - The plant the user wants to swap for
 * @returns {SwapValidationResult} Validation result with error/warning messages
 *
 * @example
 * ```tsx
 * const validation = validateSwapEligibility(myPlants, selectedPlant);
 * if (!validation.isValid) {
 *   showError(validation.errorMessage);
 *   return;
 * }
 * ```
 */
export function validateSwapEligibility(
  userPlants: FullPlant[],
  targetPlant: FullPlant
): SwapValidationResult {
  // Check if user has any plants at all
  if (userPlants.length === 0) {
    return {
      isValid: false,
      errorMessage: "You need to add your own plants before proposing swaps.",
    };
  }

  // Check if user has available plants for swapping
  const availablePlants = userPlants.filter((plant) => plant.disponible);
  if (availablePlants.length === 0) {
    return {
      isValid: false,
      errorMessage:
        "You don't have any available plants for swapping. Make sure at least one of your plants is marked as available.",
    };
  }

  // Check if target plant is available
  if (!targetPlant.disponible) {
    return {
      isValid: false,
      errorMessage: "This plant is no longer available for swapping.",
    };
  }

  // Check if user is trying to swap with themselves
  const currentUserId = userPlants[0]?.user_id; // Assuming all user plants have the same user_id
  if (targetPlant.user_id === currentUserId) {
    return {
      isValid: false,
      errorMessage: "You cannot propose a swap with your own plants.",
    };
  }

  // All validations passed
  return {
    isValid: true,
  };
}

/**
 * Validates if a plant can be used in a swap proposal
 *
 * @param plant - The plant to validate
 * @returns {SwapValidationResult} Validation result
 */
export function validatePlantForSwap(plant: FullPlant): SwapValidationResult {
  if (!plant.disponible) {
    return {
      isValid: false,
      errorMessage: "This plant is not available for swapping.",
    };
  }

  // Check if plant has required information
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

/**
 * Validates if two plants are compatible for swapping
 *
 * @param userPlant - Plant offered by the user
 * @param targetPlant - Plant requested from another user
 * @returns {SwapValidationResult} Validation result
 */
export function validatePlantCompatibility(
  userPlant: FullPlant,
  targetPlant: FullPlant
): SwapValidationResult {
  // Basic validation for both plants
  const userPlantValidation = validatePlantForSwap(userPlant);
  if (!userPlantValidation.isValid) {
    return userPlantValidation;
  }

  const targetPlantValidation = validatePlantForSwap(targetPlant);
  if (!targetPlantValidation.isValid) {
    return targetPlantValidation;
  }

  // Check if plants are the same (shouldn't swap identical plants)
  if (userPlant.id === targetPlant.id) {
    return {
      isValid: false,
      errorMessage: "Cannot swap a plant with itself.",
    };
  }

  // Warning for same species swap (might not be desired)
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

/**
 * Get available plants for swapping from user's collection
 *
 * @param userPlants - All plants owned by the user
 * @returns {FullPlant[]} Filtered array of plants available for swapping
 */
export function getAvailablePlantsForSwap(
  userPlants: FullPlant[]
): FullPlant[] {
  return userPlants.filter((plant) => {
    const validation = validatePlantForSwap(plant);
    return validation.isValid;
  });
}

/**
 * Utility class for swap-related operations and validations
 */
export class SwapValidationUtils {
  /**
   * Comprehensive validation for a complete swap scenario
   */
  static validateCompleteSwap(
    userPlants: FullPlant[],
    selectedUserPlant: FullPlant,
    targetPlant: FullPlant
  ): SwapValidationResult {
    // First check eligibility
    const eligibilityResult = validateSwapEligibility(userPlants, targetPlant);
    if (!eligibilityResult.isValid) {
      return eligibilityResult;
    }

    // Then check compatibility
    const compatibilityResult = validatePlantCompatibility(
      selectedUserPlant,
      targetPlant
    );
    if (!compatibilityResult.isValid) {
      return compatibilityResult;
    }

    return compatibilityResult; // May include warnings
  }

  /**
   * Get validation summary for UI display
   */
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
