import { MapPin, CalendarDays } from "lucide-react";
import { BaseCard } from "./BaseCard";
import { CardField } from "./CardField";
import { IconField } from "./IconField";
import type { Database } from "@/types/supabase";

type Event = Database["public"]["Tables"]["events"]["Row"];

interface EventCardProps {
  event: Event;
  onClick: (id: number) => void;
}

export function EventCard({ event, onClick }: EventCardProps) {
  const isUpcoming = new Date(event.date) > new Date();

  return (
    <BaseCard
      imageUrl={event.image_url || undefined}
      imageAlt={event.title}
      badge={{
        variant: isUpcoming ? "default" : "secondary",
        text: isUpcoming ? "Upcoming" : "Past",
      }}
      onClick={() => onClick(event.id)}
    >
      <CardField label="Event" value={event.title} span="col-span-2" />

      <CardField
        label="Description"
        value={
          <p className="text-sm text-muted-foreground line-clamp-2">
            {event.description || "-"}
          </p>
        }
        span="col-span-2"
        valueClassName="font-normal"
      />

      <IconField icon={MapPin} text={event.location} />

      <IconField
        icon={CalendarDays}
        text={new Date(event.date).toLocaleDateString()}
      />
    </BaseCard>
  );
}
