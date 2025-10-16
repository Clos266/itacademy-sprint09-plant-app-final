import { supabase } from "./supabaseClient";
import type { Database } from "@/types/supabase";

type Plant = Database["public"]["Tables"]["plants"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type PlantInsert = Omit<Plant, "id" | "created_at">;
type PlantUpdate = Partial<Plant>;

const TABLE = "plants" as const;

// ✅ Tipo auxiliar con relación
export type PlantWithProfile = Plant & { profile?: Profile | null };

// 🌿 Obtener todas las plantas (con su propietario opcional)
export async function fetchPlants(
  withOwner = false
): Promise<PlantWithProfile[]> {
  let data: any[] | null = null;
  let error: any = null;

  if (withOwner) {
    const res = await supabase
      .from(TABLE)
      .select("*, profiles(*)")
      .order("created_at", { ascending: false });
    data = res.data;
    error = res.error;
  } else {
    const res = await supabase
      .from(TABLE)
      .select("*")
      .order("created_at", { ascending: false });
    data = res.data;
    error = res.error;
  }

  if (error) throw new Error(error.message);
  if (!data) return [];

  if (withOwner) {
    return data.map((p: any) => ({
      ...p,
      profile: p.profiles ?? null,
    }));
  }

  return data;
}

// 🌱 Obtener plantas por usuario
export async function fetchPlantsByUser(userId: string): Promise<Plant[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

// 🔍 Buscar plantas (por nombre común, científico o especie)
export async function searchPlants(
  term: string,
  onlyAvailable = false
): Promise<Plant[]> {
  let query = supabase
    .from(TABLE)
    .select("*")
    .or(
      `nombre_comun.ilike.%${term}%,nombre_cientifico.ilike.%${term}%,especie.ilike.%${term}%`
    );

  if (onlyAvailable) query = query.eq("disponible", true);

  const { data, error } = await query.order("created_at", { ascending: false });

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

// 🌾 Obtener una planta por ID (con su propietario)
export async function getPlantById(
  id: number,
  withOwner = false
): Promise<PlantWithProfile | null> {
  let data: any = null;
  let error: any = null;

  if (withOwner) {
    const res = await supabase
      .from(TABLE)
      .select("*, profiles(*)")
      .eq("id", id)
      .single();
    data = res.data;
    error = res.error;
  } else {
    const res = await supabase.from(TABLE).select("*").eq("id", id).single();
    data = res.data;
    error = res.error;
  }

  if (error) {
    console.error("Error al obtener planta:", error.message);
    return null;
  }

  if (withOwner && data) {
    return { ...data, profile: data.profiles ?? null };
  }

  return data;
}

// 🌸 Obtener plantas disponibles
export async function fetchAvailablePlants(): Promise<Plant[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("disponible", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}
