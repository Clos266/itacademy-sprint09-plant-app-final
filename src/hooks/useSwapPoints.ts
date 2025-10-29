import { useState, useEffect } from "react";
import { fetchSwapPoints } from "@/services/swapPointsService";
import type { Database } from "@/types/supabase";

type SwapPoint = Database["public"]["Tables"]["swap_points"]["Row"];

export function useSwapPoints() {
  const [swapPoints, setSwapPoints] = useState<SwapPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSwapPoints = async () => {
      try {
        const points = await fetchSwapPoints();
        setSwapPoints(points);
      } finally {
        setLoading(false);
      }
    };
    loadSwapPoints();
  }, []);

  return {
    swapPoints,
    loading,
  };
}

export type { SwapPoint };
