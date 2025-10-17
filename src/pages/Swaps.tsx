import { useEffect, useState } from "react";
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
import { supabase } from "@/services/supabaseClient";
import type { Database } from "@/types/supabase";
import { PlantDetailsModal } from "@/components/Plants/PlantDetailsModal";
import { UserDetailsModal } from "@/Users/UserDetailsModal";

type Swap = Database["public"]["Tables"]["swaps"]["Row"];
type Plant = Database["public"]["Tables"]["plants"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface FullSwap extends Swap {
  sender: Profile | null;
  receiver: Profile | null;
  senderPlant: Plant | null;
  receiverPlant: Plant | null;
}

type SwapStatus = "pending" | "accepted" | "rejected" | "completed";

export default function SwapsPage() {
  const [swaps, setSwaps] = useState<FullSwap[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedPlantId, setSelectedPlantId] = useState<number | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const [activeStatuses, setActiveStatuses] = useState<SwapStatus[]>([]);
  const [sortColumn, setSortColumn] = useState<keyof Swap>("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // 🔁 Fetch swaps from Supabase
  useEffect(() => {
    const fetchSwaps = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("swaps")
        .select(
          `
          *,
          sender:sender_id(*),
          receiver:receiver_id(*),
          senderPlant:sender_plant_id(*),
          receiverPlant:receiver_plant_id(*)
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching swaps:", error.message);
      } else {
        // Asegurar formato consistente
        const formatted = data.map((s: any) => ({
          ...s,
          sender: s.sender || null,
          receiver: s.receiver || null,
          senderPlant: s.senderPlant || null,
          receiverPlant: s.receiverPlant || null,
        }));
        setSwaps(formatted);
      }

      setLoading(false);
    };

    fetchSwaps();
  }, []);

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

  // 🔍 Filtrar + ordenar
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

  const { page, totalPages, paginated, goToPage } = usePagination(sorted, 5);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Cargando swaps...
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

      {/* 🔘 Filtros compactos */}
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

      {/* 🧾 Tabla */}
      <PaginatedTable
        data={paginated}
        columns={[
          {
            key: "senderPlant",
            header: "Your Plant",
            render: (swap: FullSwap) => (
              <div className="flex items-center gap-3">
                <img
                  src={swap.senderPlant?.image_url || "/imagenotfound.jpeg"}
                  alt={swap.senderPlant?.nombre_comun}
                  className="w-10 h-10 rounded-lg object-cover cursor-pointer transition-transform hover:scale-105"
                  onClick={() =>
                    swap.senderPlant?.id &&
                    setSelectedPlantId(swap.senderPlant.id)
                  }
                />
                <span>{swap.senderPlant?.nombre_comun}</span>
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
                  alt={swap.receiverPlant?.nombre_comun}
                  className="w-10 h-10 rounded-lg object-cover cursor-pointer transition-transform hover:scale-105"
                  onClick={() =>
                    swap.receiverPlant?.id &&
                    setSelectedPlantId(swap.receiverPlant.id)
                  }
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
            render: (swap: FullSwap) => (
              <div className="flex items-center gap-2">
                <img
                  src={swap.receiver?.avatar_url || "/avatar-placeholder.png"}
                  alt={swap.receiver?.username ?? "User"}
                  className="w-8 h-8 rounded-full object-cover cursor-pointer transition-transform hover:scale-105"
                  onClick={() => setSelectedUserId(swap.receiver?.id || null)}
                />
                <span className="hidden sm:inline">
                  @{swap.receiver?.username}
                </span>
              </div>
            ),
          },
          {
            key: "created_at",
            header: (
              <button
                type="button"
                className="flex items-center cursor-pointer"
                onClick={() => handleSort("created_at")}
              >
                Date <ArrowUpDown className="w-4 h-4 ml-1" />
              </button>
            ) as unknown as string,
            render: (swap: FullSwap) => (
              <span className="text-xs sm:text-sm text-muted-foreground">
                {formatDate(swap.created_at || "")}
              </span>
            ),
          },
          {
            key: "actions",
            header: "Actions",
            render: (swap: FullSwap) => (
              <div className="flex justify-end gap-2">
                {swap.status === "pending" ? (
                  <>
                    <Button size="sm" title="Accept">
                      <Check />
                    </Button>
                    <Button size="sm" variant="destructive" title="Reject">
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

      {/* 🌿 Modales */}
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
    </>
  );
}
