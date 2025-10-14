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
import { mockPlants as initialMockPlants } from "@/data/mockPlants";
import { NewPlantButton } from "@/components/Plants/NewPlantModal";
import { EditPlantModal } from "@/components/Plants/EditPlantModal";
import { Pencil } from "lucide-react";

export default function PlantsPage() {
  const [plants, setPlants] = useState(initialMockPlants);
  const [selectedPlant, setSelectedPlant] = useState<any>(null);
  const [openEdit, setOpenEdit] = useState(false);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("todas");
  const [category, setCategory] = useState("todas");

  const itemsPerPage = 5;

  // 🔹 Filtering
  const filtered = plants.filter(
    (p) =>
      p.nombre_comun.toLowerCase().includes(search.toLowerCase()) &&
      (filter === "todas" ||
        (filter === "disponible" && p.disponible) ||
        (filter === "no-disponible" && !p.disponible)) &&
      (category === "todas" ||
        p.especie?.toLowerCase().includes(category.toLowerCase()))
  );

  // 🔹 Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handlePrevious = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  // 🔹 Handle edit
  const handleEdit = (plant: any) => {
    setSelectedPlant(plant);
    setOpenEdit(true);
  };

  // 🔹 Save edits (updates local mock array)
  const handleSave = (id: number, updated: Partial<any>) => {
    setPlants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );
  };

  return (
    <>
      <PageHeader>
        <PageHeaderHeading>🌿 My Plants</PageHeaderHeading>
      </PageHeader>

      {/* 🔍 Search & Filters */}
      <Card className="mt-4">
        <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4">
          <div className="flex gap-2 w-full md:w-1/2">
            <Input
              placeholder="Search plant..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button>Search</Button>
          </div>

          <div className="flex gap-2 md:w-auto">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">All</SelectItem>
                <SelectItem value="suculentas">Succulents</SelectItem>
                <SelectItem value="cactus">Cactus</SelectItem>
                <SelectItem value="interior">Indoor</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">All</SelectItem>
                <SelectItem value="disponible">Available</SelectItem>
                <SelectItem value="no-disponible">Unavailable</SelectItem>
              </SelectContent>
            </Select>

            {/* ✅ This button works fine on its own */}
            <NewPlantButton />
          </div>
        </CardContent>
      </Card>

      {/* 📋 Plants Table */}
      <Card className="mt-6">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Common Name</TableHead>
                <TableHead>Scientific Name</TableHead>
                <TableHead>Edit</TableHead>
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
                  <TableCell className="font-medium max-w-[140px] truncate">
                    {plant.nombre_comun}
                  </TableCell>
                  <TableCell className="italic text-muted-foreground max-w-[120px] truncate">
                    {plant.nombre_cientifico || "—"}
                  </TableCell>
                  <TableCell className="w-24 truncate">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(plant)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* 🪴 Empty State */}
          {paginated.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              No plants found.
            </div>
          )}
        </CardContent>
      </Card>

      {/* 📄 Pagination */}
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

      {/* 🪴 Edit Modal */}
      <EditPlantModal
        open={openEdit}
        onOpenChange={setOpenEdit}
        plant={selectedPlant}
        onSave={handleSave}
      />
    </>
  );
}
