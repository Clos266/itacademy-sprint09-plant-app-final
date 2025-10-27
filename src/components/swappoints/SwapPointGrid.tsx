import { SwapPointCard } from "@/components/cards";
import { GRID_CONFIGS } from "@/constants/layouts";
import type { Database } from "@/types/supabase";

type SwapPoint = Database["public"]["Tables"]["swap_points"]["Row"];

interface SwapPointGridProps {
  data: SwapPoint[];
  onSelect: (id: number) => void;
  emptyMessage?: string;
}

/**
 * 📍 SwapPointGrid - Grid component for displaying swap points
 *
 * Renders a responsive grid of SwapPointCard components with:
 * - Consistent grid layout using GRID_CONFIGS.CARDS.CONTAINER
 * - Click handlers for swap point selection
 * - Empty state message when no swap points
 * - Full responsive design
 *
 * @example
 * ```tsx
 * <SwapPointGrid
 *   data={swapPoints}
 *   onSelect={(id) => openSwapPointDetails(id)}
 *   emptyMessage="No swap points found in this area"
 * />
 * ```
 */
export function SwapPointGrid({
  data,
  onSelect,
  emptyMessage = "No swap points found.",
}: SwapPointGridProps) {
  return (
    <div className={GRID_CONFIGS.CARDS.CONTAINER}>
      {data.map((point) => (
        <SwapPointCard key={point.id} swapPoint={point} onClick={onSelect} />
      ))}
      {data.length === 0 && (
        <p className="text-center text-muted-foreground col-span-full py-12">
          {emptyMessage}
        </p>
      )}
    </div>
  );
}
