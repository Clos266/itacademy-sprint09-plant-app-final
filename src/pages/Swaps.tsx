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

export default function SwapsPage() {
  return (
    <>
      <PageHeader>
        <PageHeaderHeading>🔁 Intercambios</PageHeaderHeading>
      </PageHeader>

      {/* Información general */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Mis intercambios de plantas</CardTitle>
          <CardDescription>
            Aquí podrás ver, aceptar o proponer intercambios con otros usuarios
            de la comunidad 🌱
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Tabla de intercambios */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tu planta</TableHead>
                <TableHead>Planta del otro usuario</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3].map((n) => (
                <TableRow key={n}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src="/placeholder.jpg"
                        alt={`Planta ${n}`}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <span>Monstera deliciosa</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src="/placeholder.jpg"
                        alt="Otra planta"
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <span>Pothos dorado</span>
                    </div>
                  </TableCell>
                  <TableCell>@usuario{n}</TableCell>
                  <TableCell>
                    {n === 1 ? (
                      <span className="text-yellow-600 font-medium">
                        Pendiente
                      </span>
                    ) : n === 2 ? (
                      <span className="text-green-600 font-medium">
                        Aceptado
                      </span>
                    ) : (
                      <span className="text-gray-500 font-medium">
                        Completado
                      </span>
                    )}
                  </TableCell>
                  <TableCell>2025-10-10</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {n === 1 ? (
                        <>
                          <Button variant="outline" size="sm">
                            Aceptar
                          </Button>
                          <Button variant="destructive" size="sm">
                            Rechazar
                          </Button>
                        </>
                      ) : (
                        <Button variant="ghost" size="sm">
                          Ver
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Botón nuevo swap */}
      <div className="flex justify-end mt-6">
        <Button>
          <span className="hidden md:inline">➕ Proponer intercambio</span>
          <span className="md:hidden text-lg font-bold">＋</span>
        </Button>
      </div>
    </>
  );
}
