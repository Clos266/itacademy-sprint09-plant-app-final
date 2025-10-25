import { useEffect, useState } from "react";
import { PageHeader, PageHeaderHeading } from "@/components/page-header";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FilterBar } from "@/components/common/FilterBar";
import { SearchInput } from "@/components/common/SearchInput";
import { PaginatedCards } from "@/components/common/PaginatedCards";
import { MapPin, CalendarDays } from "lucide-react";
import { Spinner } from "@/components/ui/spinner"; // ✅ spinner de shadcn
import { NewEventButton } from "@/components/Events/NewEventModal";
import { NewSwapPointButton } from "@/components/swappoints/NewSwapPointModal";
import { fetchEvents } from "@/services/eventService";
import { fetchSwapPoints } from "@/services/swapPointsCrudService";
import { EventDetailsModal } from "@/components/Events/EventDetailsModal";
import { SwapPointDetailsModal } from "@/components/swappoints/SwapPointDetailsModal";
import { useFiltering } from "@/hooks/useFiltering";
import { usePagination } from "@/hooks/usePagination";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import type { Event, SwapPoint } from "@/types/supabase";

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<"events" | "swappoints">("events");
  const [events, setEvents] = useState<Event[]>([]);
  const [swappoints, setSwappoints] = useState<SwapPoint[]>([]);
  const [loading, setLoading] = useState(true);

  // Configuración del hook de filtrado para eventos
  const eventsFilterConfig = {
    searchFields: (event: Event) => [
      event.title || "",
      event.description || "",
      event.location || "",
    ],
    filterFn: (event: Event, filterType: string) => {
      const isUpcoming = new Date(event.date) > new Date();
      if (filterType === "upcoming") return isUpcoming;
      if (filterType === "past") return !isUpcoming;
      return true; // "all"
    },
  };

  const {
    search: eventSearch,
    filterType: eventFilterType,
    filtered: filteredEvents,
    setSearch: setEventSearch,
    setFilterType: setEventFilterType,
    clearSearch: clearEventSearch,
  } = useFiltering({
    data: events,
    config: eventsFilterConfig,
    initialFilter: "all",
  });

  // Hook de paginación para eventos
  const {
    page: eventPage,
    totalPages: eventTotalPages,
    paginated: paginatedEvents,
    setPage: setEventPage,
  } = usePagination(filteredEvents, { itemsPerPage: 6 });

  // Configuración del hook de filtrado para swap points
  const swappointsFilterConfig = {
    searchFields: (swappoint: SwapPoint) => [
      swappoint.name || "",
      swappoint.description || "",
      swappoint.location || "",
    ],
  };

  const {
    search: swappointSearch,
    filtered: filteredSwappoints,
    setSearch: setSwappointSearch,
    clearSearch: clearSwappointSearch,
  } = useFiltering({
    data: swappoints,
    config: swappointsFilterConfig,
  });

  // Hook de paginación para swap points
  const {
    page: swappointPage,
    totalPages: swappointTotalPages,
    paginated: paginatedSwappoints,
    setPage: setSwappointPage,
  } = usePagination(filteredSwappoints, { itemsPerPage: 6 });

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
        // 👇 Ordena eventos (más recientes primero)
        const sortedEvents = eventData.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setEvents(sortedEvents);
        setSwappoints(swappointData);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

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
                value={activeTab === "events" ? eventSearch : swappointSearch}
                onChange={
                  activeTab === "events" ? setEventSearch : setSwappointSearch
                }
                placeholder={`Search ${activeTab}...`}
              />
            }
            filters={
              <>
                {activeTab === "events" && (
                  <>
                    <Button
                      variant={
                        eventFilterType === "all" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setEventFilterType("all")}
                    >
                      All
                    </Button>
                    <Button
                      variant={
                        eventFilterType === "upcoming" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setEventFilterType("upcoming")}
                    >
                      Upcoming
                    </Button>
                    <Button
                      variant={
                        eventFilterType === "past" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setEventFilterType("past")}
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
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <Spinner className="w-6 h-6 mb-2" /> {/* ✅ spinner shadcn */}
              <span>Loading events...</span>
            </div>
          ) : (
            <PaginatedCards
              data={paginatedEvents}
              page={eventPage}
              totalPages={eventTotalPages}
              onPageChange={setEventPage}
              emptyMessage={`No ${
                eventFilterType !== "all" ? eventFilterType : ""
              } events found.`}
              renderCard={(event) => {
                const isUpcoming = new Date(event.date) > new Date();
                const isSelected = selectedEventId === event.id;

                return (
                  <Card
                    key={event.id}
                    className={`transition-all cursor-pointer overflow-hidden flex flex-col ${
                      isSelected
                        ? "ring-2 ring-primary shadow-lg"
                        : "hover:shadow-md"
                    }`}
                    onClick={() => {
                      setSelectedEventId(event.id);
                      setOpenEventModal(true);
                    }}
                  >
                    <CardContent className="p-4 pb-0">
                      <div className="relative aspect-square w-full rounded-lg overflow-hidden shadow-sm">
                        <ImageWithFallback
                          src={event.image_url || ""}
                          alt={event.title || "Event"}
                          className="object-cover w-full h-full"
                        />
                        <div className="absolute top-3 left-3">
                          <Badge variant={isUpcoming ? "default" : "secondary"}>
                            {isUpcoming ? "Upcoming" : "Past"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                    <CardHeader className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl font-bold truncate">
                          {event.title}
                        </h3>
                        <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
                          {event.description}
                        </p>
                        <div className="flex items-center gap-2 text-sm mb-1">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">{event.location}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <CalendarDays className="h-4 w-4" />
                          <span>
                            {new Date(event.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Button
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEventId(event.id);
                            setOpenEventModal(true);
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                );
              }}
            />
          )}
        </TabsContent>

        {/* 📍 Swap Points */}
        <TabsContent value="swappoints">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <Spinner className="w-6 h-6 mb-2" /> {/* ✅ spinner shadcn */}
              <span>Loading swap points...</span>
            </div>
          ) : (
            <PaginatedCards
              data={paginatedSwappoints}
              page={swappointPage}
              totalPages={swappointTotalPages}
              onPageChange={setSwappointPage}
              emptyMessage="No swap points found."
              renderCard={(swappoint) => {
                const isSelected = selectedSwapPointId === swappoint.id;

                return (
                  <Card
                    key={swappoint.id}
                    className={`transition-all cursor-pointer overflow-hidden flex flex-col ${
                      isSelected
                        ? "ring-2 ring-primary shadow-lg"
                        : "hover:shadow-md"
                    }`}
                    onClick={() => {
                      setSelectedSwapPointId(swappoint.id);
                      setOpenSwapPointModal(true);
                    }}
                  >
                    <CardContent className="p-4 pb-0">
                      <div className="relative aspect-square w-full rounded-lg overflow-hidden shadow-sm">
                        <ImageWithFallback
                          src={swappoint.image_url || ""}
                          alt={swappoint.name || "Swap Point"}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    </CardContent>
                    <CardHeader className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl font-bold truncate">
                          {swappoint.name}
                        </h3>
                        <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
                          {swappoint.description}
                        </p>
                        <div className="flex items-center gap-2 text-sm mb-1">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">{swappoint.location}</span>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Button
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSwapPointId(swappoint.id);
                            setOpenSwapPointModal(true);
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                );
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
