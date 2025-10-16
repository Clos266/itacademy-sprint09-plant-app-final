import { useEffect, useState } from "react";
import { PageHeader, PageHeaderHeading } from "@/components/page-header";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Leaf, MapPin, Filter, RefreshCcw } from "lucide-react";

import { FilterBar } from "@/components/common/FilterBar";
import { SearchInput } from "@/components/common/SearchInput";
import { ProposeSwapModal } from "@/components/swaps/ProposeSwapModal";

import { supabase } from "@/services/supabaseClient";
import type { Database } from "@/types/supabase";

type Plant = Database["public"]["Tables"]["plants"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface FullPlant extends Plant {
  profile?: Profile;
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

  // 🔹 Fetch all plants with owner info
  useEffect(() => {
    const fetchPlants = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("plants")
        .select("*, profiles(*)")
        .order("id", { ascending: true });

      if (error) {
        console.error("Error fetching plants:", error.message);
      } else {
        // Asegura estructura homogénea
        const formatted = data.map((p: any) => ({
          ...p,
          profile: p.profiles,
        }));
        setPlants(formatted);
      }
      setLoading(false);
    };

    fetchPlants();
  }, []);

  // 🔍 Filter & Search
  const filteredPlants = plants.filter((plant) => {
    const matchesSearch =
      plant.nombre_comun.toLowerCase().includes(search.toLowerCase()) ||
      (plant.nombre_cientifico || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (plant.especie || "").toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (filterType === "available") return plant.disponible;
    if (filterType === "unavailable") return !plant.disponible;
    return true;
  });

  // const selectedPlant =
  //   filteredPlants.find((p) => p.id === selectedPlantId) || null;

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Cargando plantas...
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
                <Button
                  variant={filterType === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("all")}
                >
                  All
                </Button>
                <Button
                  variant={filterType === "available" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("available")}
                >
                  Available
                </Button>
                <Button
                  variant={filterType === "unavailable" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("unavailable")}
                >
                  Unavailable
                </Button>
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

      {/* 🪴 Plant list */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredPlants.map((plant) => {
          const isSelected = selectedPlantId === plant.id;
          const owner = plant.profile;

          return (
            <Card
              key={plant.id}
              className={`transition-all cursor-pointer overflow-hidden flex flex-col ${
                isSelected ? "ring-2 ring-primary shadow-lg" : "hover:shadow-md"
              }`}
              onClick={() => setSelectedPlantId(plant.id)}
            >
              {/* 📸 Image */}
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

              {/* 🌱 Info */}
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
        userPlants={plants.filter((p) => p.disponible)} // tus plantas disponibles
        onConfirm={(proposal) => {
          console.log("📩 New swap proposal:", proposal);
          alert(
            `Swap proposed: your plant #${proposal.offeredPlantId} for plant #${proposal.targetPlantId}`
          );
        }}
      />
    </div>
  );
}
