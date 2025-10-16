// src/services/usePlantsService.ts
import { supabase } from "./supabaseClient";
import type { Database } from "@/types/supabase";

type Plant = Database["public"]["Tables"]["plants"]["Row"];
type PlantInsert = Omit<Plant, "id" | "created_at">;
type PlantUpdate = Partial<Plant>;

const TABLE = "plants" as const;

// 🌱 Obtener todas las plantas
export async function fetchPlants(): Promise<Plant[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("id", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

// ➕ Agregar una planta
export async function addPlant(plant: PlantInsert): Promise<Plant> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(plant)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// ✏️ Actualizar planta
export async function updatePlant(
  id: number,
  updates: PlantUpdate
): Promise<Plant> {
  const { data, error } = await supabase
    .from(TABLE)
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// ❌ Borrar planta
export async function deletePlant(id: number): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message);
}
