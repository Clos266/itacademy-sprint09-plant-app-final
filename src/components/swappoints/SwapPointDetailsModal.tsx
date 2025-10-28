import { useEffect, useState, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import type { Database } from "@/types/supabase";
import { supabase } from "@/services/supabaseClient";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LoadingState } from "@/components/common/LoadingState";
import { ModalDialog } from "@/components/modals/ModalDialog";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string;

type SwapPoint = Database["public"]["Tables"]["swap_points"]["Row"];

interface SwapPointDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  swapPointId: number | null;
}

export function SwapPointDetailsModal({
  open,
  onOpenChange,
  swapPointId,
}: SwapPointDetailsModalProps) {
  const [point, setPoint] = useState<SwapPoint | null>(null);
  const [loading, setLoading] = useState(true);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);

  // 🔹 Cargar datos
  useEffect(() => {
    if (!swapPointId || !open) return;

    const loadPoint = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("swap_points")
          .select("*")
          .eq("id", swapPointId)
          .single();

        if (error) throw error;
        setPoint(data);
      } catch (err) {
        console.error("Error loading swap point:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPoint();
  }, [swapPointId, open]);

  useEffect(() => {
    if (!point || !open || !mapContainerRef.current) return;

    if (mapInstance.current) {
      try {
        mapInstance.current.remove();
      } catch (err) {
        console.warn("Map cleanup skipped:", err);
      }
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

    return () => {
      if (mapInstance.current) {
        try {
          mapInstance.current.remove();
        } catch (err) {
          console.warn("Map cleanup failed:", err);
        } finally {
          mapInstance.current = null;
        }
      }
    };
  }, [point, open]);

  if (!open || !swapPointId) return null;

  const customFooter = point && !loading && (
    <div className="flex justify-end gap-2">
      <Button variant="outline" onClick={() => onOpenChange(false)}>
        Close
      </Button>
      <Button
        onClick={() =>
          window.open(
            `https://www.google.com/maps?q=${point.lat},${point.lng}`,
            "_blank"
          )
        }
      >
        Open in Maps
      </Button>
    </div>
  );

  return (
    <ModalDialog
      open={open}
      onOpenChange={onOpenChange}
      title={point?.name || "Swap Point Details"}
      description={
        loading
          ? "Loading swap point details..."
          : point?.description ||
            "Detailed information about the selected swap point, including location and image."
      }
      showFooter={false}
      size="xl"
    >
      <ScrollArea className="max-h-[70vh]">
        {loading ? (
          <LoadingState className="p-6" />
        ) : !point ? (
          <div className="p-6 text-center text-destructive">
            Could not load this swap point.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col items-center mb-4">
              <Badge className="mt-2" variant="default">
                Swap Point
              </Badge>
            </div>

            <div className="relative mx-auto aspect-square w-full max-w-[220px] rounded-xl overflow-hidden border border-border bg-muted">
              <img
                src={point.image_url || "/imagenotfound.jpeg"}
                alt={point.name}
                className="object-cover w-full h-full"
              />
            </div>

            <div className="mt-4 text-sm text-muted-foreground space-y-1">
              <p className="flex items-center">
                <MapPin className="w-4 h-4 mr-1 text-primary" />
                {point.address}, {point.city}
              </p>
              <p>
                <strong>Coordinates:</strong> {point.lat.toFixed(4)},{" "}
                {point.lng.toFixed(4)}
              </p>
            </div>

            <div
              ref={mapContainerRef}
              className="w-full h-56 sm:h-64 mt-4 rounded-lg border border-border overflow-hidden"
            />
          </div>
        )}
      </ScrollArea>

      {customFooter}
    </ModalDialog>
  );
}
