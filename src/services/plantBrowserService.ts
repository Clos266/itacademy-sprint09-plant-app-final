import { supabase } from "./supabaseClient";
import { fetchPlants } from "./plantCrudService";
import type { Database } from "@/types/supabase";

type Plant = Database["public"]["Tables"]["plants"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export interface FullPlant extends Plant {
  profile?: Profile | null;
}

/**
 * 🌿 Plant Browser Service
 *
 * Specialized service for plant browsing operations in the Home page context.
 * Handles data loading, user separation, and browser-specific business logic.
 *
 * This service is different from plantCrudService as it focuses specifically
 * on the browsing/marketplace scenario rather than general CRUD operations.
 */
export class PlantBrowserService {
  /**
   * Load browsing data optimized for the plant marketplace
   *
   * @returns {Promise<PlantBrowserData>} Separated plant data for browsing
   *
   * @example
   * ```tsx
   * const { otherPlants, userPlants, currentUser } = await PlantBrowserService.loadBrowsingData();
   * ```
   */
  static async loadBrowsingData(): Promise<{
    otherPlants: FullPlant[];
    userPlants: FullPlant[];
    currentUser: { id: string; email?: string };
  }> {
    // Get current authenticated user
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

    // Fetch all plants with profile information for browsing context
    const plantsData = await fetchPlants(true);

    // Separate plants by ownership for different UI treatment
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

  /**
   * Get plants available for browsing/swapping (excludes user's own plants)
   *
   * @param userId - Current user ID to exclude their plants
   * @param onlyAvailable - Filter only available plants
   * @returns {Promise<FullPlant[]>} Plants available for browsing
   */
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

  /**
   * Get user's plants with swap-relevant information
   *
   * @param userId - User ID to get plants for
   * @returns {Promise<FullPlant[]>} User's plants with availability status
   */
  static async getUserPlantsForSwapping(userId: string): Promise<FullPlant[]> {
    const plantsData = await fetchPlants(true);
    return plantsData.filter((plant) => plant.user_id === userId);
  }

  /**
   * Search plants available for browsing with enhanced filtering
   *
   * @param searchTerm - Search term to filter by
   * @param filters - Additional filters (availability, species, etc.)
   * @param excludeUserId - User ID to exclude from results
   * @returns {Promise<FullPlant[]>} Filtered plants
   */
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

    // Exclude user's own plants if userId provided
    if (excludeUserId) {
      plants = plants.filter((plant) => plant.user_id !== excludeUserId);
    }

    // Apply search term filter
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

    // Apply availability filter
    if (filters.availability && filters.availability !== "all") {
      const isAvailable = filters.availability === "available";
      plants = plants.filter((plant) => plant.disponible === isAvailable);
    }

    // Apply species filter
    if (filters.species) {
      plants = plants.filter((plant) =>
        plant.especie?.toLowerCase().includes(filters.species!.toLowerCase())
      );
    }

    // Apply location filter (based on owner's location)
    if (filters.location) {
      plants = plants.filter((plant) =>
        plant.profile?.ciudad
          ?.toLowerCase()
          .includes(filters.location!.toLowerCase())
      );
    }

    return plants;
  }

  /**
   * Get plant statistics for browsing dashboard
   *
   * @param userId - Current user ID
   * @returns {Promise<BrowsingStats>} Statistics about available plants
   */
  static async getBrowsingStatistics(userId: string): Promise<{
    totalAvailablePlants: number;
    totalOwners: number;
    userAvailablePlants: number;
    userTotalPlants: number;
    popularSpecies: { species: string; count: number }[];
  }> {
    const plantsData = await fetchPlants(true);

    const otherPlants = plantsData.filter((plant) => plant.user_id !== userId);
    const userPlants = plantsData.filter((plant) => plant.user_id === userId);
    const availablePlants = otherPlants.filter((plant) => plant.disponible);

    // Get unique owners
    const uniqueOwners = new Set(otherPlants.map((plant) => plant.user_id));

    // Calculate popular species
    const speciesCount = new Map<string, number>();
    availablePlants.forEach((plant) => {
      if (plant.especie) {
        const current = speciesCount.get(plant.especie) || 0;
        speciesCount.set(plant.especie, current + 1);
      }
    });

    const popularSpecies = Array.from(speciesCount.entries())
      .map(([species, count]) => ({ species, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalAvailablePlants: availablePlants.length,
      totalOwners: uniqueOwners.size,
      userAvailablePlants: userPlants.filter((p) => p.disponible).length,
      userTotalPlants: userPlants.length,
      popularSpecies,
    };
  }

  /**
   * Get recommended plants for a user based on their collection
   *
   * @param userId - User ID to get recommendations for
   * @param limit - Maximum number of recommendations
   * @returns {Promise<FullPlant[]>} Recommended plants
   */
  static async getRecommendedPlants(
    userId: string,
    limit: number = 10
  ): Promise<FullPlant[]> {
    const { otherPlants, userPlants } = await this.loadBrowsingData();

    // Simple recommendation: different species from what user has
    const userSpecies = new Set(
      userPlants.map((plant) => plant.especie).filter(Boolean)
    );

    const recommendations = otherPlants
      .filter((plant) => plant.disponible)
      .filter((plant) => plant.especie && !userSpecies.has(plant.especie))
      .sort(() => Math.random() - 0.5) // Simple randomization
      .slice(0, limit);

    return recommendations;
  }

  /**
   * Refresh browsing data (useful for real-time updates)
   *
   * @param userId - Current user ID
   * @returns {Promise<void>}
   */
  static async refreshBrowsingData(_userId: string): Promise<void> {
    // This could trigger cache invalidation or real-time subscriptions
    // For now, it's a placeholder for future real-time functionality

    // Future implementation could include:
    // - Cache invalidation
    // - WebSocket notifications
    // - Real-time subscriptions to plant updates
    await Promise.resolve(); // Placeholder for async operations
  }
}
