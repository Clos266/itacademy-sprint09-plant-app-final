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
import { ArrowUpDown, Check, X, EyeIcon, Plus } from "lucide-react";

import { mockPlants } from "@/data/mockPlants";
import { mockUsers } from "@/data/mockUsers";
import { mockSwaps } from "@/data/mockSwaps";

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
  // 👉 datos base
  const [swaps] = useState<Swap[]>(mockSwaps as Swap[]);

  // 👉 filtros + orden
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

  // 👉 filtrar + ordenar
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

  // 👉 paginación REAL (si aquí no ves los controles, es porque totalPages === 1)
  const { page, totalPages, paginated, goToPage } = usePagination(sorted, 5);

  // helpers
  const getPlant = (id: number) => mockPlants.find((p) => p.id === id);
  const getUser = (id: string) => mockUsers.find((u) => u.id === id);
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });

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

      {/* Filtros compactos por estado */}
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

      {/* Tabla + paginación (con 2 columnas clicables para ordenar) */}
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
                    className="w-10 h-10 rounded-lg object-cover"
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
                    className="w-10 h-10 rounded-lg object-cover"
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
            ) as unknown as string, // header permite ReactNode en tu tabla genérica
            render: (swap: Swap) => {
              const u = getUser(swap.userId);
              return (
                <div className="flex items-center gap-2">
                  <img
                    src={u?.avatar_url}
                    alt={u?.username}
                    className="w-8 h-8 rounded-full object-cover"
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
                ) : (
                  <Button size="sm" variant="ghost">
                    <EyeIcon />
                  </Button>
                )}
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
    </>
  );
}
