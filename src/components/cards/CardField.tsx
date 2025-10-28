import React from "react";
import { cn } from "@/lib/utils";

interface CardFieldProps {
  label: string;
  value: string | React.ReactNode;
  className?: string;
  span?: "col-span-1" | "col-span-2";
  valueClassName?: string;
}

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
