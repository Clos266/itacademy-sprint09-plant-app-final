import { useEffect, useState, useMemo } from "react";
import { PageHeader, PageHeaderHeading } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FilterBar } from "@/components/common/FilterBar";
import { SearchInput } from "@/components/common/SearchInput";
import { EventGrid } from "@/components/Events/EventGrid";
import { SwapPointGrid } from "@/components/swappoints/SwapPointGrid";
import { LoadingState } from "@/components/common/LoadingState";
import { NewEventButton } from "@/components/Events/NewEventModal";
import { NewSwapPointButton } from "@/components/swappoints/NewSwapPointModal";
import { fetchEvents } from "@/services/eventService";
import { fetchSwapPoints } from "@/services/swapPointsCrudService";
import { EventDetailsModal } from "@/components/Events/EventDetailsModal";
import { SwapPointDetailsModal } from "@/components/swappoints/SwapPointDetailsModal";
import { showError } from "@/services/toastService";
import { SPACING } from "@/constants/layouts";
import { DOMAIN_FILTER_TYPES } from "@/constants/filterTypes";
import type { Database } from "@/types/supabase";

type Event = Database["public"]["Tables"]["events"]["Row"];
type SwapPoint = Database["public"]["Tables"]["swap_points"]["Row"];

const EMPTY_MESSAGES = {
  events: "No events found.",
  swappoints: "No swap points found.",
} as const;

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
    <div className={`min-h-screen ${SPACING.PAGE.SECTION_GAP}`}>
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

        <Card className="mb-4">
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
                      {DOMAIN_FILTER_TYPES.EVENTS.STATUS.map((type) => (
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
            <LoadingState message="Loading events..." className="py-10" />
          ) : (
            <EventGrid
              data={filteredEvents}
              onSelect={(id) => {
                setSelectedEventId(id);
                setOpenEventModal(true);
              }}
              emptyMessage={EMPTY_MESSAGES.events}
            />
          )}
        </TabsContent>

        <TabsContent value="swappoints">
          {loading ? (
            <LoadingState message="Loading swap points..." className="py-10" />
          ) : (
            <SwapPointGrid
              data={filteredSwappoints}
              onSelect={(id) => {
                setSelectedSwapPointId(id);
                setOpenSwapPointModal(true);
              }}
              emptyMessage={EMPTY_MESSAGES.swappoints}
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
