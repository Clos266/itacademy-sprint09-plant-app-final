import type { Plant, PlantWithProfile } from "@/types/supabase";
import type { BaseModalProps } from "@/types/ui";

// ============================================================
// 🌱 TIPOS ESPECÍFICOS PARA COMPONENTES DE PLANTAS
// ============================================================

export interface PlantCardProps {
  plant: PlantWithProfile;
  isSelected?: boolean;
  onSelect?: (plantId: number) => void;
  onProposeSwap?: (plant: PlantWithProfile) => void;
}

export interface PlantFiltersProps {
  search: string;
  filterType: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (type: string) => void;
  onClearSearch: () => void;
}

export interface PlantDetailsModalProps extends BaseModalProps {
  plantId: number | null;
}

export interface EditPlantModalProps extends BaseModalProps {
  plant: Plant | null;
  onSave: (id: number, data: Partial<Plant>) => void;
}

// Tipos para formularios de plantas
export interface PlantFormData {
  nombre_comun: string;
  nombre_cientifico: string;
  familia: string;
  especie: string;
  disponible: boolean;
  interval_days: number;
  last_watered: string;
  image_url: string;
}
