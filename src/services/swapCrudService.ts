import { supabase } from "./supabaseClient";
import type { Database } from "@/types/supabase";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { showError, showSuccess } from "@/services/toastService";

export type Swap = Database["public"]["Tables"]["swaps"]["Row"];
export type SwapInsert = Omit<
  Swap,
  "id" | "created_at" | "updated_at" | "status"
> & { status?: Swap["status"] };
export type SwapUpdate = Partial<Swap>;
export type SwapPoint = Database["public"]["Tables"]["swap_points"]["Row"];

const TABLE = "swaps" as const;
const MSG_TABLE = "swap_messages" as const;
const POINTS_TABLE = "swap_points" as const;

/* ============================================================
 🌿 FETCH SWAPS CON RELACIONES
============================================================ */
export async function fetchSwapsWithRelations(userId?: string) {
  let query = supabase
    .from(TABLE)
    .select(
      `
      *,
      sender:sender_id(*),
      receiver:receiver_id(*),
      senderPlant:sender_plant_id(*),
      receiverPlant:receiver_plant_id(*)
    `
    )
    .order("created_at", { ascending: false });

  if (userId) {
    query = query.or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching swaps with relations:", error.message);
    throw new Error(error.message);
  }

  return (data || []).map((s: any) => ({
    ...s,
    sender: s.sender || null,
    receiver: s.receiver || null,
    senderPlant: s.senderPlant || null,
    receiverPlant: s.receiverPlant || null,
  }));
}

/* ============================================================
 ➕ CREAR PROPUESTA DE SWAP
============================================================ */
export async function addSwapProposal(params: {
  sender_id: string;
  receiver_id: string;
  sender_plant_id: number;
  receiver_plant_id: number;
  swap_point_id?: number | null;
  status?: Swap["status"];
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

  if (initialMessage?.trim()) {
    await supabase.from(MSG_TABLE).insert({
      swap_id: data.id,
      sender_id,
      message: initialMessage.trim(),
    });
  }

  showSuccess("Swap proposal sent!");
  return data;
}

/* ============================================================
 🔄 ACTUALIZAR ESTADOS
============================================================ */
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

export async function deleteSwap(id: number) {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message);
  showSuccess("Swap cancelled.");
}

/* ============================================================
 ⚡ SUSCRIPCIÓN REALTIME
============================================================ */
export function subscribeToUserSwaps(
  userId: string,
  onChange: (payload: RealtimePostgresChangesPayload<Swap>) => void
) {
  if (!userId) return () => {};

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

/* ============================================================
 📍 PUNTOS DE INTERCAMBIO
============================================================ */
export async function fetchSwapPoints(): Promise<SwapPoint[]> {
  const { data, error } = await supabase
    .from(POINTS_TABLE)
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}
