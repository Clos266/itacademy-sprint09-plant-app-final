import { useState } from "react";
import { PageHeader, PageHeaderHeading } from "@/components/page-header";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Leaf, MapPin, Filter, Search, RefreshCcw } from "lucide-react";
import { mockPlants } from "@/data/mockPlants";
import { mockUsers } from "@/data/mockUsers";
import { ProposeSwapModal } from "@/components/swaps/ProposeSwapModal";

export default function PlantsSwapPage() {
  const [selectedPlantId, setSelectedPlantId] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<
    "all" | "available" | "unavailable"
  >("all");
  const [search, setSearch] = useState("");

  // 🔹 Filtering + Search
  const filteredPlants = mockPlants.filter((plant) => {
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

  const selectedPlant =
    filteredPlants.find((p) => p.id === selectedPlantId) || null;
  const [openSwap, setOpenSwap] = useState(false);
  const [targetPlant, setTargetPlant] = useState<any>(null);

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
        <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 p-4">
          {/* Search Field */}
          <div className="flex items-center gap-2 w-full md:w-1/2">
            <Input
              placeholder="Search plants or species..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="outline">
              <Search className="w-4 h-4" />
            </Button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
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
              className="ml-auto"
              onClick={() => setSearch("")}
            >
              <RefreshCcw className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 🪴 Plant list */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredPlants.map((plant) => {
          const isSelected = selectedPlantId === plant.id;
          const owner = mockUsers.find((u) => u.id === plant.user_id);

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
                    src={plant.image_url || "/placeholder-plant.jpg"}
                    alt={plant.nombre_comun}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant={plant.disponible ? "default" : "secondary"}>
                      {plant.disponible ? "Available" : "Not available"}
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

                  <div className="flex items-center gap-2 text-sm mb-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">
                      {owner?.city || "Unknown location"}
                    </span>
                  </div>

                  {owner && (
                    <div className="flex items-center gap-2 text-sm mb-1">
                      <img
                        src={owner.avatar_url}
                        alt={owner.username}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="text-muted-foreground">
                        by {owner.username}
                      </span>
                    </div>
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

        {filteredPlants.length === 0 && (
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
      <ProposeSwapModal
        open={openSwap}
        onOpenChange={setOpenSwap}
        targetPlant={targetPlant}
        userPlants={mockPlants.filter((p) => p.disponible)} // simula tus plantas disponibles
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
