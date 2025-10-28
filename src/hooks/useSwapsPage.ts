/**
 * 🔄 useSwapsPage Hook
 *
 * Centralized state management for Swaps page functionality.
 * Extracts all business logic, state management, and actions from Swaps.tsx
 *
 * Following the successful pattern from useEventsPage.ts
 */

import { useState, useMemo, useCallback } from "react";
import { useSwaps } from "@/hooks/useSwaps";
import { usePagination } from "@/hooks/usePagination";
import {
  acceptSwapProposal,
  declineSwapProposal,
  type FullSwap,
  type Swap,
} from "@/services/swapCrudService";
import { PAGINATION_SIZES } from "@/constants/pagination";
import { type SwapStatus } from "@/constants/status";
import {
  filterAndSortSwaps,
  isSortableColumn,
  getSwapStatistics,
  createSortableHeaderProps,
  SWAPS_DEFAULT_CONFIG,
  type SortDirection,
  // type SwapFilters, // Future use
} from "@/utils/swapsFiltering";

// ============================================================================
// Types & Interfaces
// ============================================================================

interface ModalState {
  selectedPlantId: number | null;
  selectedUserId: string | null;
  selectedSwap: FullSwap | null;
  openSwapInfo: boolean;
}

interface FilterState {
  activeStatuses: SwapStatus[];
  sortColumn: keyof Swap;
  sortDirection: SortDirection;
  searchQuery: string;
}

interface SwapActions {
  handleAcceptSwap: (swap: FullSwap) => Promise<void>;
  handleDeclineSwap: (swap: FullSwap) => Promise<void>;
  handleSort: (column: keyof Swap) => void;
  handleSearchChange: (value: string) => void;
  handleSearchClear: () => void;
  toggleStatus: (status: SwapStatus) => void;
}

interface ModalActions {
  setSelectedPlantId: (id: number | null) => void;
  setSelectedUserId: (id: string | null) => void;
  setSelectedSwap: (swap: FullSwap | null) => void;
  setOpenSwapInfo: (open: boolean) => void;
  handlePlantClick: (plantId: number) => void;
  handleUserClick: (userId: string) => void;
  handleSwapInfoClick: (swap: FullSwap) => void;
}

export interface UseSwapsPageReturn {
  // Data & Loading
  swaps: FullSwap[];
  filteredSwaps: FullSwap[];
  paginatedSwaps: FullSwap[];
  loading: boolean;
  userId: string | null;
  username: string | null;

  // Pagination
  page: number;
  totalPages: number;
  goToPage: (page: number) => void;

  // Filters & Sorting
  filters: FilterState;
  statistics: ReturnType<typeof getSwapStatistics>;

  // Actions
  actions: SwapActions;

  // Modal Management
  modals: ModalState;
  modalActions: ModalActions;

  // Utilities
  createSortableHeader: (column: keyof Swap, label: string) => any;
  reload: () => void;
}

// ============================================================================
// Main Hook Implementation
// ============================================================================

export function useSwapsPage(): UseSwapsPageReturn {
  // ========================================
  // Core Data & Loading States
  // ========================================

  const { swaps, loading, reload, userId, username } = useSwaps();

  // ========================================
  // Modal States
  // ========================================

  const [selectedPlantId, setSelectedPlantId] = useState<number | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedSwap, setSelectedSwap] = useState<FullSwap | null>(null);
  const [openSwapInfo, setOpenSwapInfo] = useState(false);

  // ========================================
  // Filter & Sort States
  // ========================================

  const [activeStatuses, setActiveStatuses] = useState<SwapStatus[]>([]);
  const [sortColumn, setSortColumn] = useState<keyof Swap>(
    SWAPS_DEFAULT_CONFIG.SORT_COLUMN
  );
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    SWAPS_DEFAULT_CONFIG.SORT_DIRECTION
  );
  const [searchQuery, setSearchQuery] = useState<string>("");

  // ========================================
  // Computed Values
  // ========================================

  // Apply filtering and sorting
  const filteredSwaps = useMemo(() => {
    const filters = {
      searchQuery,
      activeStatuses,
      sortColumn,
      sortDirection,
    };

    return filterAndSortSwaps(swaps, filters);
  }, [swaps, searchQuery, activeStatuses, sortColumn, sortDirection]);

  // Pagination
  const {
    page,
    totalPages,
    paginated: paginatedSwaps,
    goToPage,
  } = usePagination(filteredSwaps, PAGINATION_SIZES.TABLE);

  // Statistics for dashboard/overview
  const statistics = useMemo(() => getSwapStatistics(swaps), [swaps]);

  // ========================================
  // Action Handlers
  // ========================================

  // Status filter toggle
  const toggleStatus = useCallback((status: SwapStatus) => {
    setActiveStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  }, []);

  // Search handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handleSearchClear = useCallback(() => {
    setSearchQuery("");
  }, []);

  // Sort handler with validation
  const handleSort = useCallback(
    (column: keyof Swap) => {
      // Validate if column is sortable using centralized constants
      if (!isSortableColumn(column)) {
        console.warn(`Column '${String(column)}' is not sortable`);
        return;
      }

      if (column === sortColumn) {
        setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"));
      } else {
        setSortColumn(column);
        setSortDirection("asc");
      }
    },
    [sortColumn]
  );

  // Swap action handlers
  const handleAcceptSwap = useCallback(
    async (swap: FullSwap) => {
      if (!userId) return;

      try {
        await acceptSwapProposal({
          swapId: swap.id,
          senderPlantId: swap.senderPlant?.id,
          receiverPlantId: swap.receiverPlant?.id,
        });
        reload();
      } catch (err) {
        console.error("Error accepting swap:", err);
        // Error handling is done in the service
      }
    },
    [userId, reload]
  );

  const handleDeclineSwap = useCallback(
    async (swap: FullSwap) => {
      if (!userId) return;

      try {
        await declineSwapProposal({
          swapId: swap.id,
          senderPlantId: swap.senderPlant?.id,
          receiverPlantId: swap.receiverPlant?.id,
        });
        reload();
      } catch (err) {
        console.error("Error declining swap:", err);
        // Error handling is done in the service
      }
    },
    [userId, reload]
  );

  // ========================================
  // Modal Action Handlers
  // ========================================

  const handlePlantClick = useCallback((plantId: number) => {
    setSelectedPlantId(plantId);
  }, []);

  const handleUserClick = useCallback((userId: string) => {
    setSelectedUserId(userId);
  }, []);

  const handleSwapInfoClick = useCallback((swap: FullSwap) => {
    setSelectedSwap(swap);
    setOpenSwapInfo(true);
  }, []);

  // ========================================
  // Utility Functions
  // ========================================

  // Sortable header generator
  const createSortableHeader = useCallback(
    (column: keyof Swap, label: string) => {
      const props = createSortableHeaderProps(
        column,
        label,
        sortColumn,
        handleSort
      );

      return props;
    },
    [sortColumn, handleSort]
  );

  // ========================================
  // Return Interface
  // ========================================

  return {
    // Data & Loading
    swaps,
    filteredSwaps,
    paginatedSwaps,
    loading,
    userId,
    username,

    // Pagination
    page,
    totalPages,
    goToPage,

    // Filters & Sorting
    filters: {
      activeStatuses,
      sortColumn,
      sortDirection,
      searchQuery,
    },
    statistics,

    // Actions
    actions: {
      handleAcceptSwap,
      handleDeclineSwap,
      handleSort,
      handleSearchChange,
      handleSearchClear,
      toggleStatus,
    },

    // Modal Management
    modals: {
      selectedPlantId,
      selectedUserId,
      selectedSwap,
      openSwapInfo,
    },
    modalActions: {
      setSelectedPlantId,
      setSelectedUserId,
      setSelectedSwap,
      setOpenSwapInfo,
      handlePlantClick,
      handleUserClick,
      handleSwapInfoClick,
    },

    // Utilities
    createSortableHeader,
    reload,
  };
}

// ============================================================================
// Export Types for Container Component
// ============================================================================

export type { ModalState, FilterState, SwapActions, ModalActions };
