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
/** 🔁 Actualizar estado del swap y disponibilidad de plantas */
export async function updateSwapStatusWithAvailability(
  swapId: number,
  status: "accepted" | "rejected" | "pending" | "completed",
  senderPlantId?: number,
  receiverPlantId?: number
) {
  const { error: swapError } = await supabase
    .from("swaps")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", swapId);

  if (swapError) throw swapError;

  // 🪴 Actualizar disponibilidad de plantas
  if (status === "accepted" || status === "pending") {
    // 🔒 Bloquear plantas
    const { error: plantError } = await supabase
      .from("plants")
      .update({ disponible: false })
      .in("id", [senderPlantId, receiverPlantId].filter(Boolean));

    if (plantError) throw plantError;
  } else if (status === "rejected") {
    // 🔓 Revertir disponibilidad
    const { error: revertError } = await supabase
      .from("plants")
      .update({ disponible: true })
      .in("id", [senderPlantId, receiverPlantId].filter(Boolean));

    if (revertError) throw revertError;
  } else if (status === "completed") {
    // 🌱 Liberar plantas al completar el intercambio
    const { error: completeError } = await supabase
      .from("plants")
      .update({ disponible: true })
      .in("id", [senderPlantId, receiverPlantId].filter(Boolean));

    if (completeError) throw completeError;
  }

  return { success: true };
}

export async function markSwapAsCompletedByUser(
  swapId: number,
  userId: string
) {
  // 1️⃣ Obtener el swap actual con las plantas
  const { data: swap, error: fetchError } = await supabase
    .from("swaps")
    .select(
      `
      id,
      sender_id,
      receiver_id,
      sender_completed,
      receiver_completed,
      senderPlant:sender_plant_id(id, user_id),
      receiverPlant:receiver_plant_id(id, user_id)
      `
    )
    .eq("id", swapId)
    .single();

  if (fetchError || !swap) throw fetchError;

  // ⚙️ Asegurar que las relaciones no sean arrays
  const senderPlant = Array.isArray(swap.senderPlant)
    ? swap.senderPlant[0]
    : swap.senderPlant;
  const receiverPlant = Array.isArray(swap.receiverPlant)
    ? swap.receiverPlant[0]
    : swap.receiverPlant;

  // 2️⃣ Determinar si es sender o receiver
  const isSender = swap.sender_id === userId;
  const updateField = isSender ? "sender_completed" : "receiver_completed";

  // 3️⃣ Actualizar su campo de completado
  const { error: updateError } = await supabase
    .from("swaps")
    .update({ [updateField]: true })
    .eq("id", swapId);

  if (updateError) throw updateError;

  // 4️⃣ Si ambos completaron → marcar el swap como completed + intercambiar dueños
  if (
    (isSender && swap.receiver_completed) ||
    (!isSender && swap.sender_completed)
  ) {
    const { error: completeError } = await supabase
      .from("swaps")
      .update({ status: "completed" })
      .eq("id", swapId);

    if (completeError) throw completeError;

    // 🪴 Intercambiar dueños de las plantas
    if (senderPlant?.id && receiverPlant?.id) {
      const updates = [
        supabase
          .from("plants")
          .update({ user_id: swap.receiver_id, disponible: false })
          .eq("id", senderPlant.id),
        supabase
          .from("plants")
          .update({ user_id: swap.sender_id, disponible: false })
          .eq("id", receiverPlant.id),
      ];

      const results = await Promise.all(updates);
      const hasError = results.some((r) => r.error);

      if (hasError) {
        showError("Swap completed but plant ownership update failed");
      }
    }
  }
}
