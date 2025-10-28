import { useEffect, useState, useMemo, useCallback } from "react";
import type { Database } from "@/types/supabase";
import { DOMAIN_FILTER_TYPES } from "@/constants/filterTypes";
import {
  filterAndSortMyPlants,
  getMyPlantsStats,
  canEditPlant,
} from "@/utils/myPlantsFiltering";
import {
  fetchPlantsByUser,
  updatePlant,
  deletePlant,
  subscribeToUserPlants,
} from "@/services/plantCrudService";
import { showSuccess, showError, showWarning } from "@/services/toastService";
import { supabase } from "@/services/supabaseClient";

type Plant = Database["public"]["Tables"]["plants"]["Row"];
type FilterType = (typeof DOMAIN_FILTER_TYPES.PLANTS.STATUS)[number];

export function useMyPlantsPage() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const loadMyPlants = async () => {
      try {
        setLoading(true);
        setError(null);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!user) throw new Error("No active session");

        setCurrentUserId(user.id);

        // Load user's plants
        const data = await fetchPlantsByUser(user.id);
        setPlants(data);

        // Set up realtime subscription for user's plants
        unsubscribe = subscribeToUserPlants(user.id, (payload) => {
          if (payload.eventType === "INSERT" && payload.new) {
            setPlants((prev) => [payload.new, ...prev]);
            showSuccess(
              `Added new plant: ${payload.new.nombre_comun || "Unnamed plant"}`
            );
          }

          if (payload.eventType === "UPDATE" && payload.new) {
            setPlants((prev) =>
              prev.map((p) => (p.id === payload.new.id ? payload.new : p))
            );
          }

          if (payload.eventType === "DELETE" && payload.old) {
            setPlants((prev) => prev.filter((p) => p.id !== payload.old.id));
            showWarning(
              `Deleted plant: ${payload.old.nombre_comun || "Unnamed plant"}`
            );
          }
        });
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        console.error("Error loading plants:", err);
        showError("Could not load your plants.");
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadMyPlants();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // ========================================
  // Computed Values
  // ========================================

  const filteredAndSortedPlants = useMemo(() => {
    return filterAndSortMyPlants(
      plants,
      search,
      filterType,
      "created_at",
      "desc"
    );
  }, [plants, search, filterType]);

  const stats = useMemo(() => {
    return getMyPlantsStats(plants);
  }, [plants]);

  // ========================================
  // CRUD Operations
  // ========================================

  const handleSave = useCallback(
    async (id: number, updated: Partial<Plant>) => {
      try {
        if (!currentUserId) {
          throw new Error("User not authenticated");
        }

        const plant = plants.find((p) => p.id === id);
        if (!plant || !canEditPlant(plant, currentUserId)) {
          throw new Error("You don't have permission to edit this plant");
        }

        const newPlant = await updatePlant(id, updated);

        setPlants((prev) =>
          prev.map((p) => (p.id === id ? { ...p, ...newPlant } : p))
        );

        showSuccess("Plant updated successfully!");
        setOpenEdit(false);
        setSelectedPlant(null);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Error updating plant.";
        console.error("Error updating plant:", err);
        showError(errorMessage);
      }
    },
    [plants, currentUserId]
  );

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        if (!currentUserId) {
          throw new Error("User not authenticated");
        }

        const plant = plants.find((p) => p.id === id);
        if (!plant || !canEditPlant(plant, currentUserId)) {
          throw new Error("You don't have permission to delete this plant");
        }

        await deletePlant(id);
        showWarning("Plant deleted!");
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Error deleting plant.";
        console.error("Error deleting plant:", err);
        showError(errorMessage);
      }
    },
    [plants, currentUserId]
  );

  // ========================================
  // Modal Handlers
  // ========================================

  const handleEdit = useCallback(
    (plant: Plant) => {
      if (!currentUserId || !canEditPlant(plant, currentUserId)) {
        showError("You don't have permission to edit this plant");
        return;
      }

      setSelectedPlant(plant);
      setOpenEdit(true);
    },
    [currentUserId]
  );

  const handleOpenDetails = useCallback((plant: Plant) => {
    setSelectedPlant(plant);
    setOpenDetails(true);
  }, []);

  const handleCloseEdit = useCallback(() => {
    setOpenEdit(false);
    setSelectedPlant(null);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setOpenDetails(false);
    setSelectedPlant(null);
  }, []);

  // ========================================
  // Filter Handlers
  // ========================================

  const clearFilters = useCallback(() => {
    setSearch("");
    setFilterType("all");
  }, []);

  // ========================================
  // Return Hook Interface
  // ========================================

  return {
    // Core Data
    plants,
    filteredPlants: filteredAndSortedPlants,
    stats,

    // UI State
    loading,
    error,

    // Modal State
    selectedPlant,
    openEdit,
    openDetails,

    // Filter State
    search,
    filterType,

    // Actions
    handleEdit,
    handleDelete,
    handleSave,
    handleOpenDetails,
    handleCloseEdit,
    handleCloseDetails,

    // Filter Actions
    setSearch,
    setFilterType,
    clearFilters,
  };
}
