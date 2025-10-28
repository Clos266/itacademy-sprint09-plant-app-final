import { useEffect, useState } from "react";
import { showError, showWarning } from "@/services/toastService";
import { fetchPlants } from "@/services/plantCrudService";
import { supabase } from "@/services/supabaseClient";
import type { Database } from "@/types/supabase";
import { usePagination } from "@/hooks/usePagination";
import { useFiltering } from "@/hooks/useFiltering";
import { FilteringPresets } from "@/config/filteringPresets";
import { PAGINATION_SIZES } from "@/constants/pagination";

type Plant = Database["public"]["Tables"]["plants"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export interface FullPlant extends Plant {
  profile?: Profile | null;
}

/**
 * 🎣 Custom hook for plant browsing functionality
 *
 * Encapsulates all the business logic for browsing plants in the Home page:
 * - Loading plants (available for swap and user's own plants)
 * - Filtering and pagination
 * - Swap modal state management
 * - Plant interaction validation
 *
 * @returns {Object} All necessary state and handlers for plant browsing
 *
 * @example
 * ```tsx
 * const {
 *   filteredPlants,
 *   userPlants,
 *   loading,
 *   swapModalState,
 *   pagination,
 *   filters,
 *   handlePlantClick,
 *   handleFilterChange,
 *   handleResetFilters,
 *   handleSwapModalClose
 * } = usePlantsBrowser();
 * ```
 */
export function usePlantsBrowser() {
  // 🌱 Core state
  const [plants, setPlants] = useState<FullPlant[]>([]);
  const [userPlants, setUserPlants] = useState<FullPlant[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔄 Swap modal state
  const [openSwap, setOpenSwap] = useState(false);
  const [targetPlant, setTargetPlant] = useState<FullPlant | null>(null);

  // 🎯 Filtering logic using centralized configuration
  const {
    filteredItems: filteredPlants,
    filters,
    updateFilter,
    resetFilters,
  } = useFiltering(plants, {
    ...FilteringPresets.plants,
    searchFields: [
      ...FilteringPresets.plants.searchFields,
    ] as (keyof FullPlant)[],
    defaultSort: {
      field: FilteringPresets.plants.defaultSort.field as keyof FullPlant,
      direction: FilteringPresets.plants.defaultSort.direction,
    },
  });

  // 📄 Pagination with filtered results
  const { page, totalPages, paginated, goToPage } = usePagination(
    filteredPlants,
    PAGINATION_SIZES.CARDS
  );

  // 🚀 Initialize availability filter to "available" for better UX
  useEffect(() => {
    updateFilter("custom", { availability: "available" });
  }, [updateFilter]);

  // 📥 Load plants data
  useEffect(() => {
    const loadPlants = async () => {
      try {
        setLoading(true);

        // Get current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!user) throw new Error("No active session");

        // Fetch plants with profile data
        const data = await fetchPlants(true);

        // Separate other users' plants from current user's plants
        const otherPlants = data.filter((p) => p.user_id !== user.id);
        const myPlants = data.filter((p) => p.user_id === user.id);

        setPlants(otherPlants);
        setUserPlants(myPlants);
      } catch (err) {
        console.error("Error fetching plants:", err);
        showError("Could not load plants.");
      } finally {
        setLoading(false);
      }
    };

    loadPlants();
  }, []);

  // 🎯 Plant interaction handlers
  const handlePlantClick = (plant: FullPlant) => {
    // Validate if user can propose swaps
    if (userPlants.length === 0) {
      showWarning("You need to add your own plants before proposing swaps.");
      return;
    }

    setTargetPlant(plant);
    setOpenSwap(true);
  };

  const handleFilterChange = (key: string, value: any) => {
    if (key === "search") {
      updateFilter("search", value);
    } else if (key === "availability") {
      updateFilter("custom", { availability: value });
    }
    // Reset to first page when filters change
    goToPage(1);
  };

  const handleResetFilters = () => {
    resetFilters();
    goToPage(1);
  };

  const handleSwapModalClose = () => {
    setOpenSwap(false);
    setTargetPlant(null);
  };

  // 📊 Return all necessary state and handlers
  return {
    // Core data
    filteredPlants: paginated,
    userPlants,
    loading,

    // Swap modal state
    swapModalState: {
      open: openSwap,
      targetPlant,
      availableUserPlants: userPlants.filter((p) => p.disponible),
    },

    // Pagination
    pagination: {
      page,
      totalPages,
      onPageChange: goToPage,
    },

    // Filtering
    filters: {
      search: filters.search,
      availability:
        (filters.custom as Record<string, any>)?.availability || "available",
    },

    // Handlers
    handlePlantClick,
    handleFilterChange,
    handleResetFilters,
    handleSwapModalClose,
  };
}
