import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { GRID_CONFIGS, SPACING } from "@/constants/layouts";

interface BaseCardProps {
  imageUrl?: string;
  imageAlt: string;
  badge: {
    variant: "default" | "secondary" | "destructive";
    text: string;
  };
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function BaseCard({
  imageUrl,
  imageAlt,
  badge,
  onClick,
  children,
  className,
}: BaseCardProps) {
  return (
    <Card
      className={cn(
        `${GRID_CONFIGS.CARDS.ITEM} cursor-pointer flex flex-col hover:scale-105`,
        className
      )}
      onClick={onClick}
    >
      <CardContent className={`${SPACING.COMPONENT.PADDING_MEDIUM} pb-0`}>
        <div className="relative aspect-square w-full rounded-lg overflow-hidden shadow-sm">
          <img
            src={imageUrl || "/imagenotfound.jpeg"}
            alt={imageAlt}
            className={GRID_CONFIGS.CARDS.IMAGE}
            loading="lazy"
          />
          <div className="absolute top-3 left-3">
            <Badge variant={badge.variant}>{badge.text}</Badge>
          </div>
        </div>
      </CardContent>

      <CardHeader
        className={`flex-1 flex flex-col justify-between ${SPACING.COMPONENT.PADDING_MEDIUM} items-center text-left`}
      >
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm w-full max-w-xs">
          {children}
        </div>
      </CardHeader>
    </Card>
  );
}
