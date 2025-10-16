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
import { Pencil } from "lucide-react";

import { NewPlantButton } from "@/components/Plants/NewPlantModal";
import { EditPlantModal } from "@/components/Plants/EditPlantModal";
import { PlantDetailsModal } from "@/components/Plants/PlantDetailsModal";

import type { Database } from "@/types/supabase";
import {
  fetchPlants,
  updatePlant,
  deletePlant,
} from "@/services/plantCrudService";

type Plant = Database["public"]["Tables"]["plants"]["Row"];

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

  // 🔄 Fetch de plantas desde Supabase
  useEffect(() => {
    const loadPlants = async () => {
      try {
        setLoading(true);
        const data = await fetchPlants(true);
        setPlants(data);
      } catch (err) {
        console.error("Error al cargar plantas:", err);
        setError("No se pudieron cargar las plantas.");
      } finally {
        setLoading(false);
      }
    };
    loadPlants();
  }, []);

  // 🔍 Filtros y búsqueda
  const filteredPlants = plants.filter((p) => {
    const matchesSearch =
      p.nombre_comun?.toLowerCase().includes(search.toLowerCase()) ||
      p.nombre_cientifico?.toLowerCase().includes(search.toLowerCase()) ||
      p.especie?.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (filterType === "available") return p.disponible;
    if (filterType === "unavailable") return !p.disponible;
    return true;
  });

  const { page, totalPages, paginated, goToPage } = usePagination(
    filteredPlants,
    5
  );

  // 🔧 Helpers
  const handleDelete = async (id: number) => {
    if (!confirm("¿Seguro que quieres eliminar esta planta?")) return;
    try {
      await deletePlant(id);
      setPlants((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Error al eliminar planta:", err);
      alert("Error al eliminar la planta.");
    }
  };

  const handleUpdate = async (id: number, updates: Partial<Plant>) => {
    try {
      const updated = await updatePlant(id, updates);
      setPlants((prev) => prev.map((p) => (p.id === id ? updated : p)));
    } catch (err) {
      console.error("Error al actualizar planta:", err);
    }
  };

  // 🔄 UI
  if (loading)
    return (
      <div className="flex justify-center items-center h-[60vh] text-muted-foreground">
        Cargando plantas...
      </div>
    );

  if (error)
    return <div className="text-center mt-8 text-destructive">{error}</div>;

  return (
    <div className="space-y-6">
      {/* 🌿 Encabezado */}
      <PageHeader>
        <PageHeaderHeading>🌱 Mis Plantas</PageHeaderHeading>
      </PageHeader>

      {/* 🔍 Barra de búsqueda y filtros */}
      <Card>
        <CardContent>
          <FilterBar
            searchComponent={
              <SearchInput
                value={search}
                onChange={setSearch}
                onClear={() => setSearch("")}
                placeholder="Buscar por nombre o especie..."
              />
            }
            filters={
              <>
                <Select
                  value={filterType}
                  onValueChange={(v: "all" | "available" | "unavailable") =>
                    setFilterType(v)
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por disponibilidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="available">Disponibles</SelectItem>
                    <SelectItem value="unavailable">No disponibles</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => setSearch("")}>
                  Limpiar
                </Button>
              </>
            }
          />
        </CardContent>
      </Card>

      {/* 🪴 Tabla de plantas */}
      <PaginatedTable
        data={paginated}
        columns={[
          {
            key: "nombre_comun",
            header: "Nombre común",
            render: (p: Plant) => (
              <div
                onClick={() => {
                  setSelectedPlant(p);
                  setOpenDetails(true);
                }}
                className="cursor-pointer hover:text-primary"
              >
                {p.nombre_comun}
              </div>
            ),
          },
          {
            key: "nombre_cientifico",
            header: "Nombre científico",
            render: (p: Plant) => <em>{p.nombre_cientifico || "—"}</em>,
          },
          {
            key: "disponible",
            header: "Estado",
            render: (p: Plant) =>
              p.disponible ? "Disponible" : "No disponible",
          },
          {
            key: "actions",
            header: "Acciones",
            render: (p: Plant) => (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedPlant(p);
                    setOpenEdit(true);
                  }}
                >
                  <Pencil className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(p.id)}
                >
                  Eliminar
                </Button>
              </div>
            ),
          },
        ]}
        page={page}
        totalPages={totalPages}
        onPageChange={goToPage}
      />

      {/* ➕ Botón para nueva planta */}
      <div className="flex justify-end mt-4">
        <NewPlantButton />
      </div>

      {/* ✏️ Modal de edición */}
      <EditPlantModal
        open={openEdit}
        onOpenChange={setOpenEdit}
        plant={selectedPlant}
        onUpdate={handleUpdate}
      />

      {/* 🔍 Modal de detalles */}
      <PlantDetailsModal
        open={openDetails}
        onOpenChange={setOpenDetails}
        plant={selectedPlant}
      />
    </div>
  );
}
