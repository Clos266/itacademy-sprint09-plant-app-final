import { useEffect, useState, useMemo, useCallback } from "react";
import { PageHeader, PageHeaderHeading } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilterBar } from "@/components/common/FilterBar";
import { PaginatedTable } from "@/components/common/PaginatedTable";

import { usePagination } from "@/hooks/usePagination";
import { SearchInput } from "@/components/common/SearchInput";
import { Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import { NewPlantButton } from "@/components/Plants/NewPlantModal";
import { EditPlantModal } from "@/components/Plants/EditPlantModal";
import { LoadingState } from "@/components/common/LoadingState";
import { PlantDetailsModal } from "@/components/Plants/PlantDetailsModal";

import type { Database } from "@/types/supabase";
import {
  fetchPlantsByUser,
  updatePlant,
  deletePlant,
  subscribeToUserPlants,
} from "@/services/plantCrudService";
import { showSuccess, showError, showWarning } from "@/services/toastService";
import { supabase } from "@/services/supabaseClient";

type Plant = Database["public"]["Tables"]["plants"]["Row"];
type FilterType = "all" | "available" | "unavailable";

// TODO: Extract to shared constants file when growing
const FILTER_TYPES: FilterType[] = ["all", "available", "unavailable"] as const;

const ITEMS_PER_PAGE = 5;

export default function MyPlantsPage() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // TODO: Extract to useUserPlants hook - complex realtime subscription logic
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const loadMyPlants = async () => {
      try {
        setLoading(true);
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!user) throw new Error("No active session");

        const data = await fetchPlantsByUser(user.id);
        setPlants(data);

        // TODO: Extract realtime subscription logic when patterns are established
        unsubscribe = subscribeToUserPlants(user.id, (payload) => {
          if (payload.eventType === "INSERT" && payload.new) {
            setPlants((prev) => [payload.new, ...prev]);
            showSuccess(`Added new plant: ${payload.new.nombre_comun}`);
          }
          if (payload.eventType === "UPDATE" && payload.new) {
            setPlants((prev) =>
              prev.map((p) => (p.id === payload.new.id ? payload.new : p))
            );
          }
          if (payload.eventType === "DELETE" && payload.old) {
            setPlants((prev) => prev.filter((p) => p.id !== payload.old.id));
            showError(`Deleted plant: ${payload.old.nombre_comun}`);
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

  // TODO: Extract to usePlantsActions hook - CRUD operations logic
  const handleSave = useCallback(
    async (id: number, updated: Partial<Plant>) => {
      try {
        const newPlant = await updatePlant(id, updated);
        setPlants((prev) =>
          prev.map((p) => (p.id === id ? { ...p, ...newPlant } : p))
        );
        showSuccess("Plant updated successfully!");
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Error updating plant.";
        showError(errorMessage);
      }
    },
    []
  );

  const handleDelete = useCallback(async (id: number) => {
    try {
      await deletePlant(id);
      // NOTE: Realtime subscription handles state update automatically
      showWarning("Plant deleted!");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Error deleting plant.";
      showError(errorMessage);
    }
  }, []);

  // TODO: Extract to usePlantsFilters hook - complex filtering logic with multiple criteria
  const filteredPlants = useMemo(() => {
    return plants.filter((plant) => {
      const searchMatch =
        plant.nombre_comun?.toLowerCase().includes(search.toLowerCase()) ??
        true;

      const availabilityMatch =
        filterType === "all"
          ? true
          : filterType === "available"
          ? plant.disponible
          : !plant.disponible;

      return searchMatch && availabilityMatch;
    });
  }, [plants, search, filterType]);

  const { page, totalPages, paginated, goToPage } = usePagination(
    filteredPlants,
    ITEMS_PER_PAGE
  );

  const handleEdit = useCallback((plant: Plant) => {
    setSelectedPlant(plant);
    setOpenEdit(true);
  }, []);

  const handleOpenDetails = useCallback((plant: Plant) => {
    setSelectedPlant(plant);
    setOpenDetails(true);
  }, []);

  if (loading)
    return (
      <div className="h-[60vh]">
        <LoadingState className="h-full" />
      </div>
    );

  if (error)
    return <div className="text-center mt-8 text-destructive">{error}</div>;

  return (
    <>
      <PageHeader>
        <PageHeaderHeading>My Plants</PageHeaderHeading>
      </PageHeader>

      <Card className="mt-4">
        <CardContent>
          <FilterBar
            searchComponent={
              <SearchInput
                value={search}
                onChange={setSearch}
                onClear={() => setSearch("")}
                placeholder="Search your plants..."
              />
            }
            filters={
              <>
                {/* TODO: Extract FilterButtons component when filter patterns are established */}
                {FILTER_TYPES.map((type) => (
                  <Button
                    key={type}
                    variant={filterType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterType(type)}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}

                <NewPlantButton />
              </>
            }
          />
        </CardContent>
      </Card>

      {/* TODO: Extract PlantsTable component when table grows complex */}
      <PaginatedTable
        data={paginated}
        columns={[
          {
            key: "image",
            header: "Image",
            render: (plant: Plant) => (
              <img
                src={plant.image_url || "/public/imagenotfound.jpeg"}
                alt={`${plant.nombre_comun || "Plant"} - ${
                  plant.nombre_cientifico || "Unknown species"
                }`}
                loading="lazy"
                className="w-12 h-12 rounded-lg object-cover shadow-sm cursor-pointer transition-transform hover:scale-105 duration-200"
                onClick={() => handleOpenDetails(plant)}
              />
            ),
          },
          {
            key: "nombre_comun",
            header: "Common Name",
            render: (plant: Plant) => (
              <span className="truncate max-w-[150px] font-medium">
                {plant.nombre_comun || "Unnamed Plant"}
              </span>
            ),
          },
          {
            key: "nombre_cientifico",
            header: "Scientific Name",
            render: (plant: Plant) => (
              <span className="truncate max-w-[120px] text-muted-foreground italic">
                {plant.nombre_cientifico || "—"}
              </span>
            ),
          },
          {
            key: "actions",
            header: "Actions",
            render: (plant: Plant) => (
              // TODO: Extract PlantActionsCell component when action patterns are established
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(plant)}
                  className="transition-colors duration-200"
                  title={`Edit ${plant.nombre_comun || "plant"}`}
                >
                  <Pencil className="w-4 h-4" />
                </Button>

                {/* TODO: Extract DeletePlantDialog component when dialog patterns grow */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="transition-colors duration-200"
                      title={`Delete ${plant.nombre_comun || "plant"}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>

                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Plant</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete{" "}
                        <span className="font-semibold">
                          {plant.nombre_comun || "this plant"}
                        </span>
                        ? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(plant.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ),
          },
        ]}
        page={page}
        totalPages={totalPages}
        onPageChange={goToPage}
      />

      <PlantDetailsModal
        open={openDetails}
        onOpenChange={setOpenDetails}
        plantId={selectedPlant?.id || null}
      />

      <EditPlantModal
        open={openEdit}
        onOpenChange={setOpenEdit}
        plant={selectedPlant}
        onSave={handleSave}
      />
    </>
  );
}

/*
  TODO: Performance and UX improvements implemented:
  - ✅ Added useMemo for filteredPlants (prevents unnecessary re-filtering)
  - ✅ Added useCallback for all handlers (prevents child re-renders)  
  - ✅ Extracted constants (FILTER_TYPES, ITEMS_PER_PAGE)
  - ✅ Improved type safety (removed "as any", enhanced error handling)
  - ✅ Enhanced table with loading="lazy", descriptive alt text, truncate classes
  - ✅ Replaced window.confirm with AlertDialog for UI consistency
  - ✅ Added transition animations for better UX
  
  TODO: Future enhancements to consider:
  - Extract PlantActionsCell component when action patterns are established
  - Extract DeletePlantDialog component when dialog patterns grow  
  - Implement plant-specific business logic to custom hook (usePlantCrud)
  - Add plant and status filters when requirements grow
  - Implement optimistic updates for better UX
  - Consider bulk operations (delete multiple, export) if needed by users
  - Add plant search with fuzzy matching or tags
  - Extract realtime subscription logic when patterns are established
*/
