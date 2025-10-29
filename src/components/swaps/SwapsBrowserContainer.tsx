import { PageHeader, PageHeaderHeading } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { FilterBar } from "@/components/common/FilterBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PaginatedTable } from "@/components/common/PaginatedTable";
import { Toggle } from "@/components/ui/toggle";

import { PlantDetailsModal } from "@/components/Plants/PlantDetailsModal";
import { UserDetailsModal } from "@/components/Users/UserDetailsModal";
import { SwapInfoModal } from "@/components/swaps/SwapInfoModal";
import { SearchInput } from "@/components/common/SearchInput";
import { LoadingState } from "@/components/common/LoadingState";
import { useSwapsPage } from "@/hooks/useSwapsPage";

import {
  SWAP_STATUS_LIST,
  SWAP_STATUS_LABELS,
  type SwapStatus,
} from "@/constants/status";
import { SPACING } from "@/constants/layouts";

const UI_CONFIG = {
  PLANT_IMAGE: {
    SIZE: "w-10 h-10",
    STYLES:
      "rounded-lg object-cover cursor-pointer hover:scale-105 transition-transform duration-200",
  },
  USER_AVATAR: {
    SIZE: "w-8 h-8",
    STYLES:
      "rounded-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200",
  },
  USERNAME: {
    STYLES: "hidden sm:inline truncate max-w-[100px]",
  },
  PLANT_NAME: {
    STYLES: "truncate max-w-[120px]",
  },
} as const;
import {
  mapSwapStatus,
  getSwapStatusBadgeVariant,
  canUserActOnSwap,
  type FullSwap,
} from "@/utils/swapsFiltering";

interface SwapsBrowserContainerProps {
  className?: string;
}

export function SwapsBrowserContainer({
  className = "",
}: SwapsBrowserContainerProps) {
  const {
    paginatedSwaps,
    loading,
    userId,
    username,

    page,
    totalPages,
    goToPage,

    filters,

    actions,

    modals,
    modalActions,
  } = useSwapsPage();

  if (loading) {
    return <LoadingState className="h-[70vh]" />;
  }

  const tableColumns = [
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
              modalActions.handlePlantClick(swap.senderPlant?.id || 0)
            }
          />
          <span className={UI_CONFIG.PLANT_NAME.STYLES}>
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
              modalActions.handlePlantClick(swap.receiverPlant?.id || 0)
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
      header: "User",
      render: (swap: FullSwap) => (
        <div className="flex items-center gap-2">
          <img
            src={swap.receiver?.avatar_url || "/imagenotfound.jpeg"}
            alt={swap.receiver?.username || "User avatar"}
            loading="lazy"
            className="w-8 h-8 rounded-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
            onClick={() =>
              modalActions.handleUserClick(swap.receiver?.id || "")
            }
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
        const permissions = canUserActOnSwap(swap, userId || "");

        return (
          <div className="flex gap-2 items-center">
            {permissions.canAccept ? (
              <>
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => actions.handleAcceptSwap(swap)}
                  className="transition-colors duration-200"
                >
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => actions.handleDeclineSwap(swap)}
                  className="transition-colors duration-200"
                >
                  Decline
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => modalActions.handleSwapInfoClick(swap)}
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
        const badgeVariant = getSwapStatusBadgeVariant(uiStatus);

        return (
          <Badge variant={badgeVariant} className="capitalize">
            {SWAP_STATUS_LABELS[uiStatus]}
          </Badge>
        );
      },
    },
  ];

  return (
    <div className={`${SPACING.PAGE.SECTION_GAP} ${className}`}>
      <PageHeader>
        <PageHeaderHeading>Plant Swaps</PageHeaderHeading>
      </PageHeader>

      <Card>
        <CardContent>
          <FilterBar
            searchComponent={
              <SearchInput
                value={filters.searchQuery}
                onChange={actions.handleSearchChange}
                onClear={actions.handleSearchClear}
                placeholder="Search swaps by user, plants, or status..."
              />
            }
            filters={
              <>
                {SWAP_STATUS_LIST.map((status: SwapStatus) => (
                  <Toggle
                    key={status}
                    pressed={filters.activeStatuses.includes(status)}
                    onPressedChange={() => actions.toggleStatus(status)}
                    className={`transition-all duration-200 ${
                      filters.activeStatuses.includes(status)
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

      <PaginatedTable
        data={paginatedSwaps}
        totalPages={totalPages}
        onPageChange={goToPage}
        page={page}
        columns={tableColumns}
      />

      <PlantDetailsModal
        open={!!modals.selectedPlantId}
        onOpenChange={(open) => !open && modalActions.setSelectedPlantId(null)}
        plantId={modals.selectedPlantId}
      />

      <UserDetailsModal
        open={!!modals.selectedUserId}
        onOpenChange={(open) => !open && modalActions.setSelectedUserId(null)}
        userId={modals.selectedUserId}
      />

      <SwapInfoModal
        open={modals.openSwapInfo}
        onOpenChange={modalActions.setOpenSwapInfo}
        swap={modals.selectedSwap}
        userId={userId || ""}
        onStatusChange={() => {}}
        username={username || ""}
      />
    </div>
  );
}

export type { SwapsBrowserContainerProps };
