import { EventCard } from "@/components/cards";
import { GRID_CONFIGS } from "@/constants/layouts";
import type { Database } from "@/types/supabase";

type Event = Database["public"]["Tables"]["events"]["Row"];

interface EventGridProps {
  data: Event[];
  onSelect: (id: number) => void;
  emptyMessage?: string;
}

export function EventGrid({
  data,
  onSelect,
  emptyMessage = "No events found.",
}: EventGridProps) {
  return (
    <div className={GRID_CONFIGS.CARDS.CONTAINER}>
      {data.map((event) => (
        <EventCard key={event.id} event={event} onClick={onSelect} />
      ))}
      {data.length === 0 && (
        <p className="text-center text-muted-foreground col-span-full py-12">
          {emptyMessage}
        </p>
      )}
    </div>
  );
}
