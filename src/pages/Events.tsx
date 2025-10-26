import { useEffect, useState, useMemo } from "react";
import { PageHeader, PageHeaderHeading } from "@/components/page-header";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FilterBar } from "@/components/common/FilterBar";
import { SearchInput } from "@/components/common/SearchInput";
import { MapPin, CalendarDays } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { NewEventButton } from "@/components/Events/NewEventModal";
import { NewSwapPointButton } from "@/components/swappoints/NewSwapPointModal";
import { fetchEvents } from "@/services/eventService";
import { fetchSwapPoints } from "@/services/swapPointsCrudService";
import { EventDetailsModal } from "@/components/Events/EventDetailsModal";
import { SwapPointDetailsModal } from "@/components/swappoints/SwapPointDetailsModal";
import { showError } from "@/services/toastService";
import type { Database } from "@/types/supabase";

type Event = Database["public"]["Tables"]["events"]["Row"];
type SwapPoint = Database["public"]["Tables"]["swap_points"]["Row"];

const FILTER_TYPES = ["all", "upcoming", "past"] as const;
const GRID_CONFIG = {
  classes: "grid gap-6 sm:grid-cols-2 lg:grid-cols-3",
  emptyMessage: {
    events: "No events found.",
    swappoints: "No swap points found.",
  },
};

export default function EventsPage() {
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

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [eventData, swappointData] = await Promise.all([
          fetchEvents(),
          fetchSwapPoints(),
        ]);

        const sortedEvents = eventData.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setEvents(sortedEvents);
        setSwappoints(swappointData);
      } catch (error) {
        console.error("Error loading community data:", error);
        showError("Failed to load community data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredEvents = useMemo(() => {
    const term = search.toLowerCase();

    return events.filter((event) => {
      const isUpcoming = new Date(event.date) > new Date();
      const matchesSearch =
        event.title.toLowerCase().includes(term) ||
        event.location.toLowerCase().includes(term);

      if (!matchesSearch) return false;
      if (filterType === "upcoming") return isUpcoming;
      if (filterType === "past") return !isUpcoming;
      return true;
    });
  }, [events, search, filterType]);

  const filteredSwappoints = useMemo(() => {
    const term = search.toLowerCase();
    return swappoints.filter((point) =>
      point.name.toLowerCase().includes(term)
    );
  }, [swappoints, search]);

  return (
    <div className="min-h-screen space-y-6">
      <PageHeader>
        <PageHeaderHeading>Find Events and Swap Points</PageHeaderHeading>
      </PageHeader>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "events" | "swappoints")}
      >
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="swappoints">Swap Points</TabsTrigger>
        </TabsList>

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
                      {FILTER_TYPES.map((type) => (
                        <Button
                          key={type}
                          variant={filterType === type ? "default" : "outline"}
                          size="sm"
                          onClick={() => setFilterType(type)}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Button>
                      ))}
                      <NewEventButton />
                    </>
                  )}
                  {activeTab === "swappoints" && <NewSwapPointButton />}
                </>
              }
            />
          </CardContent>
        </Card>

        <TabsContent value="events">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <Spinner className="w-6 h-6 mb-2" />
              <span>Loading events...</span>
            </div>
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

        <TabsContent value="swappoints">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <Spinner className="w-6 h-6 mb-2" />
              <span>Loading swap points...</span>
            </div>
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

// TODO: Extract to components/Events/EventGrid.tsx
// This component should be moved to its own file for better maintainability
function EventGrid({
  data,
  onSelect,
}: {
  data: Event[];
  onSelect: (id: number) => void;
}) {
  return (
    <div className={GRID_CONFIG.classes}>
      {data.map((event) => {
        const isUpcoming = new Date(event.date) > new Date();
        return (
          <Card
            key={event.id}
            className="transition-all cursor-pointer overflow-hidden flex flex-col hover:shadow-md hover:scale-105"
            onClick={() => onSelect(event.id)}
          >
            <CardContent className="p-4 pb-0">
              <div className="relative aspect-square w-full rounded-lg overflow-hidden shadow-sm">
                <img
                  src={event.image_url || "/imagenotfound.jpeg"}
                  alt={event.title}
                  className="object-cover w-full h-full"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3">
                  <Badge variant={isUpcoming ? "default" : "secondary"}>
                    {isUpcoming ? "Upcoming" : "Past"}
                  </Badge>
                </div>
              </div>
            </CardContent>

            <CardHeader className="flex-1 flex flex-col justify-between p-4 items-center text-left">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm w-full max-w-xs">
                <div className="col-span-2">
                  <p className="text-muted-foreground text-xs uppercase">
                    Event
                  </p>
                  <p className="font-semibold truncate">{event.title}</p>
                </div>

                <div className="col-span-2">
                  <p className="text-muted-foreground text-xs uppercase">
                    Description
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {event.description || "-"}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate text-xs">{event.location}</span>
                </div>

                <div className="flex items-center gap-1">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate text-xs">
                    {new Date(event.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardHeader>
          </Card>
        );
      })}
      {data.length === 0 && (
        <p className="text-center text-muted-foreground col-span-full py-12">
          {GRID_CONFIG.emptyMessage.events}
        </p>
      )}
    </div>
  );
}

// TODO: Extract to components/swappoints/SwapPointGrid.tsx
// This component should be moved to its own file for better maintainability
function SwappointGrid({
  data,
  onSelect,
}: {
  data: SwapPoint[];
  onSelect: (id: number) => void;
}) {
  return (
    <div className={GRID_CONFIG.classes}>
      {data.map((point) => (
        <Card
          key={point.id}
          className="transition-all cursor-pointer overflow-hidden flex flex-col hover:shadow-md hover:scale-105"
          onClick={() => onSelect(point.id)}
        >
          <CardContent className="p-4 pb-0">
            <div className="relative aspect-square w-full rounded-lg overflow-hidden shadow-sm">
              <img
                src={point.image_url || "/imagenotfound.jpeg"}
                alt={point.name}
                className="object-cover w-full h-full"
                loading="lazy"
              />
              <div className="absolute top-3 left-3">
                <Badge variant="default">Swap Point</Badge>
              </div>
            </div>
          </CardContent>

          <CardHeader className="flex-1 flex flex-col justify-between p-4 items-center text-left">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm w-full max-w-xs">
              <div className="col-span-2">
                <p className="text-muted-foreground text-xs uppercase">
                  Swap Point
                </p>
                <p className="font-semibold truncate">{point.name}</p>
              </div>

              <div className="col-span-2">
                <p className="text-muted-foreground text-xs uppercase">
                  Description
                </p>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {point.description || "-"}
                </p>
              </div>

              <div className="col-span-2 flex items-center gap-1">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="truncate text-xs">
                  {point.address}, {point.city}
                </span>
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
      {data.length === 0 && (
        <p className="text-center text-muted-foreground col-span-full py-12">
          {GRID_CONFIG.emptyMessage.swappoints}
        </p>
      )}
    </div>
  );
}
