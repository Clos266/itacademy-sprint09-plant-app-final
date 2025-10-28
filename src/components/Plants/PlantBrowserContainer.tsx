import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { EnhancedFilterBar } from "@/components/common/FilterBar";
import { ProposeSwapModal } from "@/components/swaps/ProposeSwapModal";
import { PlantCard } from "@/components/cards";
import { LoadingState } from "@/components/common/LoadingState";
import { PaginatedCards } from "@/components/common/PaginatedCards";
import {
  PlantBrowserService,
  type FullPlant,
} from "@/services/plantBrowserService";
import { validateSwapEligibility } from "@/utils/swapValidation";
import { showError } from "@/services/toastService";
import { usePagination } from "@/hooks/usePagination";
import { useFiltering } from "@/hooks/useFiltering";
import { FilteringPresets } from "@/config/filteringPresets";
import { SEARCH_PLACEHOLDERS } from "@/constants/filters";
import { PAGINATION_SIZES } from "@/constants/pagination";
import { DOMAIN_FILTER_TYPES } from "@/constants/filterTypes";
import type { FilterConfig } from "@/types/filtering";

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
  const [plants, setPlants] = useState<FullPlant[]>([]);
  const [userPlants, setUserPlants] = useState<FullPlant[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    email?: string;
  } | null>(null);

  const [openSwap, setOpenSwap] = useState(false);
  const [targetPlant, setTargetPlant] = useState<FullPlant | null>(null);

  const {
    filteredItems: filteredPlants,
    filters,
    updateFilter,
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
    const loadBrowsingData = async () => {
      try {
        setLoading(true);

        const {
          otherPlants,
          userPlants: myPlants,
          currentUser: user,
        } = await PlantBrowserService.loadBrowsingData();

        setPlants(otherPlants);
        setUserPlants(myPlants);
        setCurrentUser(user);
      } catch (error) {
        console.error("Error loading browsing data:", error);
        showError(
          error instanceof Error ? error.message : "Could not load plants."
        );
      } finally {
        setLoading(false);
      }
    };

    loadBrowsingData();
  }, []);

  const handlePlantClick = async (plant: FullPlant) => {
    if (!currentUser) {
      showError("Please log in to propose swaps.");
      return;
    }

    const validation = validateSwapEligibility(userPlants, plant);

    if (!validation.isValid) {
      showError(validation.errorMessage!);
      return;
    }

    if (validation.warningMessage) {
      console.warn(validation.warningMessage);
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

  const handleSwapModalClose = () => {
    setOpenSwap(false);
    setTargetPlant(null);
  };

  if (loading) {
    return (
      <div className={className}>
        <LoadingState className="h-[70vh]" />
      </div>
    );
  }

  const availableUserPlants = userPlants.filter((p) => p.disponible);

  return (
    <div className={className}>
      <Card>
        <CardContent>
          <EnhancedFilterBar
            config={PLANT_FILTER_CONFIG}
            values={
              {
                search: filters.search,
                availability:
                  (filters.custom as Record<string, any>)?.availability ||
                  "available",
              } as any
            }
            onChange={handleFilterChange}
            searchPlaceholder={SEARCH_PLACEHOLDERS.plants}
          />
        </CardContent>
      </Card>

      <PaginatedCards
        data={paginated}
        page={page}
        totalPages={totalPages}
        onPageChange={goToPage}
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
        open={openSwap}
        onOpenChange={handleSwapModalClose}
        targetPlant={targetPlant}
        userPlants={availableUserPlants}
      />
    </div>
  );
}
