import { useState } from "react";
import { PageHeader, PageHeaderHeading } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { mockPlants } from "@/data/mockPlants";

export default function PlantsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("todas");

  const itemsPerPage = 5;

  // 🔹 Filtro por nombre y disponibilidad
  const filtered = mockPlants.filter(
    (p) =>
      p.nombre_comun.toLowerCase().includes(search.toLowerCase()) &&
      (filter === "todas" ||
        (filter === "disponible" && p.disponible) ||
        (filter === "no-disponible" && !p.disponible))
  );

  // 🔹 Paginación real
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handlePrevious = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <>
      <PageHeader>
        <PageHeaderHeading>🌿 Mis Plantas</PageHeaderHeading>
      </PageHeader>

      {/* 🔍 Barra de búsqueda y filtros */}
      <Card className="mt-4">
        <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4">
          <div className="flex gap-2 w-full md:w-1/2">
            <Input placeholder="Buscar planta..." className="flex-1" />
            <Button>Buscar</Button>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Select>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="suculentas">Suculentas</SelectItem>
                <SelectItem value="cactus">Cactus</SelectItem>
                <SelectItem value="interior">Interior</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Disponibilidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="disponible">Disponible</SelectItem>
                <SelectItem value="no-disponible">No disponible</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <span className="hidden md:inline">➕ Añadir planta</span>
              <span className="md:hidden text-lg font-bold">＋</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 📋 Tabla de plantas */}
      <Card className="mt-6">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imagen</TableHead>
                <TableHead>Nombre común</TableHead>
                <TableHead>Nombre científico</TableHead>
                <TableHead>Riego (días)</TableHead>
                <TableHead>Editar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((plant) => (
                <TableRow key={plant.id}>
                  <TableCell>
                    <img
                      src={plant.image_url || "/placeholder.jpg"}
                      alt={plant.nombre_comun}
                      className="w-12 h-12 rounded-lg object-cover shadow-sm"
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {plant.nombre_comun}
                  </TableCell>
                  <TableCell className="italic text-muted-foreground">
                    {plant.nombre_cientifico || "—"}
                  </TableCell>
                  <TableCell>{plant.interval_days}</TableCell>
                  <TableCell className="w-24">
                    <div className="flex  gap-2">
                      <Button>
                        <span className="hidden md:inline">✏️</span>
                        <span className="md:hidden text-lg">✏️</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* 🪴 Sin resultados */}
          {paginated.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              No se encontraron plantas.
            </div>
          )}
        </CardContent>
      </Card>

      {/* 📄 Paginación */}
      <div className="mt-6">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={handlePrevious}
                aria-disabled={page === 1}
              />
            </PaginationItem>

            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <Button
                  variant={page === i + 1 ? "default" : "ghost"}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </Button>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={handleNext}
                aria-disabled={page === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </>
  );
}
