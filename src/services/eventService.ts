// src/services/useEventsService.ts
import { supabase } from "./supabaseClient";
import type { Database } from "@/types/supabase";

type Event = Database["public"]["Tables"]["events"]["Row"];
type EventInsert = Omit<Event, "id">;
type EventUpdate = Partial<Event>;

const TABLE = "events" as const;

// 📅 Obtener todos los eventos
export async function fetchEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("date", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

// ➕ Crear evento
export async function addEvent(event: EventInsert): Promise<Event> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(event)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ✏️ Actualizar evento
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

  if (error) throw new Error(error.message);
  return data;
}

// ❌ Eliminar evento
export async function deleteEvent(id: number): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message);
}
