import React from "react";
import { cn } from "@/lib/utils";

interface IconFieldProps {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
  textSize?: "text-xs" | "text-sm";
  className?: string;
}

/**
 * 🎯 IconField - Componente para mostrar icono + texto
 *
 * Patrón consistente usado para:
 * - Ubicación con MapPin
 * - Fechas con CalendarDays
 * - Usuarios con User icon
 * - Cualquier combinación icono + texto
 *
 * Mantiene spacing y estilos consistentes en todas las cards.
 *
 * @example
 * ```tsx
 * <IconField
 *   icon={MapPin}
 *   text="Barcelona, Spain"
 * />
 *
 * <IconField
 *   icon={CalendarDays}
 *   text="Oct 27, 2025"
 *   textSize="text-sm"
 * />
 * ```
 */
export function IconField({
  icon: Icon,
  text,
  textSize = "text-xs",
  className,
}: IconFieldProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className={cn("truncate", textSize)}>{text}</span>
    </div>
  );
}
