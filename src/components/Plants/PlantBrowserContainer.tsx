import { Card, CardContent } from "@/components/ui/card";
import { EnhancedFilterBar } from "@/components/common/FilterBar";
import { ProposeSwapModal } from "@/components/swaps/ProposeSwapModal";
import { PlantCard } from "@/components/cards";
import { LoadingState } from "@/components/common/LoadingState";
import { PaginatedCards } from "@/components/common/PaginatedCards";
import { PageHeader, PageHeaderHeading } from "@/components/PageHeader";
import { Leaf } from "lucide-react";
import { usePlantsBrowser } from "@/hooks/usePlantsBrowser";
import { SEARCH_PLACEHOLDERS } from "@/constants/filters";
import { DOMAIN_FILTER_TYPES } from "@/constants/filterTypes";
import { SPACING } from "@/constants/layouts";
import type { FilterConfig } from "@/types/filtering";
import type { FullPlant } from "@/services/plantBrowserService";

const PLANT_FILTER_CONFIG: FilterConfig[] = [
  {
    key: "search",
    type: "text",
    placeholder: SEARCH_PLACEHOLDERS.plants,
  },
  {
    key: "availability",
    type: "status",
    options: DOMAIN_FILTER_TYPES.PLANTS.STATUS,
  },
];

interface PlantBrowserContainerProps {
  className?: string;
}

export function PlantBrowserContainer({
  className = "",
}: PlantBrowserContainerProps) {
  const {
    filteredPlants,
    loading,
    swapModalState,
    pagination,
    filters,
    handlePlantClick,
    handleFilterChange,
    handleSwapModalClose,
  } = usePlantsBrowser();

  if (loading) {
    return (
      <div className={`min-h-screen ${SPACING.PAGE.SECTION_GAP} ${className}`}>
        <PageHeader>
          <PageHeaderHeading>
            <Leaf className="inline-block w-6 h-6 mr-2 text-primary" />
            Browse Plants for Swap
          </PageHeaderHeading>
        </PageHeader>
        <LoadingState className="h-[70vh]" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${SPACING.PAGE.SECTION_GAP} ${className}`}>
      <PageHeader>
        <PageHeaderHeading>
          <Leaf className="inline-block w-6 h-6 mr-2 text-primary" />
          Browse Plants for Swap
        </PageHeaderHeading>
      </PageHeader>

      <Card>
        <CardContent>
          <EnhancedFilterBar
            config={PLANT_FILTER_CONFIG}
            values={
              {
                search: filters.search,
                availability: filters.availability,
              } as any
            }
            onChange={handleFilterChange}
            searchPlaceholder={SEARCH_PLACEHOLDERS.plants}
          />
        </CardContent>
      </Card>

      <PaginatedCards
        data={filteredPlants}
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={pagination.onPageChange}
        emptyMessage="No plants found matching your criteria."
        renderCard={(plant: FullPlant) => (
          <PlantCard
            key={plant.id}
            plant={plant}
            onClick={() => handlePlantClick(plant)}
          />
        )}
      />

      <ProposeSwapModal
        open={swapModalState.open}
        onOpenChange={handleSwapModalClose}
        targetPlant={swapModalState.targetPlant}
        userPlants={swapModalState.availableUserPlants}
      />
    </div>
  );
}
