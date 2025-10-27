import React from "react";
import { cn } from "@/lib/utils";

interface CardFieldProps {
  label: string;
  value: string | React.ReactNode;
  className?: string;
  span?: "col-span-1" | "col-span-2";
  valueClassName?: string;
}

/**
 * 🏷️ CardField - Componente para mostrar campos de información en cards
 *
 * Estructura consistente para mostrar:
 * - Label en mayúsculas con estilo muted
 * - Valor con tipografía destacada
 * - Soporte para contenido React (iconos, imágenes, etc.)
 * - Control de span para ocupar 1 o 2 columnas del grid
 *
 * @example
 * ```tsx
 * // Campo simple de 1 columna
 * <CardField label="Common Name" value="Monstera" />
 *
 * // Campo de 2 columnas con contenido React
 * <CardField
 *   label="Description"
 *   value={<span className="italic">Long description text here</span>}
 *   span="col-span-2"
 * />
 * ```
 */
export function CardField({
  label,
  value,
  className,
  span = "col-span-1",
  valueClassName,
}: CardFieldProps) {
  return (
    <div className={cn(span, className)}>
      <p className="text-muted-foreground text-xs uppercase">{label}</p>
      <div className={cn("font-semibold truncate", valueClassName)}>
        {value}
      </div>
    </div>
  );
}
