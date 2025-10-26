import { useState } from "react";
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
import type { Database } from "@/types/supabase";
import { Spinner } from "@/components/ui/spinner";

type Swap = Database["public"]["Tables"]["swaps"]["Row"];
type SwapStatus = "pending" | "accepted" | "rejected" | "completed";

export default function SwapsPage() {
  const { swaps, loading, reload, userId, username } = useSwaps();
  const [selectedPlantId, setSelectedPlantId] = useState<number | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedSwap, setSelectedSwap] = useState<any | null>(null);
  const [openSwapInfo, setOpenSwapInfo] = useState(false);
  const [activeStatuses, setActiveStatuses] = useState<SwapStatus[]>([]);
  const [sortColumn, setSortColumn] = useState<keyof Swap>("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const toggleStatus = (s: SwapStatus) =>
    setActiveStatuses((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );

  const handleSort = (col: keyof Swap) => {
    if (col === sortColumn) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortColumn(col);
      setSortDir("asc");
    }
  };

  const filtered = swaps.filter(
    (s) =>
      activeStatuses.length === 0 ||
      activeStatuses.includes(s.status as SwapStatus)
  );

  const sorted = [...filtered].sort((a, b) => {
    const A = a[sortColumn];
    const B = b[sortColumn];
    if (typeof A === "string" && typeof B === "string") {
      return sortDir === "asc" ? A.localeCompare(B) : B.localeCompare(A);
    }
    return 0;
  });
  const ITEMS_PER_PAGE = 5;
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const paginated = sorted.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );
  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <Spinner className="w-6 h-6 mb-2" />
      </div>
    );
  }

  return (
    <>
      <PageHeader>
        <PageHeaderHeading>🔁 Plant Swaps</PageHeaderHeading>
      </PageHeader>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>My Plant Swaps</CardTitle>
          <CardDescription>View, accept, or propose swaps 🌱</CardDescription>
        </CardHeader>
      </Card>

      {/* 🔘 Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(["pending", "accepted", "rejected", "completed"] as SwapStatus[]).map(
          (s) => (
            <Toggle
              key={s}
              pressed={activeStatuses.includes(s)}
              onPressedChange={() => toggleStatus(s)}
              className={`${
                activeStatuses.includes(s)
                  ? "bg-primary text-white"
                  : "border border-muted-foreground text-muted-foreground hover:bg-muted"
              }`}
            >
              {s[0].toUpperCase() + s.slice(1)}
            </Toggle>
          )
        )}
      </div>

      {/* 🧾 Table */}

      <PaginatedTable
        data={paginated}
        totalPages={totalPages}
        onPageChange={setPage}
        page={page}
        columns={[
          {
            key: "senderPlant",
            header: "Your Plant",
            render: (swap: any) => (
              <div className="flex items-center gap-3">
                <img
                  src={swap.senderPlant?.image_url || "/imagenotfound.jpeg"}
                  alt={swap.senderPlant?.nombre_comun}
                  className="w-10 h-10 rounded-lg object-cover cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setSelectedPlantId(swap.senderPlant?.id)}
                />
                <span>{swap.senderPlant?.nombre_comun}</span>
              </div>
            ),
          },
          {
            key: "receiverPlant",
            header: "Other Plant",
            render: (swap: any) => (
              <div className="flex items-center gap-3">
                <img
                  src={swap.receiverPlant?.image_url || "/imagenotfound.jpeg"}
                  alt={swap.receiverPlant?.nombre_comun}
                  className="w-10 h-10 rounded-lg object-cover cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setSelectedPlantId(swap.receiverPlant?.id)}
                />
                <span>{swap.receiverPlant?.nombre_comun}</span>
              </div>
            ),
          },
          {
            key: "receiver",
            header: (
              <button
                type="button"
                className="flex items-center cursor-pointer"
                onClick={() => handleSort("receiver_id")}
              >
                User <ArrowUpDown className="w-4 h-4 ml-1" />
              </button>
            ) as unknown as string,
            render: (swap: any) => (
              <div className="flex items-center gap-2">
                <img
                  src={swap.receiver?.avatar_url || "/avatar-placeholder.png"}
                  alt={swap.receiver?.username ?? "User"}
                  className="w-8 h-8 rounded-full object-cover cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setSelectedUserId(swap.receiver?.id)}
                />
                <span className="hidden sm:inline">
                  @{swap.receiver?.username}
                </span>
              </div>
            ),
          },
          {
            key: "actions",
            header: "Actions",
            render: (swap: any) => (
              <div className="flex gap-2">
                {/* 👁 View button */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedSwap(swap);
                    setOpenSwapInfo(true);
                  }}
                >
                  View
                </Button>

                {/* ✅ Mark as Completed */}
                <Button
                  size="sm"
                  variant={
                    swap.status === "completed" ? "outline" : "secondary"
                  }
                  disabled={swap.status !== "accepted"}
                  onClick={async () => {
                    try {
                      const { markSwapAsCompletedByUser } = await import(
                        "@/services/swapCrudService"
                      );
                      const { showSuccess } = await import(
                        "@/services/toastService"
                      );
                      if (!userId) {
                        const { showError } = await import(
                          "@/services/toastService"
                        );
                        showError("User not logged in");
                        return;
                      }
                      await markSwapAsCompletedByUser(swap.id, userId);

                      showSuccess("Marked your side as completed ");
                      reload();
                    } catch (err) {
                      console.error(err);
                      const { showError } = await import(
                        "@/services/toastService"
                      );
                      showError("Failed to update completion status");
                    }
                  }}
                >
                  {swap.status === "completed"
                    ? "Completed "
                    : "Mark as Completed"}
                </Button>
              </div>
            ),
          },
        ]}
      />

      {/* 🌱 Modales */}
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
