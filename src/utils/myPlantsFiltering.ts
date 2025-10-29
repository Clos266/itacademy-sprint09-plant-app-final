import type { Database } from "@/types/supabase";
import { DOMAIN_FILTER_TYPES } from "@/constants/filterTypes";

type Plant = Database["public"]["Tables"]["plants"]["Row"];
type FilterType = (typeof DOMAIN_FILTER_TYPES.PLANTS.STATUS)[number];
export type SortableField = keyof Pick<
  Plant,
  "nombre_comun" | "nombre_cientifico" | "created_at" | "disponible"
>;
export type SortDirection = "asc" | "desc";

export function filterAndSortMyPlants(
  plants: Plant[],
  searchTerm: string,
  statusFilter: FilterType,
  sortField: SortableField = "created_at",
  sortDirection: SortDirection = "desc"
): Plant[] {
  let filtered = plants;

  if (searchTerm.trim()) {
    const search = searchTerm.toLowerCase();
    filtered = filtered.filter(
      (plant) =>
        plant.nombre_comun?.toLowerCase().includes(search) ||
        plant.nombre_cientifico?.toLowerCase().includes(search) ||
        plant.especie?.toLowerCase().includes(search) ||
        plant.familia?.toLowerCase().includes(search)
    );
  }

  if (statusFilter !== "all") {
    filtered = filtered.filter((plant) =>
      statusFilter === "available" ? plant.disponible : !plant.disponible
    );
  }

  return [...filtered].sort((a, b) => {
    const valueA = a[sortField];
    const valueB = b[sortField];

    if (valueA == null && valueB == null) return 0;
    if (valueA == null) return sortDirection === "asc" ? 1 : -1;
    if (valueB == null) return sortDirection === "asc" ? -1 : 1;

    const aVal = typeof valueA === "string" ? valueA.toLowerCase() : valueA;
    const bVal = typeof valueB === "string" ? valueB.toLowerCase() : valueB;

    const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return sortDirection === "desc" ? -comparison : comparison;
  });
}

export function getPlantDisplayName(plant: Plant): string {
  return plant.nombre_comun || plant.nombre_cientifico || "Unnamed Plant";
}

export function getPlantAvailabilityStatus(plant: Plant): {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
} {
  return plant.disponible
    ? { label: "Available", variant: "default" }
    : { label: "Not Available", variant: "secondary" };
}

export function getPlantImageUrl(plant: Plant): string {
  return plant.image_url || "/imagenotfound.jpeg";
}

export function getMyPlantsStats(plants: Plant[]) {
  const total = plants.length;
  const available = plants.filter((p) => p.disponible).length;
  const withImages = plants.filter((p) => p.image_url).length;
  const complete = plants.filter(
    (p) => p.nombre_comun && p.nombre_cientifico && p.especie && p.image_url
  ).length;

  return {
    total,
    available,
    unavailable: total - available,
    withImages,
    complete,
    completionRate: total > 0 ? Math.round((complete / total) * 100) : 0,
    availabilityRate: total > 0 ? Math.round((available / total) * 100) : 0,
  };
}

export function canEditPlant(plant: Plant, userId: string): boolean {
  return plant.user_id === userId;
}
