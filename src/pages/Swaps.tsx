import { useState, useMemo, useCallback } from "react";
import { PageHeader, PageHeaderHeading } from "@/components/page-header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PaginatedTable } from "@/components/common/PaginatedTable";
import { Toggle } from "@/components/ui/toggle";
import { ArrowUpDown } from "lucide-react";
import { PlantDetailsModal } from "@/components/Plants/PlantDetailsModal";
import { UserDetailsModal } from "@/components/Users/UserDetailsModal";
import { SwapInfoModal } from "@/components/swaps/SwapInfoModal";
import { useSwaps } from "@/hooks/useSwaps";
import { usePagination } from "@/hooks/usePagination";
import { markSwapAsCompletedByUser } from "@/services/swapCrudService";
import { showSuccess, showError } from "@/services/toastService";
import type { Database } from "@/types/supabase";
import { LoadingState } from "@/components/common/LoadingState";

type Swap = Database["public"]["Tables"]["swaps"]["Row"];
type Plant = Database["public"]["Tables"]["plants"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type SwapStatus = "pending" | "accepted" | "rejected" | "completed";

interface FullSwap extends Swap {
  senderPlant?: Plant | null;
  receiverPlant?: Plant | null;
  receiver?: Profile | null;
}

// TODO: Extract to separate types file when growing
type SortableColumn = (typeof SORTABLE_COLUMNS)[number];
type SortDirection = "asc" | "desc";

const ITEMS_PER_PAGE = 5;
const SWAP_STATUSES: SwapStatus[] = [
  "pending",
  "accepted",
  "rejected",
  "completed",
];
const SORTABLE_COLUMNS = ["created_at", "receiver_id", "status"] as const;

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

  // TODO: Extract to useSwapsLogic hook - Memoized status filter toggle
  const toggleStatus = useCallback((status: SwapStatus) => {
    setActiveStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  }, []);

  // TODO: Extract to useSwapsLogic hook - Memoized sort handler with validation
  const handleSort = useCallback(
    (column: keyof Swap) => {
      // Validate if column is sortable using SORTABLE_COLUMNS
      if (!SORTABLE_COLUMNS.includes(column as SortableColumn)) {
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
    // TODO: Add search filter when search functionality is needed
    const filtered = swaps.filter(
      (swap) =>
        activeStatuses.length === 0 ||
        activeStatuses.includes(swap.status as SwapStatus)
    );

    return filtered.sort((a, b) => {
      const A = a[sortColumn];
      const B = b[sortColumn];

      // Handle different data types properly
      if (typeof A === "string" && typeof B === "string") {
        return sortDir === "asc" ? A.localeCompare(B) : B.localeCompare(A);
      }

      if (typeof A === "number" && typeof B === "number") {
        return sortDir === "asc" ? A - B : B - A;
      }

      // Handle date strings (created_at)
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
  }, [swaps, activeStatuses, sortColumn, sortDir]);

  // Use pagination hook instead of manual pagination
  const { page, totalPages, paginated, goToPage } = usePagination(
    filteredAndSortedSwaps,
    ITEMS_PER_PAGE
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

  // TODO: Extract to useSwapsLogic hook - Memoized completion handler
  const handleMarkAsCompleted = useCallback(
    async (swapId: number) => {
      try {
        if (!userId) {
          showError("User not logged in");
          return;
        }
        await markSwapAsCompletedByUser(swapId, userId);
        showSuccess("Marked your side as completed");
        reload();
      } catch (err) {
        console.error("Error marking swap as completed:", err);
        showError("Failed to update completion status");
      }
    },
    [userId, reload]
  );

  if (loading) {
    return <LoadingState className="h-[70vh]" />;
  }

  return (
    <>
      <PageHeader>
        <PageHeaderHeading>Plant Swaps</PageHeaderHeading>
      </PageHeader>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>My Plant Swaps</CardTitle>
          <CardDescription>View, accept, or propose swaps</CardDescription>
        </CardHeader>
      </Card>

      {/* TODO: Extract StatusFilter component when filters grow */}
      <div className="flex flex-wrap gap-2 mb-4">
        {SWAP_STATUSES.map((status) => (
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
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Toggle>
        ))}
      </div>

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
            render: (swap: FullSwap) => (
              // TODO: Extract ActionsCell component when table grows
              <div className="flex gap-2">
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

                <Button
                  size="sm"
                  variant={
                    swap.status === "completed"
                      ? "outline"
                      : swap.status === "rejected"
                      ? "destructive"
                      : "secondary"
                  }
                  disabled={swap.status !== "accepted"}
                  onClick={() => handleMarkAsCompleted(swap.id)}
                  className="transition-colors duration-200"
                  title={
                    swap.status === "completed"
                      ? "Already completed"
                      : swap.status === "rejected"
                      ? "This swap was rejected"
                      : swap.status !== "accepted"
                      ? "Only accepted swaps can be marked as completed"
                      : "Mark as completed"
                  }
                >
                  {swap.status === "completed"
                    ? "Completed"
                    : swap.status === "rejected"
                    ? "Rejected"
                    : "Complete"}
                </Button>
              </div>
            ),
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
    </>
  );
}
