import { useState, useEffect, useMemo, useCallback } from "react";
import { showError } from "@/services/toastService";
import { fetchPlants } from "@/services/plantCrudService";
import { supabase } from "@/services/supabaseClient";
import type { Database } from "@/types/supabase";

type Plant = Database["public"]["Tables"]["plants"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export interface FullPlant extends Plant {
  profile?: Profile | null;
}

export type FilterType = "all" | "available" | "unavailable";

export interface UsePlantSwapReturn {
  // Data
  plants: FullPlant[];
  userPlants: FullPlant[];
  filteredPlants: FullPlant[];

  // State
  loading: boolean;
  error: string | null;

  // Filters and search
  filterType: FilterType;
  search: string;

  // Pagination
  page: number;
  totalPages: number;
  paginatedPlants: FullPlant[];
  showingStart: number;
  showingEnd: number;

  // Actions
  setFilterType: (type: FilterType) => void;
  setSearch: (search: string) => void;
  setPage: (page: number) => void;
  clearSearch: () => void;
  refetchPlants: () => Promise<void>;
}

const ITEMS_PER_PAGE = 9;

export function usePlantSwap(): UsePlantSwapReturn {
  // Core state
  const [plants, setPlants] = useState<FullPlant[]>([]);
  const [userPlants, setUserPlants] = useState<FullPlant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter and search state
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Load plants function
  const loadPlants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

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
      const errorMessage =
        err instanceof Error ? err.message : "Could not load plants";
      console.error("Error fetching plants:", err);
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter and search logic
  const filteredPlants = useMemo(() => {
    const term = search.toLowerCase().trim();
    return plants.filter((plant) => {
      const matchesSearch =
        !term ||
        [plant.nombre_comun, plant.nombre_cientifico, plant.especie].some(
          (field) => field?.toLowerCase().includes(term)
        );

      if (!matchesSearch) return false;

      switch (filterType) {
        case "available":
          return plant.disponible;
        case "unavailable":
          return !plant.disponible;
        default:
          return true;
      }
    });
  }, [plants, search, filterType]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredPlants.length / ITEMS_PER_PAGE);

  const paginatedPlants = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return filteredPlants.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredPlants, page]);

  const showingStart = (page - 1) * ITEMS_PER_PAGE + 1;
  const showingEnd = Math.min(page * ITEMS_PER_PAGE, filteredPlants.length);

  // Action handlers
  const handleSetFilterType = useCallback((type: FilterType) => {
    setFilterType(type);
    setPage(1); // Reset to first page when changing filters
  }, []);

  const handleSetSearch = useCallback((searchTerm: string) => {
    setSearch(searchTerm);
    setPage(1); // Reset to first page when searching
  }, []);

  const clearSearch = useCallback(() => {
    setSearch("");
    setPage(1);
  }, []);

  // Load plants on mount
  useEffect(() => {
    loadPlants();
  }, [loadPlants]);

  return {
    // Data
    plants,
    userPlants,
    filteredPlants,

    // State
    loading,
    error,

    // Filters and search
    filterType,
    search,

    // Pagination
    page,
    totalPages,
    paginatedPlants,
    showingStart,
    showingEnd,

    // Actions
    setFilterType: handleSetFilterType,
    setSearch: handleSetSearch,
    setPage,
    clearSearch,
    refetchPlants: loadPlants,
  };
}
