import { PageHeader, PageHeaderHeading } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <PageHeader>
        <PageHeaderHeading>🌱 Bienvenido a PlantApp</PageHeaderHeading>
      </PageHeader>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">🌿 Ultimas plantas añadidas</h3>
            <p className="text-sm text-muted-foreground">
              Añade, organiza y revisa tus plantas fácilmente.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">📍 Puntos de intercambio</h3>
            <p className="text-sm text-muted-foreground">
              Descubre lugares cercanos para intercambiar esquejes y plantas.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">💬 Comunidad</h3>
            <p className="text-sm text-muted-foreground">
              Conecta con otros usuarios, comparte consejos y participa en
              eventos.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
