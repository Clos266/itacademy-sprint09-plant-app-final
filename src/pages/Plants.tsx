import { useEffect, useState } from "react";
import { PageHeader, PageHeaderHeading } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilterBar } from "@/components/common/FilterBar";
import { PaginatedTable } from "@/components/common/PaginatedTable";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { usePagination } from "@/hooks/usePagination";
import { SearchInput } from "@/components/common/SearchInput";
import type { Plant } from "@/services/plantCrudService";
import { fetchPlants, updatePlant } from "@/services/plantCrudService";
import { NewPlantButton } from "@/components/Plants/NewPlantModal";
import { EditPlantModal } from "@/components/Plants/EditPlantModal";
import { PlantDetailsModal } from "@/components/Plants/PlantDetailsModal";
import { Pencil } from "lucide-react";

export default function PlantsPage() {
  // 🌱 State
  const [plants, setPlants] = useState<Plant[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [openEdit, setOpenEdit] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "available" | "unavailable"
  >("all");
  const [category, setCategory] = useState("all");

  // 🌿 Fetch data from Supabase
  useEffect(() => {
    const loadPlants = async () => {
      try {
        setLoading(true);
        const data = await fetchPlants();
        setPlants(data);
      } catch (err) {
        console.error("Error al obtener plantas:", err);
        setError("No se pudieron cargar las plantas.");
      } finally {
        setLoading(false);
      }
    };
    loadPlants();
  }, []);

  // 🔍 Filtering
  const filtered = plants.filter((p) => {
    const matchesSearch = p.nombre_comun
      ?.toLowerCase()
      .includes(search.toLowerCase());
    const matchesAvailability =
      filterType === "all"
        ? true
        : filterType === "available"
        ? p.disponible
        : !p.disponible;
    const matchesCategory =
      category === "all" ||
      p.especie?.toLowerCase().includes(category.toLowerCase());
    return matchesSearch && matchesAvailability && matchesCategory;
  });

  // 🔹 Pagination
  const { page, totalPages, paginated, goToPage } = usePagination(filtered, 5);

  // ✏️ Edit handlers
  const handleEdit = (plant: Plant) => {
    setSelectedPlant(plant);
    setOpenEdit(true);
  };

  // 👁️ Details modal handler
  const handleOpenDetails = (plant: Plant) => {
    setSelectedPlant(plant);
    setOpenDetails(true);
  };

  // 💾 Save changes to Supabase
  const handleSave = async (id: number, updated: Partial<Plant>) => {
    try {
      const saved = await updatePlant(id, updated);
      setPlants((prev) => prev.map((p) => (p.id === id ? saved : p)));
    } catch (err) {
      console.error("Error al actualizar planta:", err);
      alert("Hubo un error al actualizar la planta.");
    }
  };

  // ⏳ Loading / error states
  if (loading)
    return (
      <p className="text-center mt-8 text-muted-foreground">
        🌿 Cargando plantas...
      </p>
    );
  if (error)
    return <p className="text-center mt-8 text-destructive">❌ {error}</p>;

  return (
    <>
      {/* 🌿 Header */}
      <PageHeader>
        <PageHeaderHeading>🌿 My Plants</PageHeaderHeading>
      </PageHeader>

      <Card className="mt-4">
        <CardContent>
          <FilterBar
            searchComponent={
              <SearchInput
                value={search}
                onChange={setSearch}
                onClear={() => setSearch("")}
                placeholder="Search plants..."
              />
            }
            filters={
              <>
                {/* Filter by availability */}
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

                {/* Category select */}
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="suculentas">Succulents</SelectItem>
                    <SelectItem value="cactus">Cactus</SelectItem>
                    <SelectItem value="interior">Indoor</SelectItem>
                  </SelectContent>
                </Select>

                {/* ➕ New plant button */}
                <NewPlantButton />
              </>
            }
          />
        </CardContent>
      </Card>

      {/* 📋 Plants Table */}
      <PaginatedTable
        data={paginated}
        columns={[
          {
            key: "image",
            header: "Image",
            render: (p) => (
              <img
                src={p.image_url || "/public/imagenotfound.jpeg"}
                alt={p.nombre_comun}
                className="w-12 h-12 rounded-lg object-cover shadow-sm cursor-pointer transition-transform hover:scale-105"
                onClick={() => handleOpenDetails(p)}
              />
            ),
          },
          {
            key: "nombre_comun",
            header: "Common Name",
            render: (p) => <span>{p.nombre_comun}</span>,
          },
          {
            key: "nombre_cientifico",
            header: "Scientific Name",
            render: (p) => p.nombre_cientifico || "—",
          },
          {
            key: "actions",
            header: "Edit",
            render: (p) => (
              <Button size="sm" variant="outline" onClick={() => handleEdit(p)}>
                <Pencil className="w-4 h-4" />
              </Button>
            ),
          },
        ]}
        page={page}
        totalPages={totalPages}
        onPageChange={goToPage}
      />

      {/* 👁️ Details Modal */}
      <PlantDetailsModal
        open={openDetails}
        onOpenChange={setOpenDetails}
        plant={selectedPlant}
      />

      {/* ✏️ Edit Modal */}
      <EditPlantModal
        open={openEdit}
        onOpenChange={setOpenEdit}
        plant={selectedPlant}
        onSave={handleSave}
      />
    </>
  );
}
