import { useState, useCallback, useMemo } from "react";
import type { Database } from "@/types/supabase";

type Plant = Database["public"]["Tables"]["plants"]["Row"];

interface SwapProposalFormData {
  offeredPlantId: number | null;
  swapPointId: number | null;
  message: string;
}

export function useSwapProposalForm({
  targetPlant,
}: {
  targetPlant: Plant | null;
}) {
  const [formData, setFormData] = useState<SwapProposalFormData>({
    offeredPlantId: null,
    swapPointId: null,
    message: "",
  });

  const isValid = useMemo(() => {
    return !!(
      targetPlant &&
      formData.offeredPlantId &&
      formData.message.trim().length >= 5
    );
  }, [targetPlant, formData.offeredPlantId, formData.message]);

  const setOfferedPlantId = useCallback((plantId: number | null) => {
    setFormData((prev) => ({ ...prev, offeredPlantId: plantId }));
  }, []);

  const setSwapPointId = useCallback((swapPointId: number | null) => {
    setFormData((prev) => ({ ...prev, swapPointId }));
  }, []);

  const setMessage = useCallback((message: string) => {
    setFormData((prev) => ({ ...prev, message }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      offeredPlantId: null,
      swapPointId: null,
      message: "",
    });
  }, []);

  const handlePlantChange = useCallback(
    (value: string) => {
      setOfferedPlantId(Number(value));
    },
    [setOfferedPlantId]
  );

  const handleSwapPointChange = useCallback(
    (value: string) => {
      setSwapPointId(Number(value));
    },
    [setSwapPointId]
  );

  const handleMessageChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setMessage(e.target.value);
    },
    [setMessage]
  );

  return {
    formData,
    isValid,
    resetForm,
    handlePlantChange,
    handleSwapPointChange,
    handleMessageChange,
  };
}

export type { SwapProposalFormData };
