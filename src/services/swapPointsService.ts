import { supabase } from "./supabaseClient";
import type { Database } from "@/types/supabase";

export type SwapPoint = Database["public"]["Tables"]["swap_points"]["Row"];
export type SwapPointInsert = Omit<SwapPoint, "id" | "created_at">;
export type SwapPointUpdate = Partial<SwapPoint>;

const TABLE = "swap_points" as const;

export async function fetchSwapPoints(): Promise<SwapPoint[]> {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching swap points:", error.message);
      throw new Error(`Failed to fetch swap points: ${error.message}`);
    }

    return data ?? [];
  } catch (error) {
    console.error("Service error in fetchSwapPoints:", error);
    throw error;
  }
}

export async function addSwapPoint(
  swapPoint: SwapPointInsert
): Promise<SwapPoint> {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .insert(swapPoint)
      .select()
      .single();

    if (error) {
      console.error("Error adding swap point:", error.message);
      throw new Error(`Failed to add swap point: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Service error in addSwapPoint:", error);
    throw error;
  }
}

export async function updateSwapPoint(
  id: number,
  updates: SwapPointUpdate
): Promise<SwapPoint> {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating swap point:", error.message);
      throw new Error(`Failed to update swap point: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Service error in updateSwapPoint:", error);
    throw error;
  }
}

export async function deleteSwapPoint(id: number): Promise<void> {
  try {
    const { error } = await supabase.from(TABLE).delete().eq("id", id);

    if (error) {
      console.error("Error deleting swap point:", error.message);
      throw new Error(`Failed to delete swap point: ${error.message}`);
    }
  } catch (error) {
    console.error("Service error in deleteSwapPoint:", error);
    throw error;
  }
}

export async function getSwapPointById(id: number): Promise<SwapPoint | null> {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching swap point:", error.message);
      throw new Error(`Failed to fetch swap point: ${error.message}`);
    }

    return data ?? null;
  } catch (error) {
    console.error("Service error in getSwapPointById:", error);
    throw error;
  }
}
