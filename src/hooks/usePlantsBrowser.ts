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

export function usePlantsBrowser() {
  const [plants, setPlants] = useState<FullPlant[]>([]);
  const [userPlants, setUserPlants] = useState<FullPlant[]>([]);
  const [loading, setLoading] = useState(true);

  const [openSwap, setOpenSwap] = useState(false);
  const [targetPlant, setTargetPlant] = useState<FullPlant | null>(null);

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

  const { page, totalPages, paginated, goToPage } = usePagination(
    filteredPlants,
    PAGINATION_SIZES.CARDS
  );

  useEffect(() => {
    updateFilter("custom", { availability: "available" });
  }, [updateFilter]);

  useEffect(() => {
    const loadPlants = async () => {
      try {
        setLoading(true);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!user) throw new Error("No active session");

        const data = await fetchPlants(true);

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

  const handlePlantClick = (plant: FullPlant) => {
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

  return {
    filteredPlants: paginated,
    userPlants,
    loading,

    swapModalState: {
      open: openSwap,
      targetPlant,
      availableUserPlants: userPlants.filter((p) => p.disponible),
    },

    pagination: {
      page,
      totalPages,
      onPageChange: goToPage,
    },

    filters: {
      search: filters.search,
      availability:
        (filters.custom as Record<string, any>)?.availability || "available",
    },

    handlePlantClick,
    handleFilterChange,
    handleResetFilters,
    handleSwapModalClose,
  };
}
