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

export function searchEvents(events: Event[], searchTerm: string): Event[] {
  if (!searchTerm.trim()) return events;

  const term = searchTerm.toLowerCase();

  return events.filter(
    (event) =>
      event.title.toLowerCase().includes(term) ||
      event.location.toLowerCase().includes(term) ||
      event.description?.toLowerCase().includes(term)
  );
}

export function getUpcomingEvents(events: Event[]): Event[] {
  const now = new Date();
  return events.filter((event) => new Date(event.date) > now);
}

export function getPastEvents(events: Event[]): Event[] {
  const now = new Date();
  return events.filter((event) => new Date(event.date) <= now);
}

export function sortEventsByDate(
  events: Event[],
  order: "asc" | "desc" = "desc"
): Event[] {
  return [...events].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return order === "desc" ? dateB - dateA : dateA - dateB;
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

export function sortSwapPointsByName(
  swapPoints: SwapPoint[],
  order: "asc" | "desc" = "asc"
): SwapPoint[] {
  return [...swapPoints].sort((a, b) => {
    const comparison = a.name.localeCompare(b.name);
    return order === "desc" ? -comparison : comparison;
  });
}

export function sortSwapPointsByCity(
  swapPoints: SwapPoint[],
  order: "asc" | "desc" = "asc"
): SwapPoint[] {
  return [...swapPoints].sort((a, b) => {
    const cityA = a.city || "";
    const cityB = b.city || "";
    const comparison = cityA.localeCompare(cityB);
    return order === "desc" ? -comparison : comparison;
  });
}

export function getEventStats(events: Event[]) {
  const now = new Date();
  const upcoming = events.filter((event) => new Date(event.date) > now);
  const past = events.filter((event) => new Date(event.date) <= now);

  const thisMonth = events.filter((event) => {
    const eventDate = new Date(event.date);
    return (
      eventDate.getMonth() === now.getMonth() &&
      eventDate.getFullYear() === now.getFullYear()
    );
  });

  return {
    total: events.length,
    upcoming: upcoming.length,
    past: past.length,
    thisMonth: thisMonth.length,
  };
}

export function getSwapPointStats(swapPoints: SwapPoint[]) {
  const cityCounts = swapPoints.reduce((acc, point) => {
    const city = point.city || "Unknown";
    acc[city] = (acc[city] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedCities = Object.entries(cityCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([city, count]) => ({ city, count }));

  return {
    total: swapPoints.length,
    cities: sortedCities,
    topCity: sortedCities[0]?.city || null,
  };
}

export function eventToCardData(event: Event) {
  const eventDate = new Date(event.date);
  const isUpcoming = eventDate > new Date();

  return {
    id: event.id,
    title: event.title,
    location: event.location,
    date: eventDate,
    isUpcoming,
    dateText: eventDate.toLocaleDateString(),
    timeText: eventDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

export function swapPointToCardData(swapPoint: SwapPoint) {
  return {
    id: swapPoint.id,
    name: swapPoint.name,
    address: swapPoint.address,
    city: swapPoint.city,
    fullAddress: `${swapPoint.address}, ${swapPoint.city}`,
    hasImage: !!swapPoint.image_url,
  };
}
