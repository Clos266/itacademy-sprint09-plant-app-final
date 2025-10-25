import type { Plant, SwapWithRelations } from "@/types/supabase";
import type { BaseModalProps } from "@/types/ui";

// ============================================================
// 🔄 TIPOS ESPECÍFICOS PARA COMPONENTES DE SWAPS
// ============================================================

export interface ProposeSwapModalProps extends BaseModalProps {
  targetPlant: Plant | null;
  userPlants: Plant[];
}

export interface SwapInfoModalProps extends BaseModalProps {
  swap: SwapWithRelations | null;
  userId: string;
  username: string;
  onStatusChange: () => void;
}

export interface SwapChatProps {
  swapId: number;
  currentUserId: string;
}

export interface SwapCardProps {
  swap: SwapWithRelations;
  onView: (swap: SwapWithRelations) => void;
  onStatusChange: () => void;
}
