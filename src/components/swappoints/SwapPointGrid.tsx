import { SwapPointCard } from "@/components/cards";
import { GRID_CONFIGS } from "@/constants/layouts";
import type { Database } from "@/types/supabase";

type SwapPoint = Database["public"]["Tables"]["swap_points"]["Row"];

interface SwapPointGridProps {
  data: SwapPoint[];
  onSelect: (id: number) => void;
  emptyMessage?: string;
}

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
