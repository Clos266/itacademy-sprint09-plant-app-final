import { useEffect, useState, useMemo, useCallback } from "react";
import { fetchEvents } from "@/services/eventService";
import { fetchSwapPoints } from "@/services/swapPointsCrudService";
import { showError } from "@/services/toastService";
import { filterEvents, filterSwapPoints } from "@/utils/eventsFiltering";
import type { Database } from "@/types/supabase";

type Event = Database["public"]["Tables"]["events"]["Row"];
type SwapPoint = Database["public"]["Tables"]["swap_points"]["Row"];
type TabType = "events" | "swappoints";
type FilterType = "all" | "upcoming" | "past";

interface UseEventsPageState {
  events: Event[];
  swappoints: SwapPoint[];
  loading: boolean;

  activeTab: TabType;
  search: string;
  filterType: FilterType;

  openEventModal: boolean;
  selectedEventId: number | null;
  openSwapPointModal: boolean;
  selectedSwapPointId: number | null;
}

interface UseEventsPageActions {
  setActiveTab: (tab: TabType) => void;
  setSearch: (search: string) => void;
  setFilterType: (filterType: FilterType) => void;

  openEventDetails: (id: number) => void;
  closeEventModal: () => void;
  openSwapPointDetails: (id: number) => void;
  closeSwapPointModal: () => void;

  reloadData: () => Promise<void>;
}

export interface UseEventsPageReturn
  extends UseEventsPageState,
    UseEventsPageActions {
  filteredEvents: Event[];
  filteredSwappoints: SwapPoint[];
}

export function useEventsPage(): UseEventsPageReturn {
  const [events, setEvents] = useState<Event[]>([]);
  const [swappoints, setSwappoints] = useState<SwapPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<TabType>("events");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");

  const [openEventModal, setOpenEventModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [openSwapPointModal, setOpenSwapPointModal] = useState(false);
  const [selectedSwapPointId, setSelectedSwapPointId] = useState<number | null>(
    null
  );

  const loadData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredEvents = useMemo(
    () => filterEvents(events, search, filterType),
    [events, search, filterType]
  );

  const filteredSwappoints = useMemo(
    () => filterSwapPoints(swappoints, search),
    [swappoints, search]
  );

  const openEventDetails = useCallback((id: number) => {
    setSelectedEventId(id);
    setOpenEventModal(true);
  }, []);

  const closeEventModal = useCallback(() => {
    setOpenEventModal(false);
    setSelectedEventId(null);
  }, []);

  const openSwapPointDetails = useCallback((id: number) => {
    setSelectedSwapPointId(id);
    setOpenSwapPointModal(true);
  }, []);

  const closeSwapPointModal = useCallback(() => {
    setOpenSwapPointModal(false);
    setSelectedSwapPointId(null);
  }, []);

  return {
    events,
    swappoints,
    loading,

    activeTab,
    search,
    filterType,

    openEventModal,
    selectedEventId,
    openSwapPointModal,
    selectedSwapPointId,

    filteredEvents,
    filteredSwappoints,

    setActiveTab,
    setSearch,
    setFilterType,
    openEventDetails,
    closeEventModal,
    openSwapPointDetails,
    closeSwapPointModal,
    reloadData: loadData,
  };
}
