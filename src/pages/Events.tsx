import { useEffect, useState } from "react";
import { PageHeader, PageHeaderHeading } from "@/components/page-header";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FilterBar } from "@/components/common/FilterBar";
import { SearchInput } from "@/components/common/SearchInput";
import { MapPin, CalendarDays } from "lucide-react";
import { NewEventButton } from "@/components/Events/NewEventModal";
import { NewSwapPointButton } from "@/components/swappoints/NewSwapPointModal";
import { fetchEvents } from "@/services/eventService";
import { fetchSwapPoints } from "@/services/swapPointsCrudService";
import { EventDetailsModal } from "@/components/Events/EventDetailsModal";
import { SwapPointDetailsModal } from "@/components/swappoints/SwapPointDetailsModal";
import type { Event, SwapPoint } from "@/types/supabase";

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<"events" | "swappoints">("events");
  const [events, setEvents] = useState<Event[]>([]);
  const [swappoints, setSwappoints] = useState<SwapPoint[]>([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "upcoming" | "past">(
    "all"
  );
  const [loading, setLoading] = useState(true);

  // 🔹 Modales
  const [openEventModal, setOpenEventModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [openSwapPointModal, setOpenSwapPointModal] = useState(false);
  const [selectedSwapPointId, setSelectedSwapPointId] = useState<number | null>(
    null
  );

  // 🔹 Cargar eventos y puntos
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [eventData, swappointData] = await Promise.all([
          fetchEvents(),
          fetchSwapPoints(),
        ]);
        setEvents(eventData);
        setSwappoints(swappointData);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // 🔍 Filtrado
  const filteredEvents = events.filter((event) => {
    const isUpcoming = new Date(event.date) > new Date();
    const matchesSearch =
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.location.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (filterType === "upcoming") return isUpcoming;
    if (filterType === "past") return !isUpcoming;
    return true;
  });

  const filteredSwappoints = swappoints.filter((point) =>
    point.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen space-y-6">
      <PageHeader>
        <PageHeaderHeading>Community</PageHeaderHeading>
      </PageHeader>

      <Card>
        <CardContent>
          <FilterBar
            searchComponent={
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder={`Search ${activeTab}...`}
              />
            }
            filters={
              <>
                {activeTab === "events" && (
                  <>
                    <Button
                      variant={filterType === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterType("all")}
                    >
                      All
                    </Button>
                    <Button
                      variant={
                        filterType === "upcoming" ? "default" : "outline"
                      }
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
                )}
                {activeTab === "swappoints" && <NewSwapPointButton />}
              </>
            }
          />
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="mb-4 flex justify-center">
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="swappoints">Swap Points</TabsTrigger>
        </TabsList>

        {/* 🗓️ Eventos */}
        <TabsContent value="events">
          {loading ? (
            <p className="text-center text-muted-foreground py-8">
              Loading events...
            </p>
          ) : (
            <EventGrid
              data={filteredEvents}
              onSelect={(id) => {
                setSelectedEventId(id);
                setOpenEventModal(true);
              }}
            />
          )}
        </TabsContent>

        {/* 📍 Swap Points */}
        <TabsContent value="swappoints">
          {loading ? (
            <p className="text-center text-muted-foreground py-8">
              Loading swap points...
            </p>
          ) : (
            <SwappointGrid
              data={filteredSwappoints}
              onSelect={(id) => {
                setSelectedSwapPointId(id);
                setOpenSwapPointModal(true);
              }}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* 🪟 Modales */}
      <EventDetailsModal
        open={openEventModal}
        onOpenChange={setOpenEventModal}
        eventId={selectedEventId}
      />
      <SwapPointDetailsModal
        open={openSwapPointModal}
        onOpenChange={setOpenSwapPointModal}
        swapPointId={selectedSwapPointId}
      />
    </div>
  );
}

//
// 🔹 Grid de eventos con imagen
//
function EventGrid({
  data,
  onSelect,
}: {
  data: Event[];
  onSelect: (id: number) => void;
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((event) => {
        const isUpcoming = new Date(event.date) > new Date();
        return (
          <Card
            key={event.id}
            className="transition-all cursor-pointer overflow-hidden flex flex-col hover:shadow-md hover:ring-1 hover:ring-primary/50"
          >
            <CardContent className="p-4 pb-0">
              <div className="relative aspect-square w-full rounded-lg overflow-hidden shadow-sm">
                <img
                  src={event.image_url || "/imagenotfound.jpeg"}
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

            <CardHeader className="flex-1 flex flex-col justify-between p-4 text-left">
              <h3 className="text-lg font-semibold truncate">{event.title}</h3>
              {event.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {event.description}
                </p>
              )}
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                <MapPin className="h-4 w-4" />
                <span className="truncate">{event.location}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                <span>{new Date(event.date).toLocaleDateString()}</span>
              </div>
              <div className="mt-4">
                <Button className="w-full" onClick={() => onSelect(event.id)}>
                  View Details
                </Button>
              </div>
            </CardHeader>
          </Card>
        );
      })}
      {data.length === 0 && (
        <p className="text-center text-muted-foreground col-span-full py-12">
          No events found.
        </p>
      )}
    </div>
  );
}

//
// 🔹 Grid de Swap Points con imagen
//
function SwappointGrid({
  data,
  onSelect,
}: {
  data: SwapPoint[];
  onSelect: (id: number) => void;
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((point) => (
        <Card
          key={point.id}
          className="transition-all cursor-pointer overflow-hidden flex flex-col hover:shadow-md hover:ring-1 hover:ring-primary/50"
        >
          <CardContent className="p-4 pb-0">
            <div className="relative aspect-square w-full rounded-lg overflow-hidden shadow-sm">
              <img
                src={point.image_url || "/imagenotfound.jpeg"}
                alt={point.name}
                className="object-cover w-full h-full"
              />
              <div className="absolute top-3 left-3">
                <Badge variant="default">Swap Point</Badge>
              </div>
            </div>
          </CardContent>

          <CardHeader className="flex-1 flex flex-col justify-between p-4 text-left">
            <h3 className="text-lg font-semibold truncate">{point.name}</h3>
            {point.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {point.description}
              </p>
            )}
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
              <MapPin className="h-4 w-4" />
              <span className="truncate">
                {point.address}, {point.city}
              </span>
            </div>
            <div className="mt-4">
              <Button className="w-full" onClick={() => onSelect(point.id)}>
                View Details
              </Button>
            </div>
          </CardHeader>
        </Card>
      ))}
      {data.length === 0 && (
        <p className="text-center text-muted-foreground col-span-full py-12">
          No swap points found.
        </p>
      )}
    </div>
  );
}
