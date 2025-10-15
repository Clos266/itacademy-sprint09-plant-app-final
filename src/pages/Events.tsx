import { useState } from "react";
import { PageHeader, PageHeaderHeading } from "@/components/page-header";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Filter, Plus } from "lucide-react";
import { mockEvents } from "@/data/mockEvents";
import { mockUsers } from "@/data/mockUsers";
import { NewEventButton } from "@/components/Events/NewEventModal";

// ✅ nuevos componentes reutilizables
import { FilterBar } from "@/components/common/FilterBar";
import { SearchInput } from "@/components/common/SearchInput";

export default function EventsPage() {
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<"all" | "upcoming" | "past">(
    "all"
  );
  const [search, setSearch] = useState("");

  // 🔹 Filtrado + búsqueda
  const filteredEvents = mockEvents.filter((event) => {
    const isUpcoming = new Date(event.date) > new Date();
    const matchesSearch =
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.description.toLowerCase().includes(search.toLowerCase()) ||
      event.location.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (filterType === "upcoming") return isUpcoming;
    if (filterType === "past") return !isUpcoming;
    return true;
  });

  const selectedEvent =
    filteredEvents.find((e) => e.id === selectedEventId) || null;

  return (
    <div className="min-h-screen space-y-6">
      <PageHeader>
        <PageHeaderHeading>
          <CalendarDays className="inline-block w-6 h-6 mr-2 text-primary" />
          Community Events
        </PageHeaderHeading>
      </PageHeader>

      {/* 🔍 Filtros + búsqueda */}
      <Card>
        <CardContent>
          <FilterBar
            searchComponent={
              <SearchInput
                value={search}
                onChange={setSearch}
                onClear={() => setSearch("")}
                placeholder="Search events..."
              />
            }
            filters={
              <>
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Button
                  variant={filterType === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("all")}
                >
                  All
                </Button>
                <Button
                  variant={filterType === "upcoming" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("upcoming")}
                >
                  Upcoming
                </Button>
                <Button
                  variant={filterType === "past" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("past")}
                >
                  Past
                </Button>
                <NewEventButton />
              </>
            }
          />
        </CardContent>
      </Card>

      {/* 📅 Lista de eventos */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredEvents.map((event) => {
          const isUpcoming = new Date(event.date) > new Date();
          const isSelected = selectedEventId === event.id;
          const organizer = mockUsers.find((u) => u.id === event.user_id);

          return (
            <Card
              key={event.id}
              className={`transition-all cursor-pointer overflow-hidden flex flex-col ${
                isSelected ? "ring-2 ring-primary shadow-lg" : "hover:shadow-md"
              }`}
              onClick={() => setSelectedEventId(event.id)}
            >
              {/* Imagen */}
              <CardContent className="p-4 pb-0">
                <div className="relative aspect-square w-full rounded-lg overflow-hidden shadow-sm">
                  <img
                    src={event.image_url || "/placeholder-event.jpg"}
                    alt={event.title}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant={isUpcoming ? "default" : "secondary"}>
                      {isUpcoming ? "Upcoming" : "Past"}
                    </Badge>
                  </div>
                </div>
              </CardContent>

              {/* Contenido */}
              <CardHeader className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold truncate">{event.title}</h3>
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
                    {event.description}
                  </p>

                  <div className="flex items-center gap-2 text-sm mb-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{event.location}</span>
                  </div>

                  {organizer && (
                    <div className="flex items-center gap-2 text-sm mb-1">
                      <img
                        src={organizer.avatar_url}
                        alt={organizer.username}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="text-muted-foreground">
                        by {organizer.username}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <Button
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      alert(`Viewing details for: ${event.title}`);
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </CardHeader>
            </Card>
          );
        })}

        {filteredEvents.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                No {filterType !== "all" ? filterType : ""} events found.
              </p>
              <Button onClick={() => setFilterType("all")}>Show All</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
