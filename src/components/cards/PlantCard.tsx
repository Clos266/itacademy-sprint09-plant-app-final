import { MapPin } from "lucide-react";
import { BaseCard } from "./BaseCard";
import { CardField } from "./CardField";
import { IconField } from "./IconField";
import type { Database } from "@/types/supabase";

type Plant = Database["public"]["Tables"]["plants"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface FullPlant extends Plant {
  profile?: Profile | null;
}

interface PlantCardProps {
  plant: FullPlant;
  onClick: (plant: FullPlant) => void;
}

export function PlantCard({ plant, onClick }: PlantCardProps) {
  const owner = plant.profile;

  return (
    <BaseCard
      imageUrl={plant.image_url || undefined}
      imageAlt={plant.nombre_comun}
      badge={{
        variant: plant.disponible ? "default" : "destructive",
        text: plant.disponible ? "Available" : "Unavailable",
      }}
      onClick={() => onClick(plant)}
    >
      <CardField label="Common Name" value={plant.nombre_comun} />

      <CardField
        label="Scientific"
        value={<span className="italic">{plant.nombre_cientifico || "-"}</span>}
      />

      <IconField icon={MapPin} text={owner?.ciudad || "Unknown"} />

      <div className="flex items-center gap-2">
        <img
          src={owner?.avatar_url || "/avatar-placeholder.png"}
          alt={owner?.username || "User"}
          className="w-6 h-6 rounded-full object-cover"
          loading="lazy"
        />
        <span className="text-muted-foreground truncate">
          {owner?.username || "Anonymous"}
        </span>
      </div>
    </BaseCard>
  );
}
