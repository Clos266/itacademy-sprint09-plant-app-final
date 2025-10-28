/**
 * 🔄 Swaps Filtering Utilities
 *
 * Pure functions for filtering, sorting and transforming swap data.
 * Extracted from Swaps.tsx to improve testability and reusability.
 *
 * Following the same successful pattern used in eventsFiltering.ts
 */

import type { Database } from "@/types/supabase";
import {
  SWAP_STATUSES,
  // SWAP_STATUS_LABELS, // Used in container components
  type SwapStatus,
} from "@/constants/status";
import { DOMAIN_FILTER_TYPES } from "@/constants/filterTypes";

// ============================================================================
// Constants (eliminar magic numbers)
// ============================================================================

export const SWAPS_DEFAULT_CONFIG = {
  SORT_COLUMN: "created_at" as keyof Swap,
  SORT_DIRECTION: "desc" as const,
} as const;

// ============================================================================
// Types & Interfaces
// ============================================================================

type Swap = Database["public"]["Tables"]["swaps"]["Row"];

// ============================================================================
// Re-export types from service layer (single source of truth)
// ============================================================================

export type { FullSwap } from "@/services/swapCrudService";
import type { FullSwap } from "@/services/swapCrudService";

export type SortableColumn = (typeof DOMAIN_FILTER_TYPES.SWAPS.SORT_BY)[number];
export type SortDirection = "asc" | "desc";

export interface SwapFilters {
  searchQuery: string;
  activeStatuses: SwapStatus[];
  sortColumn: keyof Swap;
  sortDirection: SortDirection;
}

// ============================================================================
// Status Transformation
// ============================================================================

/**
 * Map database status to UI-friendly status
 * Centralizes the status mapping logic from Swaps.tsx
 */
export function mapSwapStatus(dbStatus: string): SwapStatus {
  switch (dbStatus) {
    case "pending":
      return SWAP_STATUSES.NEW;
    case "rejected":
      return SWAP_STATUSES.DECLINED;
    case "accepted":
      return SWAP_STATUSES.ACCEPTED;
    case "completed":
      return SWAP_STATUSES.COMPLETED;
    default:
      return dbStatus as SwapStatus;
  }
}

/**
 * Get badge variant for swap status
 * Centralizes UI styling logic
 */
export function getSwapStatusBadgeVariant(
  status: SwapStatus
): "secondary" | "default" | "destructive" | "outline" {
  const badgeVariants = {
    [SWAP_STATUSES.NEW]: "secondary" as const,
    [SWAP_STATUSES.ACCEPTED]: "default" as const,
    [SWAP_STATUSES.DECLINED]: "destructive" as const,
    [SWAP_STATUSES.COMPLETED]: "outline" as const,
  };

  return badgeVariants[status] || "secondary";
}

// ============================================================================
// Filtering Functions
// ============================================================================

/**
 * Filter swaps by search query
 * Searches across multiple fields: user, plant names, status
 */
export function filterSwapsByQuery(
  swaps: FullSwap[],
  query: string
): FullSwap[] {
  if (!query.trim()) return swaps;

  const normalizedQuery = query.toLowerCase();

  return swaps.filter((swap) => {
    const receiverUsername = swap.receiver?.username?.toLowerCase() || "";
    const senderUsername = swap.sender?.username?.toLowerCase() || "";
    const senderPlantName = swap.senderPlant?.nombre_comun?.toLowerCase() || "";
    const receiverPlantName =
      swap.receiverPlant?.nombre_comun?.toLowerCase() || "";
    const status = mapSwapStatus(swap.status).toLowerCase();

    return (
      receiverUsername.includes(normalizedQuery) ||
      senderUsername.includes(normalizedQuery) ||
      senderPlantName.includes(normalizedQuery) ||
      receiverPlantName.includes(normalizedQuery) ||
      status.includes(normalizedQuery)
    );
  });
}

/**
 * Filter swaps by status array
 * Returns swaps that match any of the active statuses
 */
export function filterSwapsByStatus(
  swaps: FullSwap[],
  activeStatuses: SwapStatus[]
): FullSwap[] {
  if (activeStatuses.length === 0) return swaps;

  return swaps.filter((swap) =>
    activeStatuses.includes(mapSwapStatus(swap.status))
  );
}

/**
 * Combined filtering function
 * Applies both query and status filters
 */
export function filterSwaps(
  swaps: FullSwap[],
  filters: Pick<SwapFilters, "searchQuery" | "activeStatuses">
): FullSwap[] {
  let filtered = filterSwapsByQuery(swaps, filters.searchQuery);
  filtered = filterSwapsByStatus(filtered, filters.activeStatuses);
  return filtered;
}

// ============================================================================
// Sorting Functions
// ============================================================================

/**
 * Sort swaps by column with type-aware comparison
 * Handles string, number, and date comparisons
 */
export function sortSwapsByColumn(
  swaps: FullSwap[],
  column: keyof Swap,
  direction: SortDirection
): FullSwap[] {
  return [...swaps].sort((a, b) => {
    const A = a[column];
    const B = b[column];

    // String comparison
    if (typeof A === "string" && typeof B === "string") {
      return direction === "asc" ? A.localeCompare(B) : B.localeCompare(A);
    }

    // Number comparison
    if (typeof A === "number" && typeof B === "number") {
      return direction === "asc" ? A - B : B - A;
    }

    // Date comparison (for created_at, updated_at)
    if (
      (column === "created_at" || column === "updated_at") &&
      typeof A === "string" &&
      typeof B === "string"
    ) {
      const dateA = new Date(A).getTime();
      const dateB = new Date(B).getTime();
      return direction === "asc" ? dateA - dateB : dateB - dateA;
    }

    return 0;
  });
}

/**
 * Validate if column is sortable
 * Uses centralized constants for validation
 */
export function isSortableColumn(column: keyof Swap): column is SortableColumn {
  return DOMAIN_FILTER_TYPES.SWAPS.SORT_BY.includes(column as SortableColumn);
}

/**
 * Combined filtering and sorting function
 * Main utility used by the hook
 */
export function filterAndSortSwaps(
  swaps: FullSwap[],
  filters: SwapFilters
): FullSwap[] {
  // Apply filters
  let result = filterSwaps(swaps, {
    searchQuery: filters.searchQuery,
    activeStatuses: filters.activeStatuses,
  });

  // Apply sorting
  result = sortSwapsByColumn(result, filters.sortColumn, filters.sortDirection);

  return result;
}

// ============================================================================
// Table Column Configuration Helpers
// ============================================================================

/**
 * Generate sortable header configuration
 * Returns the props needed to create a sortable header
 */
export function createSortableHeaderProps(
  column: keyof Swap,
  label: string,
  currentSortColumn: keyof Swap,
  onSort: (column: keyof Swap) => void
) {
  return {
    column,
    label,
    isActive: currentSortColumn === column,
    onClick: () => onSort(column),
    className:
      "flex items-center cursor-pointer hover:text-primary transition-colors duration-200",
    iconClassName: `w-4 h-4 ml-1 transition-colors duration-200 ${
      currentSortColumn === column ? "text-primary" : "text-muted-foreground"
    }`,
  };
}

// ============================================================================
// Statistics & Utilities
// ============================================================================

/**
 * Get swap statistics for dashboard/overview
 */
export function getSwapStatistics(swaps: FullSwap[]) {
  const total = swaps.length;
  const byStatus = swaps.reduce((acc, swap) => {
    const status = mapSwapStatus(swap.status);
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<SwapStatus, number>);

  return {
    total,
    new: byStatus[SWAP_STATUSES.NEW] || 0,
    accepted: byStatus[SWAP_STATUSES.ACCEPTED] || 0,
    declined: byStatus[SWAP_STATUSES.DECLINED] || 0,
    completed: byStatus[SWAP_STATUSES.COMPLETED] || 0,
    byStatus,
  };
}

// Business logic moved to swapCrudService.ts for better separation of concerns

// ============================================================================
// Export Constants for Reuse
// ============================================================================

export {
  SWAP_STATUSES,
  SWAP_STATUS_LABELS,
  type SwapStatus,
} from "@/constants/status";

export { DOMAIN_FILTER_TYPES } from "@/constants/filterTypes";

// Re-export business logic from service layer
export { canUserActOnSwap } from "@/services/swapCrudService";
