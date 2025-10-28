import { useEffect, useState, useCallback } from "react";
import type { Database } from "@/types/supabase";
import {
  fetchSwapsWithRelations,
  subscribeToUserSwaps,
} from "@/services/swapCrudService";
import { supabase } from "@/services/supabaseClient";

type Swap = Database["public"]["Tables"]["swaps"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Plant = Database["public"]["Tables"]["plants"]["Row"];

export interface FullSwap extends Swap {
  sender: Profile | null;
  receiver: Profile | null;
  senderPlant: Plant | null;
  receiverPlant: Plant | null;
}

export function useSwaps() {
  const [swaps, setSwaps] = useState<FullSwap[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data?.user?.id || null);
    };
    getUser();
  }, []);

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

  useEffect(() => {
    if (userId) loadSwaps();
  }, [userId, loadSwaps]);

  return { swaps, loading, reload: loadSwaps, userId, username };
}
