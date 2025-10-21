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
import {
  fetchPlantsByUser,
  updatePlant,
  deletePlant,
  subscribeToUserPlants,
} from "@/services/plantCrudService";
import { showSuccess, showError, showWarning } from "@/services/toastService";
import { supabase } from "@/services/supabaseClient";

type Plant = Database["public"]["Tables"]["plants"]["Row"];

export default function MyPlantsPage() {
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

  // 🔄 Load and subscribe to user plants
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const loadMyPlants = async () => {
      try {
        setLoading(true);
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!user) throw new Error("No active session");

        const data = await fetchPlantsByUser(user.id);
        setPlants(data);

        // 🪴 Realtime listener
        unsubscribe = subscribeToUserPlants(user.id, (payload) => {
          if (payload.eventType === "INSERT" && payload.new) {
            setPlants((prev) => [payload.new, ...prev]);
            showSuccess(`Added new plant: ${payload.new.nombre_comun}`);
          }
          if (payload.eventType === "UPDATE" && payload.new) {
            setPlants((prev) =>
              prev.map((p) => (p.id === payload.new.id ? payload.new : p))
            );
          }
          if (payload.eventType === "DELETE" && payload.old) {
            setPlants((prev) => prev.filter((p) => p.id !== payload.old.id));
            showError(`Deleted plant: ${payload.old.nombre_comun}`);
          }
        });
      } catch (err: any) {
        console.error("Error loading plants:", err);
        showError("Could not load your plants.");
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadMyPlants();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // ✏️ Update plant
  const handleSave = async (id: number, updated: Partial<Plant>) => {
    try {
      const newPlant = await updatePlant(id, updated);
      setPlants((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...newPlant } : p))
      );
      showSuccess("Plant updated successfully!");
    } catch (err: any) {
      showError(err.message || "Error updating plant.");
    }
  };

  // 🗑️ Delete plant
  const handleDelete = async (id: number) => {
    try {
      await deletePlant(id);
      // no need to manually update state (realtime handles it)
      showWarning("Plant deleted!");
    } catch (err: any) {
      showError(err.message || "Error deleting plant.");
    }
  };

  // 🔍 Local filtering
  const filtered = plants.filter((p) => {
    const searchMatch = p.nombre_comun
      ?.toLowerCase()
      .includes(search.toLowerCase());
    const availabilityMatch =
      filterType === "all"
        ? true
        : filterType === "available"
        ? p.disponible
        : !p.disponible;
    const categoryMatch =
      category === "all" ||
      p.especie?.toLowerCase().includes(category.toLowerCase());
    return searchMatch && availabilityMatch && categoryMatch;
  });

  const { page, totalPages, paginated, goToPage } = usePagination(filtered, 5);

  const handleEdit = (plant: Plant) => {
    setSelectedPlant(plant);
    setOpenEdit(true);
  };

  const handleOpenDetails = (plant: Plant) => {
    setSelectedPlant(plant);
    setOpenDetails(true);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-[60vh] text-muted-foreground">
        Loading your plants...
      </div>
    );

  if (error)
    return <div className="text-center mt-8 text-destructive">{error}</div>;

  return (
    <>
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

                <NewPlantButton />
              </>
            }
          />
        </CardContent>
      </Card>

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
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(p)}
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>

                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Plant</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete{" "}
                        <span className="font-semibold">{p.nombre_comun}</span>?
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(p.id)}>
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

      <PlantDetailsModal
        open={openDetails}
        onOpenChange={setOpenDetails}
        plantId={selectedPlant?.id || null}
      />

      <EditPlantModal
        open={openEdit}
        onOpenChange={setOpenEdit}
        plant={selectedPlant}
        onSave={handleSave}
      />
    </>
  );
}
