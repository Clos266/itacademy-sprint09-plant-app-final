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
import { usePagination } from "@/hooks/usePagination";
import { Toggle } from "@/components/ui/toggle";
import { ArrowUpDown, Check, X, Plus } from "lucide-react";

import { mockPlants } from "@/data/mockPlants";
import { mockUsers } from "@/data/mockUsers";
import { mockSwaps } from "@/data/mockSwaps";
import { PlantDetailsModal } from "@/components/Plants/PlantDetailsModal";
import { UserDetailsModal } from "@/Users/UserDetailsModal";

type SwapStatus = "pending" | "accepted" | "rejected" | "completed";

interface Swap {
  id: number;
  myPlantId: number;
  otherPlantId: number;
  userId: string;
  date: string; // ISO
  status: SwapStatus;
}

export default function SwapsPage() {
  // 👉 base data
  const [swaps] = useState<Swap[]>(mockSwaps as Swap[]);
  const [selectedPlant, setSelectedPlant] = useState<null | number>(null);
  const [selectedUser, setSelectedUser] = useState<null | string>(null);

  // 👉 filters + sorting
  const [activeStatuses, setActiveStatuses] = useState<SwapStatus[]>([]);
  const [sortColumn, setSortColumn] = useState<keyof Swap>("date");
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

  // 👉 filter + sort
  const filtered = swaps.filter(
    (s) => activeStatuses.length === 0 || activeStatuses.includes(s.status)
  );

  const sorted = [...filtered].sort((a, b) => {
    const A = a[sortColumn];
    const B = b[sortColumn];
    if (typeof A === "string" && typeof B === "string") {
      return sortDir === "asc" ? A.localeCompare(B) : B.localeCompare(A);
    }
    return 0;
  });

  // 👉 pagination
  const { page, totalPages, paginated, goToPage } = usePagination(sorted, 5);

  // helpers
  const getPlant = (id: number) => mockPlants.find((p) => p.id === id);
  const getUser = (id: string) => mockUsers.find((u) => u.id === id);
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });

  const selectedPlantData = selectedPlant
    ? mockPlants.find((p) => p.id === selectedPlant)
    : null;

  const selectedUserData = selectedUser
    ? mockUsers.find((u) => u.id === selectedUser)
    : null;

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

      {/* Compact filters by status */}
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

      {/* Table + pagination */}
      <PaginatedTable
        data={paginated}
        columns={[
          {
            key: "myPlant",
            header: "Your Plant",
            render: (swap: Swap) => {
              const p = getPlant(swap.myPlantId);
              return (
                <div className="flex items-center gap-3">
                  <img
                    src={p?.image_url || "/placeholder.jpg"}
                    alt={p?.nombre_comun}
                    className="w-10 h-10 rounded-lg object-cover cursor-pointer transition-transform hover:scale-105"
                    onClick={() => setSelectedPlant(swap.myPlantId)}
                  />
                  <span>{p?.nombre_comun}</span>
                </div>
              );
            },
          },
          {
            key: "otherPlant",
            header: "Other Plant",
            render: (swap: Swap) => {
              const p = getPlant(swap.otherPlantId);
              return (
                <div className="flex items-center gap-3">
                  <img
                    src={p?.image_url || "/placeholder.jpg"}
                    alt={p?.nombre_comun}
                    className="w-10 h-10 rounded-lg object-cover cursor-pointer transition-transform hover:scale-105"
                    onClick={() => setSelectedPlant(swap.otherPlantId)}
                  />
                  <span>{p?.nombre_comun}</span>
                </div>
              );
            },
          },
          {
            key: "userId",
            header: (
              <button
                type="button"
                className="flex items-center cursor-pointer"
                onClick={() => handleSort("userId")}
              >
                User <ArrowUpDown className="w-4 h-4 ml-1" />
              </button>
            ) as unknown as string,
            render: (swap: Swap) => {
              const u = getUser(swap.userId);
              return (
                <div className="flex items-center gap-2">
                  <img
                    src={u?.avatar_url}
                    alt={u?.username}
                    className="w-8 h-8 rounded-full object-cover cursor-pointer transition-transform hover:scale-105"
                    onClick={() => setSelectedUser(swap.userId)} // ✅ open user modal on click
                  />
                  <span className="hidden sm:inline">@{u?.username}</span>
                </div>
              );
            },
          },
          {
            key: "date",
            header: (
              <button
                type="button"
                className="flex items-center cursor-pointer"
                onClick={() => handleSort("date")}
              >
                Date <ArrowUpDown className="w-4 h-4 ml-1" />
              </button>
            ) as unknown as string,
            render: (swap: Swap) => (
              <span className="text-xs sm:text-sm text-muted-foreground">
                {formatDate(swap.date)}
              </span>
            ),
          },
          {
            key: "actions",
            header: "Actions",
            render: (swap: Swap) => (
              <div className="flex justify-end gap-2">
                {swap.status === "pending" ? (
                  <>
                    <Button size="sm">
                      <Check />
                    </Button>
                    <Button size="sm" variant="destructive">
                      <X />
                    </Button>
                  </>
                ) : null}
              </div>
            ),
          },
        ]}
        page={page}
        totalPages={totalPages}
        onPageChange={goToPage}
      />

      {/* CTA Propose Swap */}
      <div className="flex justify-end mt-6">
        <Button>
          <Plus />
        </Button>
      </div>

      {/* ✅ Plant Details Modal */}
      <PlantDetailsModal
        open={!!selectedPlant}
        onOpenChange={(open) => !open && setSelectedPlant(null)}
        plant={selectedPlantData}
      />

      {/* ✅ User Details Modal */}
      <UserDetailsModal
        open={!!selectedUser}
        onOpenChange={(open) => !open && setSelectedUser(null)}
        user={selectedUserData}
      />
    </>
  );
}
