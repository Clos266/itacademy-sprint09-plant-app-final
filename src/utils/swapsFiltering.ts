import type { Database } from "@/types/supabase";
import { SWAP_STATUSES, type SwapStatus } from "@/constants/status";
import { DOMAIN_FILTER_TYPES } from "@/constants/filterTypes";

export const SWAPS_DEFAULT_CONFIG = {
  SORT_COLUMN: "created_at" as keyof Swap,
  SORT_DIRECTION: "desc" as const,
} as const;

type Swap = Database["public"]["Tables"]["swaps"]["Row"];

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

export function filterAndSortSwaps(
  swaps: FullSwap[],
  filters: SwapFilters
): FullSwap[] {
  let result = swaps;

  if (filters.searchQuery.trim()) {
    const normalizedQuery = filters.searchQuery.toLowerCase();

    result = result.filter((swap) => {
      const receiverUsername = swap.receiver?.username?.toLowerCase() || "";
      const senderUsername = swap.sender?.username?.toLowerCase() || "";
      const senderPlantName =
        swap.senderPlant?.nombre_comun?.toLowerCase() || "";
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

  if (filters.activeStatuses.length > 0) {
    result = result.filter((swap) =>
      filters.activeStatuses.includes(mapSwapStatus(swap.status))
    );
  }

  result = [...result].sort((a, b) => {
    const A = a[filters.sortColumn];
    const B = b[filters.sortColumn];

    if (typeof A === "string" && typeof B === "string") {
      return filters.sortDirection === "asc"
        ? A.localeCompare(B)
        : B.localeCompare(A);
    }

    if (typeof A === "number" && typeof B === "number") {
      return filters.sortDirection === "asc" ? A - B : B - A;
    }

    if (
      (filters.sortColumn === "created_at" ||
        filters.sortColumn === "updated_at") &&
      typeof A === "string" &&
      typeof B === "string"
    ) {
      const dateA = new Date(A).getTime();
      const dateB = new Date(B).getTime();
      return filters.sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    }

    return 0;
  });

  return result;
}

export function isSortableColumn(column: keyof Swap): column is SortableColumn {
  return DOMAIN_FILTER_TYPES.SWAPS.SORT_BY.includes(column as SortableColumn);
}

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

export { SWAP_STATUSES, type SwapStatus } from "@/constants/status";

export { DOMAIN_FILTER_TYPES } from "@/constants/filterTypes";

export { canUserActOnSwap } from "@/services/swapCrudService";
