import { supabase } from "./supabaseClient";
import type { Database } from "@/types/supabase";

type Event = Database["public"]["Tables"]["events"]["Row"];
type EventInsert = Omit<Event, "id" | "created_at">;
type EventUpdate = Partial<Event>;

const TABLE = "events" as const;

export async function fetchEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("date", { ascending: false });

  if (error) {
    console.error("Error fetching events:", error);
    return [];
  }

  return data ?? [];
}

export async function addEvent(event: EventInsert): Promise<Event> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(event)
    .select()
    .single();

  if (error) {
    console.error("Error adding event:", error);
    throw new Error(error.message);
  }

  return data;
}

export async function updateEvent(
  id: number,
  updates: EventUpdate
): Promise<Event> {
  const { data, error } = await supabase
    .from(TABLE)
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating event:", error);
    throw new Error(error.message);
  }

  return data;
}

export async function deleteEvent(id: number): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);

  if (error) {
    console.error("Error deleting event:", error);
    throw new Error(error.message);
  }
}
