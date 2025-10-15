import { supabase } from "./supabaseClient";

export interface EventItem {
  id: number;
  user_id: string;
  title: string;
  description?: string | null;
  date: string;
  location: string;
  swap_point_id?: number | null;
  image_url?: string | null;
  created_at?: string;
}

const TABLE = "events";

export async function fetchEvents(): Promise<EventItem[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("date", { ascending: true });
  if (error) throw new Error(error.message);
  return data || [];
}
