import { supabase } from "./supabaseClient";

export interface Plant {
  id: number;
  user_id: string;
  nombre_comun: string;
  nombre_cientifico?: string;
  especie?: string;
  familia?: string;
  disponible?: boolean;
  interval_days?: number;
  last_watered?: string;
  image_url?: string;
  created_at?: string;
}

const TABLE = "plants";

export async function fetchPlants(): Promise<Plant[]> {
  const { data, error } = await supabase.from(TABLE).select("*").order("id");
  if (error) throw new Error(error.message);
  return data || [];
}

export async function addPlant(plant: Omit<Plant, "id">) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(plant)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updatePlant(id: number, updates: Partial<Plant>) {
  const { data, error } = await supabase
    .from(TABLE)
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deletePlant(id: number) {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message);
}
