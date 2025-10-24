import { useEffect, useState, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, CalendarDays } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Database } from "@/types/supabase";
import { supabase } from "@/services/supabaseClient";

// 🗺️ Token Mapbox desde tus variables de entorno
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string;

type Event = Database["public"]["Tables"]["events"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type SwapPoint = Database["public"]["Tables"]["swap_points"]["Row"];

interface EventDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: number | null;
}

export function EventDetailsModal({
  open,
  onOpenChange,
  eventId,
}: EventDetailsModalProps) {
  const [event, setEvent] = useState<
    | (Event & { profile?: Profile | null; swap_points?: SwapPoint | null })
    | null
  >(null);
  const [loading, setLoading] = useState(true);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);

  // 🔹 Cargar evento + organizador + punto de intercambio
  useEffect(() => {
    if (!eventId || !open) return;

    const loadEvent = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*, profiles(*), swap_points(*)")
          .eq("id", eventId)
          .single();

        if (error) throw error;
        setEvent(data);
      } catch (err) {
        console.error("Error loading event:", err);
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [eventId, open]);

  // 🗺️ Inicializar mapa si el evento tiene swap_point
  useEffect(() => {
    if (!event?.swap_points || !open || !mapContainerRef.current) return;

    const point = event.swap_points;

    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [point.lng, point.lat],
      zoom: 13,
    });

    new mapboxgl.Marker({ color: "#16a34a" })
      .setLngLat([point.lng, point.lat])
      .addTo(map);

    mapInstance.current = map;

    return () => map.remove();
  }, [event, open]);

  if (!open || !eventId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-xl w-[90%] sm:w-[600px] max-h-[90vh] overflow-hidden mx-auto rounded-2xl border p-0"
        style={{ overflow: "visible" }}
      >
        {/* ♿️ Accesibilidad */}
        <VisuallyHidden>
          <DialogTitle>Event Details</DialogTitle>
          <DialogDescription>
            Detailed information about the selected event, including its swap
            point and organizer.
          </DialogDescription>
        </VisuallyHidden>

        <ScrollArea className="max-h-[85vh] p-4">
          {loading ? (
            <div className="p-6 text-center text-muted-foreground">
              Loading...
            </div>
          ) : !event ? (
            <div className="p-6 text-center text-destructive">
              Could not load this event.
            </div>
          ) : (
            <>
              {/* 🪴 Header */}
              <DialogHeader className="flex flex-col items-center mb-4">
                <DialogTitle>{event.title}</DialogTitle>
                <DialogDescription className="text-center">
                  {event.description || "No description available."}
                </DialogDescription>
                <Badge
                  className="mt-2"
                  variant={
                    new Date(event.date) > new Date() ? "default" : "secondary"
                  }
                >
                  {new Date(event.date) > new Date() ? "Upcoming" : "Past"}
                </Badge>
              </DialogHeader>

              {/* 🖼️ Imagen */}
              <div className="relative mx-auto aspect-square w-full max-w-[220px] rounded-xl overflow-hidden border border-border bg-muted">
                <img
                  src={event.image_url || "/imagenotfound.jpeg"}
                  alt={event.title}
                  className="object-cover w-full h-full"
                />
              </div>

              {/* 📍 Info principal */}
              <div className="mt-4 text-sm text-muted-foreground space-y-2">
                <p className="flex items-center">
                  <CalendarDays className="w-4 h-4 mr-1 text-primary" />
                  {new Date(event.date).toLocaleDateString()}
                </p>

                {event.swap_points ? (
                  <>
                    <p className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1 text-primary" />
                      {event.swap_points.name} — {event.swap_points.address},{" "}
                      {event.swap_points.city}
                    </p>
                    <p>
                      <strong>Coordinates:</strong>{" "}
                      {event.swap_points.lat.toFixed(4)},{" "}
                      {event.swap_points.lng.toFixed(4)}
                    </p>
                  </>
                ) : (
                  <p className="text-muted-foreground italic">
                    No swap point assigned to this event.
                  </p>
                )}
              </div>

              {/* 🗺️ Mapa si hay punto */}
              {event.swap_points && (
                <div
                  ref={mapContainerRef}
                  className="w-full h-56 sm:h-64 mt-4 rounded-lg border border-border overflow-hidden"
                />
              )}

              {/* 👤 Organizer */}
              {event.profile && (
                <div className="flex items-center gap-3 p-3 mt-4 rounded-lg bg-muted/50 border border-border">
                  <img
                    src={event.profile.avatar_url || "/avatar-placeholder.png"}
                    alt={event.profile.username || "User"}
                    className="w-9 h-9 rounded-full object-cover border border-border"
                  />
                  <div className="flex flex-col leading-tight">
                    <span className="font-medium text-foreground">
                      @{event.profile.username || "user"}
                    </span>
                    {event.profile.ciudad && (
                      <span className="text-xs text-muted-foreground flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {event.profile.ciudad}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* 🔘 Actions */}
              <DialogFooter className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
                <Button>Join Event</Button>
              </DialogFooter>
            </>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
