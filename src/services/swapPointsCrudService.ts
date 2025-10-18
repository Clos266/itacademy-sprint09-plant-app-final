import { supabase } from "@/services/supabaseClient";
import type { Database } from "@/types/supabase";

type SwapPoint = Database["public"]["Tables"]["swap_points"]["Row"];

export async function fetchSwapPoints(): Promise<SwapPoint[]> {
  const { data, error } = await supabase.from("swap_points").select("*");

  if (error) {
    console.error("Error fetching swap points:", error);
    return [];
  }

  return data || [];
}
