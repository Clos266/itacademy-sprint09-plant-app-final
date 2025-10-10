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

export default function PlantsPage() {
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
                <TableHead>Disponible</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3].map((n) => (
                <TableRow key={n}>
                  <TableCell>
                    <div className="w-12 h-12 bg-muted rounded-lg" />
                  </TableCell>
                  <TableCell>Planta {n}</TableCell>
                  <TableCell>
                    <span className="italic text-muted-foreground">
                      Ficus lyrata
                    </span>
                  </TableCell>
                  <TableCell>7</TableCell>
                  <TableCell>
                    <span className="text-green-600 font-medium">Sí</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                      <Button variant="destructive" size="sm">
                        Borrar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 📄 Paginación */}
      <div className="mt-6">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <Button variant="ghost" className="font-medium">
                1
              </Button>
            </PaginationItem>
            <PaginationItem>
              <Button variant="ghost">2</Button>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </>
  );
}
