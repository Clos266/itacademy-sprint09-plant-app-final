import { useState, useCallback } from "react";
import { PageHeader, PageHeaderHeading } from "@/components/page-header";
import { Leaf } from "lucide-react";
import { ProposeSwapModal } from "@/components/swaps/ProposeSwapModal";
import { PaginatedCards } from "@/components/common/PaginatedCards";
import { LoadingState } from "@/components/common/LoadingState";
import { PlantFilters } from "@/components/Plants/PlantFilters";
import { PlantCard } from "@/components/Plants/PlantCard";
import { usePlantSwap, type FullPlant } from "@/hooks/usePlantSwap";
import { useFiltering } from "@/hooks/useFiltering";
import { usePagination } from "@/hooks/usePagination";

/**
 * PlantsSwapPage - A comprehensive plant browsing and swap interface
 *
 * This component provides users with the ability to:
 * - Browse available plants from other users
 * - Search and filter plants by various criteria
 * - View detailed plant information with owner details
 * - Propose plant swaps with other users
 * - Navigate through paginated results
 *
 * Features:
 * - Real-time search functionality
 * - Filter by availability status
 * - Responsive grid layout with pagination
 * - Optimized performance with memoized components
 * - Comprehensive error handling and loading states
 */
export default function PlantsSwapPage() {
  // State management using custom hook
  const { userPlants, loading } = usePlantSwap();

  // Configuración del hook de filtrado
  const filterConfig = {
    searchFields: (plant: FullPlant) => [
      plant.nombre_comun || "",
      plant.nombre_cientifico || "",
      plant.especie || "",
      plant.profile?.username || "",
    ],
    filterFn: (plant: FullPlant, filterType: string) => {
      if (filterType === "all") return true;
      if (filterType === "available") return plant.disponible;
      if (filterType === "unavailable") return !plant.disponible;
      return true;
    },
  };

  const {
    search,
    filterType,
    filtered: filteredPlants,
    setSearch,
    setFilterType,
    clearSearch,
  } = useFiltering({
    data: userPlants,
    config: filterConfig,
    initialFilter: "available",
  });

  // Hook de paginación separado
  const {
    page,
    totalPages,
    paginated: paginatedPlants,
    showingStart,
    showingEnd,
    setPage,
  } = usePagination(filteredPlants, { itemsPerPage: 9 });

  // Local component state
  const [selectedPlantId, setSelectedPlantId] = useState<number | null>(null);
  const [openSwap, setOpenSwap] = useState(false);
  const [targetPlant, setTargetPlant] = useState<FullPlant | null>(null);

  // Event handlers
  const handlePlantSelect = useCallback((plantId: number) => {
    setSelectedPlantId(plantId);
  }, []);

  const handleProposeSwap = useCallback((plant: FullPlant) => {
    setTargetPlant(plant);
    setOpenSwap(true);
  }, []);

  const handleCloseSwap = useCallback(() => {
    setOpenSwap(false);
    setTargetPlant(null);
  }, []);

  // Loading state
  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen space-y-6">
      {/* Page Header */}
      <PageHeader>
        <PageHeaderHeading>
          <Leaf className="inline-block w-6 h-6 mr-2 text-primary" />
          Browse Plants for Swap
        </PageHeaderHeading>
      </PageHeader>

      {/* Search and Filters */}
      <PlantFilters
        search={search}
        filterType={filterType}
        onSearchChange={setSearch}
        onFilterChange={setFilterType}
        onClearSearch={clearSearch}
      />

      {/* Pagination Info */}
      {filteredPlants.length > 0 && (
        <div className="flex justify-end text-sm text-muted-foreground pr-2">
          Showing <span className="mx-1 font-medium">{showingStart}</span>–
          <span className="mx-1 font-medium">{showingEnd}</span> of{" "}
          <span className="mx-1 font-medium">{filteredPlants.length}</span>{" "}
          plants
        </div>
      )}

      {/* Plant Grid with Pagination */}
      <PaginatedCards
        data={paginatedPlants}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyMessage="No plants found matching your criteria."
        renderCard={(plant) => (
          <PlantCard
            key={plant.id}
            plant={plant}
            isSelected={selectedPlantId === plant.id}
            onSelect={handlePlantSelect}
            onProposeSwap={handleProposeSwap}
          />
        )}
      />

      {/* Swap Proposal Modal */}
      <ProposeSwapModal
        open={openSwap}
        onOpenChange={handleCloseSwap}
        targetPlant={targetPlant}
        userPlants={userPlants.filter((plant) => plant.disponible)}
      />
    </div>
  );
}
