import React from "react";
import { cn } from "@/lib/utils";

interface IconFieldProps {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
  textSize?: "text-xs" | "text-sm";
  className?: string;
}

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
