import { MapPin } from "lucide-react";
import { BaseCard } from "./BaseCard";
import { CardField } from "./CardField";
import type { Database } from "@/types/supabase";

type SwapPoint = Database["public"]["Tables"]["swap_points"]["Row"];

interface SwapPointCardProps {
  swapPoint: SwapPoint;
  onClick: (id: number) => void;
}

/**
 * 📍 SwapPointCard - Card específica para mostrar puntos de intercambio
 *
 * Basada en BaseCard, incluye:
 * - Badge fijo "Swap Point"
 * - Información del punto (nombre y descripción)
 * - Dirección completa con icono de ubicación
 * - Layout optimizado para mostrar información de localización
 *
 * @example
 * ```tsx
 * <SwapPointCard
 *   swapPoint={swapPoint}
 *   onClick={(id) => openSwapPointDetails(id)}
 * />
 * ```
 */
export function SwapPointCard({ swapPoint, onClick }: SwapPointCardProps) {
  return (
    <BaseCard
      imageUrl={swapPoint.image_url || undefined}
      imageAlt={swapPoint.name}
      badge={{
        variant: "default",
        text: "Swap Point",
      }}
      onClick={() => onClick(swapPoint.id)}
    >
      <CardField label="Swap Point" value={swapPoint.name} span="col-span-2" />

      <CardField
        label="Description"
        value={
          <p className="text-sm text-muted-foreground line-clamp-2">
            {swapPoint.description || "-"}
          </p>
        }
        span="col-span-2"
        valueClassName="font-normal"
      />

      <div className="col-span-2 flex items-center gap-1">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <span className="truncate text-xs">
          {swapPoint.address}, {swapPoint.city}
        </span>
      </div>
    </BaseCard>
  );
}
