import { supabase } from "./supabaseClient";
import {
  fetchPlants,
  fetchPlantsByUserForSwap,
  searchPlants,
  type PlantWithProfile,
} from "./plantCrudService";

// Alias para compatibilidad con componentes existentes
export interface FullPlant extends PlantWithProfile {}

export class PlantBrowserService {
  static async loadBrowsingData(): Promise<{
    otherPlants: FullPlant[];
    userPlants: FullPlant[];
    currentUser: { id: string; email?: string };
  }> {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      throw new Error(`Authentication error: ${userError.message}`);
    }

    if (!user) {
      throw new Error(
        "No active session found. Please log in to browse plants."
      );
    }

    const plantsData = await fetchPlants(true);

    const otherPlants = plantsData.filter((plant) => plant.user_id !== user.id);
    const userPlants = plantsData.filter((plant) => plant.user_id === user.id);

    return {
      otherPlants,
      userPlants,
      currentUser: {
        id: user.id,
        email: user.email,
      },
    };
  }

  static async getAvailablePlantsForBrowsing(
    userId: string,
    onlyAvailable: boolean = true
  ): Promise<FullPlant[]> {
    return searchPlants(
      "",
      {
        excludeUserId: userId,
        availability: onlyAvailable ? "available" : "all",
      },
      true
    );
  }

  static async getUserPlantsForSwapping(userId: string): Promise<FullPlant[]> {
    return fetchPlantsByUserForSwap(userId);
  }

  static async searchBrowsingPlants(
    searchTerm: string = "",
    filters: {
      availability?: "all" | "available" | "unavailable";
      species?: string;
      location?: string;
    } = {},
    excludeUserId?: string
  ): Promise<FullPlant[]> {
    return searchPlants(
      searchTerm,
      {
        availability: filters.availability,
        species: filters.species,
        excludeUserId,
      },
      true
    );
  }
}
