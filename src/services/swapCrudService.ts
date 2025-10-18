import { supabase } from "./supabaseClient";
import type { Database } from "@/types/supabase";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { showError, showSuccess } from "@/services/toastService";

export type Swap = Database["public"]["Tables"]["swaps"]["Row"];
export type SwapInsert = Omit<
  Swap,
  "id" | "created_at" | "updated_at" | "status"
> & {
  status?: Swap["status"]; // por si quieres setearlo tú (default: pending)
};
export type SwapUpdate = Partial<Swap>;
export type SwapPoint = Database["public"]["Tables"]["swap_points"]["Row"];

const TABLE = "swaps" as const;
const MSG_TABLE = "swap_messages" as const;
const POINTS_TABLE = "swap_points" as const;

/**
 * ➕ Crear propuesta de intercambio
 * - Inserta en `swaps`
 * - Si hay `initialMessage`, crea un mensaje en `swap_messages`
 */
export async function addSwapProposal(params: {
  sender_id: string;
  receiver_id: string;
  sender_plant_id: number;
  receiver_plant_id: number;
  swap_point_id?: number | null;
  status?: Swap["status"]; // default: 'pending'
  initialMessage?: string;
}) {
  const {
    sender_id,
    receiver_id,
    sender_plant_id,
    receiver_plant_id,
    swap_point_id = null,
    status = "pending",
    initialMessage,
  } = params;

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      sender_id,
      receiver_id,
      sender_plant_id,
      receiver_plant_id,
      swap_point_id,
      status,
    })
    .select()
    .single();

  if (error) {
    showError("Failed to send swap proposal.");
    throw new Error(error.message);
  }

  // Mensaje inicial (opcional) -> swap_messages
  if (initialMessage?.trim()) {
    const { error: msgError } = await supabase.from(MSG_TABLE).insert({
      swap_id: data.id,
      sender_id,
      message: initialMessage.trim(),
    });
    if (msgError) {
      // No rompemos el flujo si el mensaje falla; solo avisamos en consola
      console.warn("swap_messages insert failed:", msgError.message);
    }
  }

  showSuccess("Swap proposal sent!");
  return data;
}

/**
 * 🔍 Traer swaps del usuario (enviados o recibidos)
 * Tip: si quieres relaciones para UI, amplía el select con joins.
 */
export async function fetchUserSwaps(userId: string) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

/** 🟢 Aceptar */
export async function acceptSwap(id: number) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ status: "accepted" })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  showSuccess("Swap accepted!");
  return data;
}

/** 🔴 Rechazar */
export async function rejectSwap(id: number) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ status: "rejected" })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  showError("Swap rejected.");
  return data;
}

/** 🟣 Completar (cuando se concrete el intercambio) */
export async function completeSwap(id: number) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ status: "completed" })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  showSuccess("Swap completed!");
  return data;
}

/** ❌ Cancelar / eliminar */
export async function deleteSwap(id: number) {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message);
  showSuccess("Swap cancelled.");
}

/** 🔁 Realtime swaps del usuario (enviados o recibidos) */
export function subscribeToUserSwaps(
  userId: string,
  onChange: (payload: RealtimePostgresChangesPayload<Swap>) => void
) {
  if (!userId) {
    console.warn("subscribeToUserSwaps: missing userId");
    return () => {};
  }

  // Nota: postgres_changes no permite OR en filter -> escuchamos todos y filtramos en callback
  const channel = supabase
    .channel(`swaps-user-${userId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: TABLE },
      (payload) => {
        const rec = (payload.new || payload.old) as Swap | null;
        if (!rec) return;
        if (rec.sender_id === userId || rec.receiver_id === userId) {
          onChange(payload as RealtimePostgresChangesPayload<Swap>);
        }
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}

/** 📍 Puntos de intercambio */
export async function fetchSwapPoints(): Promise<SwapPoint[]> {
  const { data, error } = await supabase
    .from(POINTS_TABLE)
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}
