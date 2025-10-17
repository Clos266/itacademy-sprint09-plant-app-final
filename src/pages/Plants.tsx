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
import { Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import { NewPlantButton } from "@/components/Plants/NewPlantModal";
import { EditPlantModal } from "@/components/Plants/EditPlantModal";
import { PlantDetailsModal } from "@/components/Plants/PlantDetailsModal";

import type { Database } from "@/types/supabase";
import { fetchPlantsByUser, updatePlant } from "@/services/plantCrudService";
import { supabase } from "@/services/supabaseClient";

type Plant = Database["public"]["Tables"]["plants"]["Row"];

export default function MyPlantsPage() {
  // 🌱 State
  const [plants, setPlants] = useState<Plant[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);

  const [openEdit, setOpenEdit] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "available" | "unavailable"
  >("all");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔄 Cargar solo las plantas del usuario actual
  useEffect(() => {
    const loadMyPlants = async () => {
      try {
        setLoading(true);
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!user) throw new Error("No hay sesión activa");

        const data = await fetchPlantsByUser(user.id);
        setPlants(data);
      } catch (err) {
        console.error("Error al cargar mis plantas:", err);
        setError("No se pudieron cargar tus plantas.");
      } finally {
        setLoading(false);
      }
    };

    loadMyPlants();
  }, []);

  // 🔍 Filtrado local
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

  // 🔹 Paginación
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

  // 💾 Guardar cambios en Supabase
  const handleSave = async (id: number, updated: Partial<Plant>) => {
    try {
      const newPlant = await updatePlant(id, updated);
      setPlants((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...newPlant } : p))
      );
    } catch (err) {
      console.error("Error al actualizar planta:", err);
    }
  };

  // 🗑️ Eliminar planta
  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase.from("plants").delete().eq("id", id);
      if (error) throw error;
      setPlants((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Error deleting plant:", err);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-[60vh] text-muted-foreground">
        Cargando tus plantas...
      </div>
    );

  if (error)
    return <div className="text-center mt-8 text-destructive">{error}</div>;

  return (
    <>
      {/* 🌿 Header */}
      <PageHeader>
        <PageHeaderHeading>My Plants</PageHeaderHeading>
      </PageHeader>

      <Card className="mt-4">
        <CardContent>
          <FilterBar
            searchComponent={
              <SearchInput
                value={search}
                onChange={setSearch}
                onClear={() => setSearch("")}
                placeholder="Search your plants..."
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
            render: (p: Plant) => (
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
            render: (p: Plant) => <span>{p.nombre_comun}</span>,
          },
          {
            key: "nombre_cientifico",
            header: "Scientific Name",
            render: (p: Plant) => p.nombre_cientifico || "—",
          },
          {
            key: "actions",
            header: "Actions",
            render: (p: Plant) => (
              <div className="flex items-center gap-2">
                {/* ✏️ Edit button */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(p)}
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </Button>

                {/* 🗑️ Delete with AlertDialog */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="destructive"
                      title="Delete"
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>

                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Plant</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete{" "}
                        <span className="font-semibold">{p.nombre_comun}</span>?{" "}
                        <br />
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(p.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
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
        plantId={selectedPlant?.id || null}
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
