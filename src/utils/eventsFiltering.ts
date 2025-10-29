import type { Database } from "@/types/supabase";

type Event = Database["public"]["Tables"]["events"]["Row"];
type SwapPoint = Database["public"]["Tables"]["swap_points"]["Row"];

export function filterEvents(
  events: Event[],
  searchTerm: string,
  filterType: "all" | "upcoming" | "past"
): Event[] {
  const term = searchTerm.toLowerCase().trim();

  return events.filter((event) => {
    const eventDate = new Date(event.date);
    const now = new Date();
    const isUpcoming = eventDate > now;

    if (filterType === "upcoming" && !isUpcoming) return false;
    if (filterType === "past" && isUpcoming) return false;

    if (term) {
      const matchesTitle = event.title.toLowerCase().includes(term);
      const matchesLocation = event.location.toLowerCase().includes(term);
      const matchesDescription = event.description
        ?.toLowerCase()
        .includes(term);

      return matchesTitle || matchesLocation || matchesDescription;
    }

    return true;
  });
}

export function filterSwapPoints(
  swapPoints: SwapPoint[],
  searchTerm: string
): SwapPoint[] {
  if (!searchTerm.trim()) return swapPoints;

  const term = searchTerm.toLowerCase();

  return swapPoints.filter(
    (point) =>
      point.name.toLowerCase().includes(term) ||
      point.address?.toLowerCase().includes(term) ||
      point.city?.toLowerCase().includes(term) ||
      point.description?.toLowerCase().includes(term)
  );
}

export function sortEventsByDate(events: Event[]): Event[] {
  return [...events].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}
