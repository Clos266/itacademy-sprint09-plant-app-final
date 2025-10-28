import { useState, useMemo, useCallback } from "react";
import { PageHeader, PageHeaderHeading } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { FilterBar } from "@/components/common/FilterBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PaginatedTable } from "@/components/common/PaginatedTable";
import { Toggle } from "@/components/ui/toggle";
import { ArrowUpDown } from "lucide-react";
import { PlantDetailsModal } from "@/components/Plants/PlantDetailsModal";
import { UserDetailsModal } from "@/components/Users/UserDetailsModal";
import { SwapInfoModal } from "@/components/swaps/SwapInfoModal";
import { SearchInput } from "@/components/common/SearchInput";
import { useSwaps } from "@/hooks/useSwaps";
import { usePagination } from "@/hooks/usePagination";
import { updateSwapStatusWithAvailability } from "@/services/swapCrudService";
import { showSuccess, showError } from "@/services/toastService";
import type { Database } from "@/types/supabase";
import { LoadingState } from "@/components/common/LoadingState";
import { PAGINATION_SIZES } from "@/constants/pagination";
import {
  SWAP_STATUSES,
  SWAP_STATUS_LIST,
  SWAP_STATUS_LABELS,
  type SwapStatus,
} from "@/constants/status";
import { DOMAIN_FILTER_TYPES } from "@/constants/filterTypes";
import { SPACING } from "@/constants/layouts";

type Swap = Database["public"]["Tables"]["swaps"]["Row"];
type Plant = Database["public"]["Tables"]["plants"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface FullSwap extends Swap {
  senderPlant?: Plant | null;
  receiverPlant?: Plant | null;
  receiver?: Profile | null;
}

// TODO: Extract to separate types file when growing
type SortableColumn = (typeof DOMAIN_FILTER_TYPES.SWAPS.SORT_BY)[number];
type SortDirection = "asc" | "desc";

const mapSwapStatus = (dbStatus: string): SwapStatus => {
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
};

export default function SwapsPage() {
  // TODO: Extract to useSwapsLogic hook - Core data and actions
  const { swaps, loading, reload, userId, username } = useSwaps();

  // TODO: Extract to useModalsState hook - Modal visibility states
  const [selectedPlantId, setSelectedPlantId] = useState<number | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedSwap, setSelectedSwap] = useState<FullSwap | null>(null);
  const [openSwapInfo, setOpenSwapInfo] = useState(false);

  // Filter and sort states
  const [activeStatuses, setActiveStatuses] = useState<SwapStatus[]>([]);
  const [sortColumn, setSortColumn] = useState<keyof Swap>("created_at");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // TODO: Extract to useSwapsLogic hook - Memoized status filter toggle
  const toggleStatus = useCallback((status: SwapStatus) => {
    setActiveStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handleSearchClear = useCallback(() => {
    setSearchQuery("");
  }, []);

  const handleAcceptSwap = useCallback(
    async (swap: FullSwap) => {
      try {
        await updateSwapStatusWithAvailability(
          swap.id,
          "accepted",
          swap.senderPlant?.id,
          swap.receiverPlant?.id
        );
        showSuccess("Swap accepted successfully");
        reload();
      } catch (err) {
        console.error("Error accepting swap:", err);
        showError("Failed to accept swap");
      }
    },
    [reload]
  );

  const handleDeclineSwap = useCallback(
    async (swap: FullSwap) => {
      try {
        await updateSwapStatusWithAvailability(
          swap.id,
          "rejected",
          swap.senderPlant?.id,
          swap.receiverPlant?.id
        );
        showSuccess("Swap declined successfully");
        reload();
      } catch (err) {
        console.error("Error declining swap:", err);
        showError("Failed to decline swap");
      }
    },
    [reload]
  );

  // TODO: Extract to useSwapsLogic hook - Memoized sort handler with validation
  const handleSort = useCallback(
    (column: keyof Swap) => {
      // Validate if column is sortable using centralized constants
      if (
        !DOMAIN_FILTER_TYPES.SWAPS.SORT_BY.includes(column as SortableColumn)
      ) {
        console.warn(`Column '${String(column)}' is not sortable`);
        return;
      }

      if (column === sortColumn) {
        setSortDir((direction) => (direction === "asc" ? "desc" : "asc"));
      } else {
        setSortColumn(column);
        setSortDir("asc");
      }
    },
    [sortColumn]
  );

  // TODO: Extract to useSwapsLogic hook - Memoized filtering and sorting for performance
  const filteredAndSortedSwaps = useMemo(() => {
    let filtered = swaps;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((swap) => {
        const receiverUsername = swap.receiver?.username?.toLowerCase() || "";
        const senderPlantName =
          swap.senderPlant?.nombre_comun?.toLowerCase() || "";
        const receiverPlantName =
          swap.receiverPlant?.nombre_comun?.toLowerCase() || "";
        const status = mapSwapStatus(swap.status).toLowerCase();

        return (
          receiverUsername.includes(query) ||
          senderPlantName.includes(query) ||
          receiverPlantName.includes(query) ||
          status.includes(query)
        );
      });
    }

    if (activeStatuses.length > 0) {
      filtered = filtered.filter((swap) =>
        activeStatuses.includes(mapSwapStatus(swap.status))
      );
    }

    return filtered.sort((a, b) => {
      const A = a[sortColumn];
      const B = b[sortColumn];

      if (typeof A === "string" && typeof B === "string") {
        return sortDir === "asc" ? A.localeCompare(B) : B.localeCompare(A);
      }

      if (typeof A === "number" && typeof B === "number") {
        return sortDir === "asc" ? A - B : B - A;
      }

      if (
        sortColumn === "created_at" &&
        typeof A === "string" &&
        typeof B === "string"
      ) {
        const dateA = new Date(A).getTime();
        const dateB = new Date(B).getTime();
        return sortDir === "asc" ? dateA - dateB : dateB - dateA;
      }

      return 0;
    });
  }, [swaps, activeStatuses, sortColumn, sortDir, searchQuery]);

  const { page, totalPages, paginated, goToPage } = usePagination(
    filteredAndSortedSwaps,
    PAGINATION_SIZES.TABLE
  );

  // TODO: Extract to shared component - Memoized sortable header generator
  const createSortableHeader = useCallback(
    (column: keyof Swap, label: string) => (
      <button
        type="button"
        className="flex items-center cursor-pointer hover:text-primary transition-colors duration-200"
        onClick={() => handleSort(column)}
      >
        {label}
        <ArrowUpDown
          className={`w-4 h-4 ml-1 transition-colors duration-200 ${
            sortColumn === column ? "text-primary" : "text-muted-foreground"
          }`}
        />
      </button>
    ),
    [handleSort, sortColumn]
  );

  if (loading) {
    return <LoadingState className="h-[70vh]" />;
  }

  return (
    <div className={SPACING.PAGE.SECTION_GAP}>
      <PageHeader>
        <PageHeaderHeading>Plant Swaps</PageHeaderHeading>
      </PageHeader>

      <Card>
        <CardContent>
          <FilterBar
            searchComponent={
              <SearchInput
                value={searchQuery}
                onChange={handleSearchChange}
                onClear={handleSearchClear}
                placeholder="Search swaps by user, plants, or status..."
              />
            }
            filters={
              <>
                {SWAP_STATUS_LIST.map((status) => (
                  <Toggle
                    key={status}
                    pressed={activeStatuses.includes(status)}
                    onPressedChange={() => toggleStatus(status)}
                    className={`transition-all duration-200 ${
                      activeStatuses.includes(status)
                        ? "bg-primary text-white shadow-md"
                        : "border border-muted-foreground text-muted-foreground hover:bg-muted hover:border-primary"
                    }`}
                  >
                    {SWAP_STATUS_LABELS[status]}
                  </Toggle>
                ))}
              </>
            }
          />
        </CardContent>
      </Card>

      {/* TODO: Extract StatusFilter component when filters grow */}

      {/* TODO: Extract SwapsTable component when table logic grows complex */}

      <PaginatedTable
        data={paginated}
        totalPages={totalPages}
        onPageChange={goToPage}
        page={page}
        columns={[
          {
            key: "senderPlant",
            header: "Your Plant",
            render: (swap: FullSwap) => (
              <div className="flex items-center gap-3">
                <img
                  src={swap.senderPlant?.image_url || "/imagenotfound.jpeg"}
                  alt={swap.senderPlant?.nombre_comun || "Plant image"}
                  loading="lazy"
                  className="w-10 h-10 rounded-lg object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                  onClick={() =>
                    setSelectedPlantId(swap.senderPlant?.id || null)
                  }
                />
                <span className="truncate max-w-[120px]">
                  {swap.senderPlant?.nombre_comun || "Unknown Plant"}
                </span>
              </div>
            ),
          },
          {
            key: "receiverPlant",
            header: "Other Plant",
            render: (swap: FullSwap) => (
              <div className="flex items-center gap-3">
                <img
                  src={swap.receiverPlant?.image_url || "/imagenotfound.jpeg"}
                  alt={swap.receiverPlant?.nombre_comun || "Plant image"}
                  loading="lazy"
                  className="w-10 h-10 rounded-lg object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                  onClick={() =>
                    setSelectedPlantId(swap.receiverPlant?.id || null)
                  }
                />
                <span className="truncate max-w-[120px]">
                  {swap.receiverPlant?.nombre_comun || "Unknown Plant"}
                </span>
              </div>
            ),
          },
          {
            key: "receiver",
            header: createSortableHeader(
              "receiver_id",
              "User"
            ) as unknown as string,
            render: (swap: FullSwap) => (
              <div className="flex items-center gap-2">
                <img
                  src={swap.receiver?.avatar_url || "/avatar-placeholder.png"}
                  alt={swap.receiver?.username || "User avatar"}
                  loading="lazy"
                  className="w-8 h-8 rounded-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                  onClick={() => setSelectedUserId(swap.receiver?.id || null)}
                />
                <span className="hidden sm:inline truncate max-w-[100px]">
                  @{swap.receiver?.username || "Unknown User"}
                </span>
              </div>
            ),
          },
          {
            key: "actions",
            header: "Actions",
            render: (swap: FullSwap) => {
              // TODO: Extract to SwapActionsCell component
              const uiStatus = mapSwapStatus(swap.status);
              const isNewSwap = uiStatus === SWAP_STATUSES.NEW;
              const isNewReceiver = isNewSwap && swap.receiver_id === userId;

              return (
                <div className="flex gap-2 items-center">
                  {isNewReceiver ? (
                    <>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleAcceptSwap(swap)}
                        className="transition-colors duration-200"
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeclineSwap(swap)}
                        className="transition-colors duration-200"
                      >
                        Decline
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedSwap(swap);
                        setOpenSwapInfo(true);
                      }}
                      className="transition-colors duration-200"
                    >
                      View
                    </Button>
                  )}
                </div>
              );
            },
          },
          {
            key: "status",
            header: "Status",
            render: (swap: FullSwap) => {
              const uiStatus = mapSwapStatus(swap.status);
              const badgeVariant = {
                [SWAP_STATUSES.NEW]: "secondary",
                [SWAP_STATUSES.ACCEPTED]: "default",
                [SWAP_STATUSES.DECLINED]: "destructive",
                [SWAP_STATUSES.COMPLETED]: "outline",
              } as const;

              return (
                <Badge variant={badgeVariant[uiStatus]} className="capitalize">
                  {SWAP_STATUS_LABELS[uiStatus]}
                </Badge>
              );
            },
          },
        ]}
      />

      {/* TODO: Extract modal management to useModalsState hook when modal count increases */}
      <PlantDetailsModal
        open={!!selectedPlantId}
        onOpenChange={(open) => !open && setSelectedPlantId(null)}
        plantId={selectedPlantId}
      />

      <UserDetailsModal
        open={!!selectedUserId}
        onOpenChange={(open) => !open && setSelectedUserId(null)}
        userId={selectedUserId}
      />

      <SwapInfoModal
        open={openSwapInfo}
        onOpenChange={setOpenSwapInfo}
        swap={selectedSwap}
        userId={userId || ""}
        onStatusChange={reload}
        username={username || ""}
      />
    </div>
  );
}
