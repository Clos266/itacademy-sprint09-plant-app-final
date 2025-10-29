import { PageHeader, PageHeaderHeading } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FilterBar } from "@/components/common/FilterBar";
import { SearchInput } from "@/components/common/SearchInput";
import { EventGrid } from "@/components/Events/EventGrid";
import { SwapPointGrid } from "@/components/swappoints/SwapPointGrid";
import { LoadingState } from "@/components/common/LoadingState";
import { NewEventButton } from "@/components/Events/NewEventButton";
import { NewSwapPointButton } from "@/components/swappoints/NewSwapPointButton";
import { EventDetailsModal } from "@/components/Events/EventDetailsModal";
import { SwapPointDetailsModal } from "@/components/swappoints/SwapPointDetailsModal";
import { useEventsPage } from "@/hooks/useEventsPage";
import { SPACING } from "@/constants/layouts";
import { DOMAIN_FILTER_TYPES } from "@/constants/filterTypes";
import { SEARCH_PLACEHOLDERS } from "@/constants/filters";

const EMPTY_MESSAGES = {
  events: "No events found.",
  swappoints: "No swap points found.",
} as const;

export function EventsBrowserContainer() {
  const {
    loading,
    filteredEvents,
    filteredSwappoints,

    activeTab,
    search,
    filterType,

    openEventModal,
    selectedEventId,
    openSwapPointModal,
    selectedSwapPointId,

    setActiveTab,
    setSearch,
    setFilterType,
    openEventDetails,
    closeEventModal,
    openSwapPointDetails,
    closeSwapPointModal,
  } = useEventsPage();

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
          <TabsTrigger value="swappoints">Meeting Points</TabsTrigger>
        </TabsList>

        <Card className="mb-4">
          <CardContent>
            <FilterBar
              searchComponent={
                <SearchInput
                  value={search}
                  onChange={setSearch}
                  placeholder={
                    activeTab === "events"
                      ? SEARCH_PLACEHOLDERS.events
                      : SEARCH_PLACEHOLDERS.swappoints
                  }
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
              onSelect={openEventDetails}
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
              onSelect={openSwapPointDetails}
              emptyMessage={EMPTY_MESSAGES.swappoints}
            />
          )}
        </TabsContent>
      </Tabs>

      <EventDetailsModal
        open={openEventModal}
        onOpenChange={(open) => {
          if (!open) closeEventModal();
        }}
        eventId={selectedEventId}
      />

      <SwapPointDetailsModal
        open={openSwapPointModal}
        onOpenChange={(open) => {
          if (!open) closeSwapPointModal();
        }}
        swapPointId={selectedSwapPointId}
      />
    </div>
  );
}
