import { useEffect, useState, useCallback } from "react";
import type { Swap, Profile, Plant } from "@/types/supabase";
import {
  fetchSwapsWithRelations,
  subscribeToUserSwaps,
} from "@/services/swapCrudService";
import { supabase } from "@/services/supabaseClient";

export interface FullSwap extends Swap {
  sender: Profile | null;
  receiver: Profile | null;
  senderPlant: Plant | null;
  receiverPlant: Plant | null;
}

/**
 * 🧩 Hook para gestionar los swaps del usuario (con realtime)
 */
export function useSwaps() {
  const [swaps, setSwaps] = useState<FullSwap[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  // 🔐 Obtener usuario actual
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data?.user?.id || null);
    };
    getUser();
  }, []);

  // 🔐 Obtener nombre de usuario
  useEffect(() => {
    const getProfile = async () => {
      if (!userId) return;
      const { data } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", userId)
        .single();
      setUsername(data?.username || null);
    };
    getProfile();
  }, [userId]);

  // 🌱 Cargar swaps iniciales
  const loadSwaps = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await fetchSwapsWithRelations(userId);
      setSwaps(data);
    } catch (err) {
      console.error("Error loading swaps:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // ⚡ Escuchar cambios en tiempo real
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribeToUserSwaps(userId, (payload) => {
      setSwaps((prev) => {
        const rec = payload.new || payload.old;
        if (!rec) return prev;

        // 🔁 Actualizar o eliminar según evento
        const record = (payload.new || payload.old) as Swap;

        switch (payload.eventType) {
          case "INSERT":
            return [record as any, ...prev];
          case "UPDATE":
            return prev.map((s) =>
              s.id === record.id ? { ...s, ...record } : s
            );
          case "DELETE":
            return prev.filter((s) => s.id !== record.id);
          default:
            return prev;
        }
      });
    });

    return unsubscribe;
  }, [userId]);

  // 🔁 Recarga manual
  useEffect(() => {
    if (userId) loadSwaps();
  }, [userId, loadSwaps]);

  return { swaps, loading, reload: loadSwaps, userId, username };
}
