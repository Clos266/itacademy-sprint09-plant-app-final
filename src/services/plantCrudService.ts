import { supabase } from "./supabaseClient";
import type { Database } from "@/types/supabase";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export type Plant = Database["public"]["Tables"]["plants"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type PlantInsert = Omit<Plant, "id" | "created_at">;
export type PlantUpdate = Partial<Plant>;
export type PlantWithProfile = Plant & { profile?: Profile | null };

const TABLE = "plants" as const;

export async function fetchPlants(
  withOwner = false
): Promise<PlantWithProfile[]> {
  const res = withOwner
    ? await supabase.from(TABLE).select("*, profiles(*)")
    : await supabase.from(TABLE).select("*");

  if (res.error) throw new Error(res.error.message);
  if (!res.data) return [];

  if (withOwner) {
    return res.data.map((p: any) => ({
      ...p,
      profile: p.profiles ?? null,
    }));
  }

  return res.data;
}

export async function fetchPlantsByUser(userId: string): Promise<Plant[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

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

export async function addPlant(plant: PlantInsert): Promise<Plant> {
  if (!plant.user_id) throw new Error("Missing user_id");
  const { data, error } = await supabase
    .from(TABLE)
    .insert(plant)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

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

export async function deletePlant(id: number): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function getPlantById(
  id: number,
  withOwner = false
): Promise<PlantWithProfile | null> {
  const res = withOwner
    ? await supabase.from(TABLE).select("*, profiles(*)").eq("id", id).single()
    : await supabase.from(TABLE).select("*").eq("id", id).single();

  if (res.error) {
    console.error("Error fetching plant:", res.error.message);
    return null;
  }

  if (withOwner && res.data) {
    return { ...res.data, profile: res.data.profiles ?? null };
  }

  return res.data;
}

export async function fetchAvailablePlants(): Promise<Plant[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("disponible", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export function subscribeToUserPlants(
  userId: string,
  onChange: (payload: RealtimePostgresChangesPayload<Plant>) => void
) {
  const channel = supabase
    .channel(`plants-user-${userId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: TABLE,
        filter: `user_id=eq.${userId}`,
      },
      (payload: RealtimePostgresChangesPayload<Plant>) => {
        onChange(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
