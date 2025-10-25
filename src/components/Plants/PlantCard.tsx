import { memo } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import type { FullPlant } from "@/hooks/usePlantSwap";

interface PlantCardProps {
  plant: FullPlant;
  isSelected: boolean;
  onSelect: (plantId: number) => void;
  onProposeSwap: (plant: FullPlant) => void;
}

const DEFAULT_IMAGES = {
  plant: "/imagenotfound.jpeg",
  avatar: "/avatar-placeholder.png",
} as const;

export const PlantCard = memo(function PlantCard({
  plant,
  isSelected,
  onSelect,
  onProposeSwap,
}: PlantCardProps) {
  const owner = plant.profile;

  const handleCardClick = () => {
    onSelect(plant.id);
  };

  const handleProposeSwap = (e: React.MouseEvent) => {
    e.stopPropagation();
    onProposeSwap(plant);
  };

  return (
    <Card
      className={`transition-all cursor-pointer overflow-hidden flex flex-col ${
        isSelected ? "ring-2 ring-primary shadow-lg" : "hover:shadow-md"
      }`}
      onClick={handleCardClick}
    >
      <CardContent className="p-4 pb-0">
        <div className="relative aspect-square w-full rounded-lg overflow-hidden shadow-sm">
          <img
            src={plant.image_url || DEFAULT_IMAGES.plant}
            alt={plant.nombre_comun || "Plant"}
            className="object-cover w-full h-full"
            loading="lazy"
          />
          <div className="absolute top-3 left-3">
            <Badge
              variant={plant.disponible ? "default" : "destructive"}
              className="text-xs"
            >
              {plant.disponible ? "Available" : "Unavailable"}
            </Badge>
          </div>
        </div>
      </CardContent>

      <CardHeader className="flex-1 flex flex-col justify-between p-4 items-center text-left">
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm w-full max-w-xs">
          {/* Common Name */}
          <div>
            <p className="text-muted-foreground text-xs uppercase font-medium">
              Common Name
            </p>
            <p
              className="font-semibold truncate"
              title={plant.nombre_comun || ""}
            >
              {plant.nombre_comun || "Unknown"}
            </p>
          </div>

          {/* Scientific Name */}
          <div>
            <p className="text-muted-foreground text-xs uppercase font-medium">
              Scientific
            </p>
            <p
              className="italic truncate"
              title={plant.nombre_cientifico || ""}
            >
              {plant.nombre_cientifico || "-"}
            </p>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="truncate" title={owner?.ciudad || ""}>
              {owner?.ciudad || "Unknown"}
            </span>
          </div>

          {/* Owner */}
          <div className="flex items-center gap-2">
            <img
              src={owner?.avatar_url || DEFAULT_IMAGES.avatar}
              alt={`${owner?.username || "User"} avatar`}
              className="w-6 h-6 rounded-full object-cover flex-shrink-0"
              loading="lazy"
            />
            <span
              className="text-muted-foreground truncate"
              title={owner?.username || ""}
            >
              {owner?.username || "Anonymous"}
            </span>
          </div>
        </div>

        <div className="mt-4 w-full">
          <Button
            disabled={!plant.disponible}
            className="w-full"
            onClick={handleProposeSwap}
            size="sm"
          >
            Propose Swap
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
});

PlantCard.displayName = "PlantCard";
