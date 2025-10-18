import { useEffect, useState, useMemo } from "react";
import { PageHeader, PageHeaderHeading } from "@/components/page-header";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Leaf, MapPin, Filter, RefreshCcw } from "lucide-react";
import { FilterBar } from "@/components/common/FilterBar";
import { SearchInput } from "@/components/common/SearchInput";
import { ProposeSwapModal } from "@/components/swaps/ProposeSwapModal";
import { Spinner } from "@/components/ui/spinner";
import { showError } from "@/services/toastService";
import { fetchPlants } from "@/services/plantCrudService";
import { supabase } from "@/services/supabaseClient";
import type { Database } from "@/types/supabase";
import { PaginatedCards } from "@/components/common/PaginatedCards";

type Plant = Database["public"]["Tables"]["plants"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
interface FullPlant extends Plant {
  profile?: Profile | null;
}

// 🪴 9 plantas por página
const ITEMS_PER_PAGE = 9;

export default function PlantsSwapPage() {
  const [plants, setPlants] = useState<FullPlant[]>([]);
  const [userPlants, setUserPlants] = useState<FullPlant[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<
    "all" | "available" | "unavailable"
  >("all");
  const [search, setSearch] = useState("");
  const [selectedPlantId, setSelectedPlantId] = useState<number | null>(null);
  const [openSwap, setOpenSwap] = useState(false);
  const [targetPlant, setTargetPlant] = useState<FullPlant | null>(null);
  const [page, setPage] = useState(1);

  // 🌿 Fetch all plants + user's own
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

        // ✅ Get all plants with profiles
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

  // 🔍 Filter + search
  const filteredPlants = useMemo(() => {
    const term = search.toLowerCase();
    return plants.filter((plant) => {
      const matchesSearch =
        plant.nombre_comun?.toLowerCase().includes(term) ||
        plant.nombre_cientifico?.toLowerCase().includes(term) ||
        plant.especie?.toLowerCase().includes(term);

      if (!matchesSearch) return false;
      if (filterType === "available") return plant.disponible;
      if (filterType === "unavailable") return !plant.disponible;
      return true;
    });
  }, [plants, search, filterType]);

  // 📄 Pagination logic
  const totalPages = Math.ceil(filteredPlants.length / ITEMS_PER_PAGE);
  const paginatedPlants = filteredPlants.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const showingStart = (page - 1) * ITEMS_PER_PAGE + 1;
  const showingEnd = Math.min(page * ITEMS_PER_PAGE, filteredPlants.length);

  // 🌀 Loading
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[70vh] text-muted-foreground">
        <Spinner className="w-6 h-6 mb-4" />
        <p>Loading plants...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-6">
      {/* 🌿 Header */}
      <PageHeader>
        <PageHeaderHeading>
          <Leaf className="inline-block w-6 h-6 mr-2 text-primary" />
          Browse Plants for Swap
        </PageHeaderHeading>
      </PageHeader>

      {/* 🔍 Search + Filters */}
      <Card>
        <CardContent>
          <FilterBar
            searchComponent={
              <SearchInput
                value={search}
                onChange={(val) => {
                  setSearch(val);
                  setPage(1); // reset page on search
                }}
                onClear={() => {
                  setSearch("");
                  setPage(1);
                }}
                placeholder="Search plants or species..."
              />
            }
            filters={
              <>
                <Filter className="h-4 w-4 text-muted-foreground" />
                {["all", "available", "unavailable"].map((type) => (
                  <Button
                    key={type}
                    variant={filterType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setFilterType(type as any);
                      setPage(1);
                    }}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearch("")}
                >
                  <RefreshCcw className="w-4 h-4" />
                </Button>
              </>
            }
          />
        </CardContent>
      </Card>

      {/* 📊 Info de paginación */}
      <div className="flex justify-end text-sm text-muted-foreground pr-2">
        Showing <span className="mx-1 font-medium">{showingStart}</span>–
        <span className="mx-1 font-medium">{showingEnd}</span> of{" "}
        <span className="mx-1 font-medium">{filteredPlants.length}</span> plants
      </div>

      {/* 🪴 Plant Grid con paginación */}
      <PaginatedCards
        data={paginatedPlants}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyMessage="No plants found."
        renderCard={(plant) => {
          const owner = plant.profile;
          const isSelected = selectedPlantId === plant.id;

          return (
            <Card
              key={plant.id}
              className={`transition-all cursor-pointer overflow-hidden flex flex-col ${
                isSelected ? "ring-2 ring-primary shadow-lg" : "hover:shadow-md"
              }`}
              onClick={() => setSelectedPlantId(plant.id)}
            >
              <CardContent className="p-4 pb-0">
                <div className="relative aspect-square w-full rounded-lg overflow-hidden shadow-sm">
                  <img
                    src={plant.image_url || "/imagenotfound.jpeg"}
                    alt={plant.nombre_comun}
                    className="object-cover w-full h-full"
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
                {/* 📋 Grid de datos principales */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm w-full max-w-xs">
                  {/* 🌱 Nombre común */}
                  <div>
                    <p className="text-muted-foreground text-xs uppercase">
                      Common Name
                    </p>
                    <p className="font-semibold truncate">
                      {plant.nombre_comun}
                    </p>
                  </div>

                  {/* 🔬 Nombre científico */}
                  <div>
                    <p className="text-muted-foreground text-xs uppercase">
                      Scientific
                    </p>
                    <p className="italic truncate">
                      {plant.nombre_cientifico || "-"}
                    </p>
                  </div>

                  {/* 🏙️ Ciudad */}
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">
                      {owner?.ciudad || "Unknown"}
                    </span>
                  </div>

                  {/* 👤 Usuario */}
                  <div className="flex items-center  gap-2">
                    <img
                      src={owner?.avatar_url || "/avatar-placeholder.png"}
                      alt={owner?.username || "User"}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-muted-foreground truncate">
                      {owner?.username || "Anonymous"}
                    </span>
                  </div>
                </div>

                {/* 🤝 Botón */}
                <div className="mt-4 w-full">
                  <Button
                    disabled={!plant.disponible}
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTargetPlant(plant);
                      setOpenSwap(true);
                    }}
                  >
                    Propose Swap
                  </Button>
                </div>
              </CardHeader>
            </Card>
          );
        }}
      />

      {/* 🤝 Swap Modal */}
      <ProposeSwapModal
        open={openSwap}
        onOpenChange={setOpenSwap}
        targetPlant={targetPlant}
        userPlants={userPlants.filter((p) => p.disponible)}
      />
    </div>
  );
}
