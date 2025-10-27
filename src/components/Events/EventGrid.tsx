import { EventCard } from "@/components/cards";
import { GRID_CONFIGS } from "@/constants/layouts";
import type { Database } from "@/types/supabase";

type Event = Database["public"]["Tables"]["events"]["Row"];

interface EventGridProps {
  data: Event[];
  onSelect: (id: number) => void;
  emptyMessage?: string;
}

/**
 * 📅 EventGrid - Grid component for displaying events
 *
 * Renders a responsive grid of EventCard components with:
 * - Consistent grid layout using GRID_CONFIGS.CARDS.CONTAINER
 * - Click handlers for event selection
 * - Empty state message when no events
 * - Full responsive design
 *
 * @example
 * ```tsx
 * <EventGrid
 *   data={events}
 *   onSelect={(id) => openEventDetails(id)}
 *   emptyMessage="No events found for this filter"
 * />
 * ```
 */
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
