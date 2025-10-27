import { useEffect, useState } from "react";
import { PageHeader, PageHeaderHeading } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf } from "lucide-react";
import { EnhancedFilterBar } from "@/components/common/FilterBar";
import { ProposeSwapModal } from "@/components/swaps/ProposeSwapModal";
import { PlantCard } from "@/components/cards";
import { LoadingState } from "@/components/common/LoadingState";
import { showError, showWarning } from "@/services/toastService";
import { fetchPlants } from "@/services/plantCrudService";
import { supabase } from "@/services/supabaseClient";
import type { Database } from "@/types/supabase";
import { PaginatedCards } from "@/components/common/PaginatedCards";
import { usePagination } from "@/hooks/usePagination";
import { useFiltering } from "@/hooks/useFiltering";
import { FilteringPresets } from "@/config/filteringPresets";
import { SEARCH_PLACEHOLDERS } from "@/constants/filters";
import { PAGINATION_SIZES } from "@/constants/pagination";
import { SPACING } from "@/constants/layouts";
import { DOMAIN_FILTER_TYPES } from "@/constants/filterTypes";
import type { FilterConfig } from "@/types/filtering";

type Plant = Database["public"]["Tables"]["plants"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
interface FullPlant extends Plant {
  profile?: Profile | null;
}

// UI configuration for the filter bar (using centralized constants)
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

export default function HomePage() {
  const [plants, setPlants] = useState<FullPlant[]>([]);
  const [userPlants, setUserPlants] = useState<FullPlant[]>([]);
  const [loading, setLoading] = useState(true);
  const [openSwap, setOpenSwap] = useState(false);
  const [targetPlant, setTargetPlant] = useState<FullPlant | null>(null);

  // Use centralized filtering configuration for plants
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

  // Initialize availability filter to "available" for better UX
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

  // Pagination with filtered results
  const { page, totalPages, paginated, goToPage } = usePagination(
    filteredPlants,
    PAGINATION_SIZES.CARDS
  );

  if (loading) {
    return <LoadingState className="h-[70vh]" />;
  }

  return (
    <div className={`min-h-screen ${SPACING.PAGE.SECTION_GAP}`}>
      <PageHeader>
        <PageHeaderHeading>
          <Leaf className="inline-block w-6 h-6 mr-2 text-primary" />
          Browse Plants for Swap
        </PageHeaderHeading>
      </PageHeader>

      {/* Filtering and search */}
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
            onChange={(key, value) => {
              if (key === "search") {
                updateFilter("search", value);
              } else if (key === "availability") {
                updateFilter("custom", { availability: value });
              }
              goToPage(1); // Reset to first page on filter change
            }}
            searchPlaceholder={SEARCH_PLACEHOLDERS.plants}
            showReset
            onReset={() => {
              resetFilters();
              goToPage(1);
            }}
          />
        </CardContent>
      </Card>

      <PaginatedCards
        data={paginated}
        page={page}
        totalPages={totalPages}
        onPageChange={goToPage}
        emptyMessage="No plants found."
        renderCard={(plant: FullPlant) => {
          const handleCardClick = () => {
            if (userPlants.length === 0) {
              showWarning(
                "You need to add your own plants before proposing swaps."
              );
              return;
            }
            setTargetPlant(plant);
            setOpenSwap(true);
          };

          return (
            <PlantCard key={plant.id} plant={plant} onClick={handleCardClick} />
          );
        }}
      />

      <ProposeSwapModal
        open={openSwap}
        onOpenChange={setOpenSwap}
        targetPlant={targetPlant}
        userPlants={userPlants.filter((p) => p.disponible)}
      />
    </div>
  );
}
