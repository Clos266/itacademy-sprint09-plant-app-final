import { useEffect, useState } from "react";
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
import type { Database } from "@/types/supabase";
import { showSuccess } from "@/services/toastService";
import { supabase } from "@/services/supabaseClient";

type Plant = Database["public"]["Tables"]["plants"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
interface FullPlant extends Plant {
  profile?: Profile | null;
}

export default function PlantsSwapPage() {
  const [plants, setPlants] = useState<FullPlant[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<
    "all" | "available" | "unavailable"
  >("all");
  const [search, setSearch] = useState("");
  const [selectedPlantId, setSelectedPlantId] = useState<number | null>(null);
  const [openSwap, setOpenSwap] = useState(false);
  const [targetPlant, setTargetPlant] = useState<FullPlant | null>(null);

  // 🌿 Fetch all plants with owner info
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

        // ✅ Trae todas las plantas con su dueño
        const data = await fetchPlants(true);

        // 🚫 Filtra tus propias plantas
        const otherPlants = data.filter((p) => p.user_id !== user.id);

        setPlants(otherPlants);
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
  const filteredPlants = plants.filter((plant) => {
    const term = search.toLowerCase();
    const matchesSearch =
      plant.nombre_comun?.toLowerCase().includes(term) ||
      plant.nombre_cientifico?.toLowerCase().includes(term) ||
      plant.especie?.toLowerCase().includes(term);

    if (!matchesSearch) return false;
    if (filterType === "available") return plant.disponible;
    if (filterType === "unavailable") return !plant.disponible;
    return true;
  });

  // 🌀 Spinner mientras carga
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[70vh] text-muted-foreground">
        <Spinner className="w-6 h-6 mb-4" />
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-6">
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
                onChange={setSearch}
                onClear={() => setSearch("")}
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
                    onClick={() => setFilterType(type as any)}
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

      {/* 🪴 Plant List */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredPlants.map((plant) => {
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

              <CardHeader className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold truncate">
                    {plant.nombre_comun}
                  </h3>
                  {plant.nombre_cientifico && (
                    <p className="italic text-muted-foreground text-sm mb-2">
                      {plant.nombre_cientifico}
                    </p>
                  )}

                  {owner && (
                    <>
                      <div className="flex items-center gap-2 text-sm mb-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">
                          {owner.ciudad || "Unknown location"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm mb-1">
                        <img
                          src={owner.avatar_url || "/avatar-placeholder.png"}
                          alt={owner.username || "User"}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="text-muted-foreground">
                          by {owner.username}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* 🤝 Swap button */}
                <div className="mt-4">
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
        })}

        {!filteredPlants.length && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                No {filterType !== "all" ? filterType : ""} plants found.
              </p>
              <Button onClick={() => setFilterType("all")}>Show All</Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 🤝 Swap Modal */}
      <ProposeSwapModal
        open={openSwap}
        onOpenChange={setOpenSwap}
        targetPlant={targetPlant}
        userPlants={plants.filter((p) => p.disponible)}
        onConfirm={(proposal) => {
          console.log("📩 Swap proposed:", proposal);
          showSuccess("Swap proposal sent!");
        }}
      />
    </div>
  );
}
