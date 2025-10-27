import { useState, useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import "mapbox-gl/dist/mapbox-gl.css";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ImageUploader } from "@/components/common/ImageUploader";
import { supabase } from "@/services/supabaseClient";
import { showSuccess, showError } from "@/services/toastService";
import { Plus } from "lucide-react";
import { ModalDialog } from "@/components/modals/ModalDialog";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string;

export function NewSwapPointButton() {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const [data, setData] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    lat: 41.3874,
    lng: 2.1686,
    image_url: "",
  });

  // 🗺️ Inicializar mapa al abrir el modal
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => setReady(true), 150);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!ready || !mapContainerRef.current) return;

    // limpia el mapa anterior si existe
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [data.lng, data.lat],
      zoom: 12,
    });

    const marker = new mapboxgl.Marker({ color: "#16a34a", draggable: true })
      .setLngLat([data.lng, data.lat])
      .addTo(map);

    // 🔍 Geocoder (buscador)
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken!,
      mapboxgl: mapboxgl as any,
      marker: false,
      placeholder: "Search an address or place...",
      types: "address,place,locality,neighborhood",
      countries: "es",
      bbox: [2.05, 41.32, 2.23, 41.47],
      proximity: { longitude: 2.1734, latitude: 41.3851 },
      limit: 8,
      language: "es",
    });

    // Añadir buscador sobre el mapa
    const geocoderContainer = document.createElement("div");
    geocoderContainer.className = "geocoder-container";
    mapContainerRef.current.parentElement?.insertBefore(
      geocoderContainer,
      mapContainerRef.current
    );
    geocoder.addTo(geocoderContainer);

    // Selección desde el buscador
    geocoder.on("result", (e: any) => {
      const coords = e.result.center as [number, number];
      const place = e.result.place_name ?? "";
      const city =
        e.result.context?.find((c: any) => c.id.includes("place"))?.text ?? "";

      marker.setLngLat(coords).addTo(map);
      map.flyTo({ center: coords, zoom: 14 });

      setData((prev) => ({
        ...prev,
        address: place,
        city,
        lat: coords[1],
        lng: coords[0],
      }));
    });

    // 📍 Reverse geocode al arrastrar
    marker.on("dragend", async () => {
      const { lng, lat } = marker.getLngLat();
      try {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}&language=es`
        );
        const json = await res.json();
        const place = json.features?.[0]?.place_name ?? "";
        const city =
          json.features?.[0]?.context?.find((c: any) => c.id.includes("place"))
            ?.text ?? "";

        setData((prev) => ({ ...prev, lat, lng, address: place, city }));
      } catch (err) {
        console.error("Error getting address:", err);
        setData((prev) => ({ ...prev, lat, lng }));
      }
    });

    map.resize();
    mapRef.current = map;

    return () => {
      map.remove();
      geocoder.clear();
    };
  }, [ready]);

  // 🧹 Reset form
  const resetForm = () => {
    setData({
      name: "",
      description: "",
      address: "",
      city: "",
      lat: 41.3874,
      lng: 2.1686,
      image_url: "",
    });
    setReady(false);
  };

  // 🔄 Handle modal open/close
  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      resetForm();
    }
  };

  // 💾 Guardar en Supabase
  const handleSave = async () => {
    if (!data.name.trim()) {
      showError("Please enter a name for the swap point.");
      return;
    }

    try {
      setSaving(true);
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        showError("You must be logged in to add a swap point.");
        return;
      }

      const { error } = await supabase.from("swap_points").insert([data]);

      if (error) throw error;

      showSuccess("Swap point created successfully! 🌿");
      setOpen(false); // handleOpenChange will reset form
    } catch (err) {
      console.error("Error saving swap point:", err);
      showError("Error saving swap point. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-1 justify-center h-4 w-4" />
      </Button>

      <ModalDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="Add New Swap Point"
        description="Create a new location for plant exchanges in your community"
        onConfirm={handleSave}
        confirmLabel="Create Swap Point"
        loading={saving}
        loadingText="Creating..."
        size="xl"
      >
        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-3 mt-2">
            <div>
              <Label>Name</Label>
              <Input
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                placeholder="Community Garden"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Input
                value={data.description}
                onChange={(e) =>
                  setData({ ...data, description: e.target.value })
                }
                placeholder="A place to exchange plants"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Address</Label>
                <Input
                  value={data.address}
                  onChange={(e) =>
                    setData({ ...data, address: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>City</Label>
                <Input
                  value={data.city}
                  onChange={(e) => setData({ ...data, city: e.target.value })}
                />
              </div>
            </div>

            {/* 🗺️ Mapa compacto */}
            <div className="space-y-1">
              <Label>Location</Label>
              <div
                ref={mapContainerRef}
                className="w-full h-48 sm:h-56 mt-1 rounded-lg border border-border overflow-hidden"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Search or drag the marker to adjust location.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <p>Lat: {data.lat.toFixed(4)}</p>
              <p>Lng: {data.lng.toFixed(4)}</p>
            </div>

            {/* 📸 Subida de imagen */}
            <div>
              <ImageUploader
                bucket="swap_points"
                pathPrefix="user_uploads"
                onUpload={(url) =>
                  setData((prev) => ({ ...prev, image_url: url }))
                }
                label="Upload Image"
                currentUrl={data.image_url}
              />
            </div>
          </div>
        </ScrollArea>
      </ModalDialog>
    </>
  );
}
