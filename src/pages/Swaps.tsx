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
import { ArrowUpDown, Check, X, EyeIcon } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { mockPlants } from "@/data/mockPlants";
import { mockUsers } from "@/data/mockUsers";

interface Swap {
  id: number;
  myPlantId: number;
  otherPlantId: number;
  userId: string;
  status: "pendiente" | "aceptado" | "rechazado" | "completado";
  date: string;
}

export default function SwapsPage() {
  const [sortColumn, setSortColumn] = useState<keyof Swap>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const mockSwaps: Swap[] = [
    {
      id: 1,
      myPlantId: 1,
      otherPlantId: 6,
      userId: "u1",
      status: "pendiente",
      date: "2025-10-09",
    },
    {
      id: 2,
      myPlantId: 2,
      otherPlantId: 8,
      userId: "u2",
      status: "aceptado",
      date: "2025-10-07",
    },
    {
      id: 3,
      myPlantId: 3,
      otherPlantId: 4,
      userId: "u3",
      status: "completado",
      date: "2025-10-05",
    },
    {
      id: 4,
      myPlantId: 5,
      otherPlantId: 9,
      userId: "u4",
      status: "pendiente",
      date: "2025-10-08",
    },
    {
      id: 5,
      myPlantId: 7,
      otherPlantId: 10,
      userId: "u5",
      status: "rechazado",
      date: "2025-10-03",
    },
  ];

  const getPlantById = (id: number) => mockPlants.find((p) => p.id === id);
  const getUserById = (id: string) => mockUsers.find((u) => u.id === id);

  // 🔹 Ordenar
  const handleSort = (column: keyof Swap) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // 🔹 Filtros toggle acumulables
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
        <PageHeaderHeading>🔁 Intercambios</PageHeaderHeading>
      </PageHeader>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Mis intercambios de plantas</CardTitle>
          <CardDescription>
            Aquí podrás ver, aceptar o proponer intercambios con otros usuarios
            🌱
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Filtros con Toggle */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Toggle
          pressed={activeFilters.includes("pendiente")}
          onPressedChange={() => toggleFilter("pendiente")}
          className={`${
            activeFilters.includes("pendiente")
              ? "bg-yellow-500 text-white hover:bg-yellow-600"
              : "border border-yellow-500 text-yellow-600 hover:bg-yellow-100"
          }`}
        >
          Pendiente
        </Toggle>

        <Toggle
          pressed={activeFilters.includes("aceptado")}
          onPressedChange={() => toggleFilter("aceptado")}
          className={`${
            activeFilters.includes("aceptado")
              ? "bg-green-600 text-white hover:bg-green-700"
              : "border border-green-600 text-green-700 hover:bg-green-100"
          }`}
        >
          Aceptado
        </Toggle>

        <Toggle
          pressed={activeFilters.includes("rechazado")}
          onPressedChange={() => toggleFilter("rechazado")}
          className={`${
            activeFilters.includes("rechazado")
              ? "bg-red-600 text-white hover:bg-red-700"
              : "border border-red-600 text-red-700 hover:bg-red-100"
          }`}
        >
          Rechazado
        </Toggle>

        <Toggle
          pressed={activeFilters.includes("completado")}
          onPressedChange={() => toggleFilter("completado")}
          className={`${
            activeFilters.includes("completado")
              ? "bg-gray-600 text-white hover:bg-gray-700"
              : "border border-gray-600 text-gray-700 hover:bg-gray-100"
          }`}
        >
          Completado
        </Toggle>
      </div>

      {/* Tabla */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  onClick={() => handleSort("myPlantId")}
                  className="cursor-pointer"
                >
                  Tu planta <ArrowUpDown className="inline w-4 h-4 ml-1" />
                </TableHead>
                <TableHead>Planta del otro usuario</TableHead>
                <TableHead
                  onClick={() => handleSort("userId")}
                  className="cursor-pointer"
                >
                  Usuario <ArrowUpDown className="inline w-4 h-4 ml-1" />
                </TableHead>
                <TableHead
                  onClick={() => handleSort("status")}
                  className="cursor-pointer"
                >
                  Estado <ArrowUpDown className="inline w-4 h-4 ml-1" />
                </TableHead>
                <TableHead
                  onClick={() => handleSort("date")}
                  className="cursor-pointer"
                >
                  Fecha <ArrowUpDown className="inline w-4 h-4 ml-1" />
                </TableHead>
                <TableHead className="text-right">Acciones</TableHead>
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
                      {swap.status === "pendiente" && (
                        <span className="text-yellow-600 font-medium">
                          Pendiente
                        </span>
                      )}
                      {swap.status === "aceptado" && (
                        <span className="text-green-600 font-medium">
                          Aceptado
                        </span>
                      )}
                      {swap.status === "rechazado" && (
                        <span className="text-red-600 font-medium">
                          Rechazado
                        </span>
                      )}
                      {swap.status === "completado" && (
                        <span className="text-gray-500 font-medium">
                          Completado
                        </span>
                      )}
                    </TableCell>

                    <TableCell>{swap.date}</TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {swap.status === "pendiente" ? (
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
          <span className="hidden md:inline">➕ Proponer intercambio</span>
          <span className="md:hidden text-lg font-bold">＋</span>
        </Button>
      </div>
    </>
  );
}
