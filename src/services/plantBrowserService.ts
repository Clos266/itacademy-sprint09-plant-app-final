import { supabase } from "./supabaseClient";
import { fetchPlants } from "./plantCrudService";
import type { Database } from "@/types/supabase";

type Plant = Database["public"]["Tables"]["plants"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export interface FullPlant extends Plant {
  profile?: Profile | null;
}

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
    const plantsData = await fetchPlants(true);

    let filteredPlants = plantsData.filter((plant) => plant.user_id !== userId);

    if (onlyAvailable) {
      filteredPlants = filteredPlants.filter((plant) => plant.disponible);
    }

    return filteredPlants;
  }

  static async getUserPlantsForSwapping(userId: string): Promise<FullPlant[]> {
    const plantsData = await fetchPlants(true);
    return plantsData.filter((plant) => plant.user_id === userId);
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
    let plants = await fetchPlants(true);

    if (excludeUserId) {
      plants = plants.filter((plant) => plant.user_id !== excludeUserId);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      plants = plants.filter(
        (plant) =>
          plant.nombre_comun?.toLowerCase().includes(term) ||
          plant.nombre_cientifico?.toLowerCase().includes(term) ||
          plant.especie?.toLowerCase().includes(term) ||
          plant.profile?.username?.toLowerCase().includes(term) ||
          plant.profile?.ciudad?.toLowerCase().includes(term)
      );
    }

    if (filters.availability && filters.availability !== "all") {
      const isAvailable = filters.availability === "available";
      plants = plants.filter((plant) => plant.disponible === isAvailable);
    }

    if (filters.species) {
      plants = plants.filter((plant) =>
        plant.especie?.toLowerCase().includes(filters.species!.toLowerCase())
      );
    }

    if (filters.location) {
      plants = plants.filter((plant) =>
        plant.profile?.ciudad
          ?.toLowerCase()
          .includes(filters.location!.toLowerCase())
      );
    }

    return plants;
  }
}
