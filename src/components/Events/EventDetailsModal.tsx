import { useEffect, useRef, useState } from "react";
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
import { CalendarDays, MapPin } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/services/supabaseClient";
import type { Database } from "@/types/supabase";
import { LoadingState } from "@/components/common/LoadingState";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string;

type EventRow = Database["public"]["Tables"]["events"]["Row"];
type SwapPointRow = Database["public"]["Tables"]["swap_points"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

interface EventDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: number | null;
}

type EventWithJoins = EventRow & {
  profiles?: ProfileRow | null; // organizer
  swap_points?: Pick<
    SwapPointRow,
    "id" | "name" | "address" | "city" | "lat" | "lng" | "image_url"
  > | null;
};

export function EventDetailsModal({
  open,
  onOpenChange,
  eventId,
}: EventDetailsModalProps) {
  const [event, setEvent] = useState<EventWithJoins | null>(null);
  const [loading, setLoading] = useState(true);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);

  // 🔹 Cargar evento + organizer + swap point
  useEffect(() => {
    if (!eventId || !open) return;

    const load = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("events")
          .select(
            `
            *,
            profiles(*),
            swap_points:swap_point_id (
              id, name, address, city, lat, lng, image_url
            )
          `
          )
          .eq("id", eventId)
          .single();

        if (error) throw error;
        setEvent(data as EventWithJoins);
      } catch (err) {
        console.error("Error loading event:", err);
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [eventId, open]);

  // 🗺️ Inicializar mapa (si hay swap point con coords)
  useEffect(() => {
    const sp = event?.swap_points;
    const canShowMap =
      !!sp && typeof sp.lat === "number" && typeof sp.lng === "number";

    if (!open || !mapContainerRef.current || !canShowMap) {
      // Limpieza si no procede mostrar mapa
      if (mapInstance.current) {
        try {
          mapInstance.current.remove();
        } catch (e) {
          console.warn("Map cleanup skipped:", e);
        } finally {
          mapInstance.current = null;
        }
      }
      return;
    }

    // 💡 eliminar mapa previo por si reabres el modal
    if (mapInstance.current) {
      try {
        mapInstance.current.remove();
      } catch (e) {
        console.warn("Map cleanup (pre-init) skipped:", e);
      } finally {
        mapInstance.current = null;
      }
    }

    // Asegura render del contenedor antes de instanciar
    const raf = requestAnimationFrame(() => {
      if (!mapContainerRef.current) return;

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [sp!.lng, sp!.lat],
        zoom: 13,
      });

      new mapboxgl.Marker({ color: "#16a34a" })
        .setLngLat([sp!.lng, sp!.lat])
        .addTo(map);

      mapInstance.current = map;
    });

    // ✅ cleanup robusto
    return () => {
      cancelAnimationFrame(raf);
      if (mapInstance.current) {
        try {
          mapInstance.current.remove();
        } catch (e) {
          console.warn("Map cleanup failed:", e);
        } finally {
          mapInstance.current = null;
        }
      }
    };
  }, [open, event?.swap_points?.lat, event?.swap_points?.lng]);

  if (!open || !eventId) return null;

  const isUpcoming = event?.date ? new Date(event.date) > new Date() : false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl w-[90%] sm:w-[600px] max-h-[90vh] overflow-hidden mx-auto rounded-2xl border p-0">
        {/* ♿️ Título/desc accesibles para lectores de pantalla */}
        <VisuallyHidden>
          <DialogTitle>Event Details</DialogTitle>
          <DialogDescription>
            Detailed information about this event and its location.
          </DialogDescription>
        </VisuallyHidden>

        <ScrollArea className="max-h-[85vh] p-4">
          {loading ? (
            <LoadingState className="p-6" />
          ) : !event ? (
            <div className="p-6 text-center text-destructive">
              Could not load this event.
            </div>
          ) : (
            <>
              {/* Header */}
              <DialogHeader className="flex flex-col items-center mb-4">
                <DialogTitle className="text-center">{event.title}</DialogTitle>
                <DialogDescription className="text-center">
                  {event.description || "No description available."}
                </DialogDescription>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant={isUpcoming ? "default" : "secondary"}>
                    {isUpcoming ? "Upcoming" : "Past"}
                  </Badge>
                  <span className="flex items-center text-sm text-muted-foreground">
                    <CalendarDays className="w-4 h-4 mr-1" />
                    {event.date
                      ? new Date(event.date).toLocaleDateString()
                      : "—"}
                  </span>
                </div>
              </DialogHeader>

              {/* Imagen del evento */}
              <div className="relative mx-auto aspect-square w-full max-w-[220px] rounded-xl overflow-hidden border border-border bg-muted">
                <img
                  src={event.image_url || "/imagenotfound.jpeg"}
                  alt={event.title}
                  className="object-cover w-full h-full"
                />
              </div>

              {/* Organizer + ubicación textual */}
              <div className="mt-4 text-sm text-muted-foreground space-y-2">
                {event.profiles && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                    <img
                      src={
                        event.profiles.avatar_url || "/avatar-placeholder.png"
                      }
                      alt={event.profiles.username || "User"}
                      className="w-9 h-9 rounded-full object-cover border border-border"
                    />
                    <div className="flex flex-col leading-tight">
                      <span className="font-medium text-foreground">
                        @{event.profiles.username || "user"}
                      </span>
                    </div>
                  </div>
                )}

                <p className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1 text-primary" />
                  {event.location}
                </p>

                {event.swap_points && (
                  <p className="text-xs">
                    <strong>Swap point:</strong> {event.swap_points.name} —{" "}
                    {event.swap_points.address}, {event.swap_points.city}
                  </p>
                )}
              </div>

              {/* Mapa (si hay swap point con coords) */}
              {event.swap_points &&
                typeof event.swap_points.lat === "number" &&
                typeof event.swap_points.lng === "number" && (
                  <div
                    ref={mapContainerRef}
                    className="w-full h-56 sm:h-64 mt-4 rounded-lg border border-border overflow-hidden"
                  />
                )}

              {/* Actions */}
              <DialogFooter className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
                {event.swap_points && (
                  <Button
                    onClick={() =>
                      window.open(
                        `https://www.google.com/maps?q=${
                          event.swap_points!.lat
                        },${event.swap_points!.lng}`,
                        "_blank"
                      )
                    }
                  >
                    Open in Maps
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
