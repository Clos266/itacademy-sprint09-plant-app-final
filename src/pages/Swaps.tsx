import { useState } from "react";
import { PageHeader, PageHeaderHeading } from "@/components/page-header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  ArrowUpDown,
  Check,
  X,
  EyeIcon,
  CircleDotDashed,
  CheckCheck,
  Plus,
} from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { mockPlants } from "@/data/mockPlants";
import { mockUsers } from "@/data/mockUsers";
import { mockSwaps } from "@/data/mockSwaps";

export default function SwapsPage() {
  const [sortColumn, setSortColumn] =
    useState<keyof (typeof mockSwaps)[0]>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const getPlantById = (id: number) => mockPlants.find((p) => p.id === id);
  const getUserById = (id: string) => mockUsers.find((u) => u.id === id);

  // 🔹 Sorting
  const handleSort = (column: keyof Swap) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // 🔹 Toggle filters (accumulative)
  const toggleFilter = (status: string) => {
    setActiveFilters((prev) =>
      prev.includes(status)
        ? prev.filter((f) => f !== status)
        : [...prev, status]
    );
  };

  const filteredSwaps = mockSwaps.filter(
    (swap) => activeFilters.length === 0 || activeFilters.includes(swap.status)
  );

  const sortedSwaps = [...filteredSwaps].sort((a, b) => {
    const valueA = a[sortColumn];
    const valueB = b[sortColumn];
    if (typeof valueA === "string" && typeof valueB === "string") {
      return sortDirection === "asc"
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }
    return 0;
  });

  return (
    <>
      <PageHeader>
        <PageHeaderHeading>🔁 Plant Swaps</PageHeaderHeading>
      </PageHeader>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>My Plant Swaps</CardTitle>
          <CardDescription>
            Here you can view, accept, or propose swaps with other users 🌱
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Filters with Toggle */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Toggle
          pressed={activeFilters.includes("pending")}
          onPressedChange={() => toggleFilter("pending")}
          className={`${
            activeFilters.includes("pending")
              ? "bg-yellow-500 text-white hover:bg-yellow-600"
              : "border border-yellow-500 text-yellow-600 hover:bg-yellow-100"
          }`}
        >
          Pending
        </Toggle>

        <Toggle
          pressed={activeFilters.includes("accepted")}
          onPressedChange={() => toggleFilter("accepted")}
          className={`${
            activeFilters.includes("accepted")
              ? "bg-green-600 text-white hover:bg-green-700"
              : "border border-green-600 text-green-700 hover:bg-green-100"
          }`}
        >
          Accepted
        </Toggle>

        <Toggle
          pressed={activeFilters.includes("rejected")}
          onPressedChange={() => toggleFilter("rejected")}
          className={`${
            activeFilters.includes("rejected")
              ? "bg-red-600 text-white hover:bg-red-700"
              : "border border-red-600 text-red-700 hover:bg-red-100"
          }`}
        >
          Rejected
        </Toggle>

        <Toggle
          pressed={activeFilters.includes("completed")}
          onPressedChange={() => toggleFilter("completed")}
          className={`${
            activeFilters.includes("completed")
              ? "bg-gray-600 text-white hover:bg-gray-700"
              : "border border-gray-600 text-gray-700 hover:bg-gray-100"
          }`}
        >
          Completed
        </Toggle>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Your Plant</TableHead>
                <TableHead>Other User’s Plant</TableHead>
                <TableHead
                  onClick={() => handleSort("userId")}
                  className="cursor-pointer"
                >
                  User <ArrowUpDown className="inline w-4 h-4 ml-1" />
                </TableHead>
                <TableHead
                  onClick={() => handleSort("status")}
                  className="cursor-pointer"
                >
                  Status <ArrowUpDown className="inline w-4 h-4 ml-1" />
                </TableHead>
                <TableHead
                  onClick={() => handleSort("date")}
                  className="cursor-pointer"
                >
                  Date <ArrowUpDown className="inline w-4 h-4 ml-1" />
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {sortedSwaps.map((swap) => {
                const myPlant = getPlantById(swap.myPlantId);
                const otherPlant = getPlantById(swap.otherPlantId);
                const user = getUserById(swap.userId);

                return (
                  <TableRow key={swap.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={myPlant?.image_url || "/placeholder.jpg"}
                          alt={myPlant?.nombre_comun}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <span>{myPlant?.nombre_comun}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={otherPlant?.image_url || "/placeholder.jpg"}
                          alt={otherPlant?.nombre_comun}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <span>{otherPlant?.nombre_comun}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <img
                          src={user?.avatar_url}
                          alt={user?.username}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <span>@{user?.username}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      {swap.status === "pending" && (
                        <span className="text-yellow-600 font-medium">
                          <CircleDotDashed className="inline w-4 h-4" />
                        </span>
                      )}
                      {swap.status === "accepted" && (
                        <span className="text-green-600 font-medium">
                          <Check className="inline w-4 h-4" />
                        </span>
                      )}
                      {swap.status === "rejected" && (
                        <span className="text-red-600 font-medium">
                          <X className="inline w-4 h-4" />
                        </span>
                      )}
                      {swap.status === "completed" && (
                        <span className="text-gray-500 font-medium">
                          <CheckCheck className="inline w-4 h-4" />
                        </span>
                      )}
                    </TableCell>

                    <TableCell>{swap.date}</TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {swap.status === "pending" ? (
                          <>
                            <Button size="sm">
                              <Check />
                            </Button>
                            <Button variant="destructive" size="sm">
                              <X />
                            </Button>
                          </>
                        ) : (
                          <Button variant="ghost" size="sm">
                            <EyeIcon />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-end mt-6">
        <Button>
          <Plus />
        </Button>
      </div>
    </>
  );
}
