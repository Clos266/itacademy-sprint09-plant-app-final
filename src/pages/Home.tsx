import { useEffect, useState, useMemo } from "react";
import { PageHeader, PageHeaderHeading } from "@/components/page-header";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Leaf, MapPin } from "lucide-react";
import { FilterBar } from "@/components/common/FilterBar";
import { SearchInput } from "@/components/common/SearchInput";
import { ProposeSwapModal } from "@/components/swaps/ProposeSwapModal";
import { LoadingState } from "@/components/common/LoadingState";
import { showError, showWarning } from "@/services/toastService";
import { fetchPlants } from "@/services/plantCrudService";
import { supabase } from "@/services/supabaseClient";
import type { Database } from "@/types/supabase";
import { PaginatedCards } from "@/components/common/PaginatedCards";
import { usePagination } from "@/hooks/usePagination";

type Plant = Database["public"]["Tables"]["plants"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
interface FullPlant extends Plant {
  profile?: Profile | null;
}

const ITEMS_PER_PAGE = 9;
const FILTER_TYPES = ["all", "available", "unavailable"] as const;

export default function HomePage() {
  const [plants, setPlants] = useState<FullPlant[]>([]);
  const [userPlants, setUserPlants] = useState<FullPlant[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<
    "all" | "available" | "unavailable"
  >("available");
  const [search, setSearch] = useState("");
  const [openSwap, setOpenSwap] = useState(false);
  const [targetPlant, setTargetPlant] = useState<FullPlant | null>(null);

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

  const filteredAndSortedPlants = useMemo(() => {
    const term = search.toLowerCase();

    return plants
      .filter((plant) => {
        const matchesSearch =
          plant.nombre_comun?.toLowerCase().includes(term) ||
          plant.nombre_cientifico?.toLowerCase().includes(term) ||
          plant.especie?.toLowerCase().includes(term);

        if (!matchesSearch) return false;
        if (filterType === "available") return plant.disponible;
        if (filterType === "unavailable") return !plant.disponible;
        return true;
      })
      .sort((a, b) => {
        if (a.disponible && !b.disponible) return -1;
        if (!a.disponible && b.disponible) return 1;
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });
  }, [plants, search, filterType]);

  const { page, totalPages, paginated, goToPage } = usePagination(
    filteredAndSortedPlants,
    ITEMS_PER_PAGE
  );

  const showingStart = (page - 1) * ITEMS_PER_PAGE + 1;
  const showingEnd = Math.min(
    page * ITEMS_PER_PAGE,
    filteredAndSortedPlants.length
  );

  if (loading) {
    return <LoadingState className="h-[70vh]" />;
  }

  return (
    <div className="min-h-screen space-y-6">
      <PageHeader>
        <PageHeaderHeading>
          <Leaf className="inline-block w-6 h-6 mr-2 text-primary" />
          Browse Plants for Swap
        </PageHeaderHeading>
      </PageHeader>

      {/* Filtro y búsqueda */}
      <Card>
        <CardContent>
          <FilterBar
            searchComponent={
              <SearchInput
                value={search}
                onChange={(val) => {
                  setSearch(val);
                  goToPage(1);
                }}
                onClear={() => {
                  setSearch("");
                  goToPage(1);
                }}
                placeholder="Search plants or species..."
              />
            }
            filters={
              <>
                {FILTER_TYPES.map((type) => (
                  <Button
                    key={type}
                    variant={filterType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setFilterType(type);
                      goToPage(1);
                    }}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </>
            }
          />
        </CardContent>
      </Card>

      {/* Info de paginación */}
      <div className="flex justify-end text-sm text-muted-foreground pr-2">
        Showing <span className="mx-1 font-medium">{showingStart}</span>–
        <span className="mx-1 font-medium">{showingEnd}</span> of{" "}
        <span className="mx-1 font-medium">
          {filteredAndSortedPlants.length}
        </span>{" "}
        plants
      </div>

      <PaginatedCards
        data={paginated}
        page={page}
        totalPages={totalPages}
        onPageChange={goToPage}
        emptyMessage="No plants found."
        renderCard={(plant) => {
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

          const owner = plant.profile;

          return (
            <Card
              key={plant.id}
              className="transition-all cursor-pointer overflow-hidden flex flex-col hover:shadow-md hover:scale-105"
              onClick={handleCardClick}
            >
              <CardContent className="p-4 pb-0">
                <div className="relative aspect-square w-full rounded-lg overflow-hidden shadow-sm">
                  <img
                    src={plant.image_url || "/imagenotfound.jpeg"}
                    alt={plant.nombre_comun}
                    className="object-cover w-full h-full"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge
                      variant={plant.disponible ? "default" : "destructive"}
                    >
                      {plant.disponible ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                </div>
              </CardContent>

              <CardHeader className="flex-1 flex flex-col justify-between p-4 items-center text-left">
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm w-full max-w-xs">
                  <div>
                    <p className="text-muted-foreground text-xs uppercase">
                      Common Name
                    </p>
                    <p className="font-semibold truncate">
                      {plant.nombre_comun}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground text-xs uppercase">
                      Scientific
                    </p>
                    <p className="italic truncate">
                      {plant.nombre_cientifico || "-"}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">
                      {owner?.ciudad || "Unknown"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <img
                      src={owner?.avatar_url || "/avatar-placeholder.png"}
                      alt={owner?.username || "User"}
                      className="w-6 h-6 rounded-full object-cover"
                      loading="lazy"
                    />
                    <span className="text-muted-foreground truncate">
                      {owner?.username || "Anonymous"}
                    </span>
                  </div>
                </div>
              </CardHeader>
            </Card>
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
