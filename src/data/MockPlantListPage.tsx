import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EditPlantModal } from "@/components/Plants/EditPlantModal";
import { mockPlants } from "@/data/mockPlants";

export default function MockPlantListPage() {
  const [plants, setPlants] = useState(mockPlants);
  const [selectedPlant, setSelectedPlant] = useState<any>(null);
  const [open, setOpen] = useState(false);

  const handleEdit = (plant: any) => {
    setSelectedPlant(plant);
    setOpen(true);
  };

  const handleSave = (id: number, updated: Partial<any>) => {
    setPlants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">🌱 My Plants (Mock Edit Demo)</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plants.map((plant) => (
          <Card key={plant.id}>
            <CardHeader>
              <CardTitle>{plant.nombre_comun}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm italic mb-2">
                {plant.nombre_cientifico || "Unknown species"}
              </p>
              <p className="text-sm mb-2">Family: {plant.familia || "N/A"}</p>
              <p
                className={`text-sm mb-4 ${
                  plant.disponible ? "text-green-600" : "text-muted-foreground"
                }`}
              >
                {plant.disponible ? "Available" : "Not available"}
              </p>
              <Button size="sm" onClick={() => handleEdit(plant)}>
                Edit
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <EditPlantModal
        open={open}
        onOpenChange={setOpen}
        plant={selectedPlant}
        onSave={handleSave}
      />
    </div>
  );
}
