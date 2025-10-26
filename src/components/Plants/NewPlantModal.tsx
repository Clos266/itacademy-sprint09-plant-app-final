import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModalDialog } from "@/components/modals/ModalDialog";
import { Plus } from "lucide-react";
import { plantSuggestions } from "@/data/plantSuggestions";
import { ImageUploader } from "@/components/common/ImageUploader";
import { supabase } from "@/services/supabaseClient";

export function NewPlantButton() {
  const [open, setOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filtered, setFiltered] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const [plantData, setPlantData] = useState({
    nombre_comun: "",
    nombre_cientifico: "",
    familia: "",
    especie: "",
    disponible: true,
    interval_days: 7,
    last_watered: new Date().toISOString(),
    image_url: "",
  });

  // 🔍 Autocompletado
  const handleCommonNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const results = Object.keys(plantSuggestions).filter((key) =>
      key.toLowerCase().startsWith(value.toLowerCase())
    );

    setFiltered(results.slice(0, 5));
    setShowSuggestions(value.length > 0);
    setPlantData((prev) => ({ ...prev, nombre_comun: value }));

    const suggestion = plantSuggestions[value.toLowerCase()];
    if (suggestion) {
      setPlantData((prev) => ({
        ...prev,
        nombre_cientifico: suggestion.nombre_cientifico,
        familia: suggestion.familia,
        especie: suggestion.especie,
      }));
    }
  };

  const handleSelectSuggestion = (key: string) => {
    const suggestion = plantSuggestions[key];
    setPlantData({
      ...plantData,
      nombre_comun: key,
      nombre_cientifico: suggestion.nombre_cientifico,
      familia: suggestion.familia,
      especie: suggestion.especie,
    });
    setShowSuggestions(false);
  };

  // 📸 Recibe URL pública al subir
  const handleImageUpload = (publicUrl: string) => {
    setPlantData((prev) => ({ ...prev, image_url: publicUrl }));
    setUploading(false);
  };

  // 💾 Guardar en Supabase
  const handleSave = async () => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return alert("Debes iniciar sesión");

      const { error } = await supabase.from("plants").insert([
        {
          ...plantData,
          user_id: user.id,
        },
      ]);

      if (error) throw error;
      console.log("Planta guardada:", plantData);
      setOpen(false);
    } catch (err) {
      console.error("Error al guardar planta:", err);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus />
      </Button>

      <ModalDialog
        open={open}
        onOpenChange={setOpen}
        title="Add New Plant"
        onConfirm={handleSave}
        loading={uploading}
        loadingText="Uploading..."
      >
        {/* 📏 Ajuste de ancho para que sea más estrecho en escritorio */}
        <div className="mx-auto max-w-md sm:max-w-lg lg:max-w-xl max-h-[64vh] overflow-y-auto p-0">
          {/* 📸 Plant Image */}
          <div>
            <ImageUploader
              bucket="plants"
              pathPrefix="user_uploads"
              onUpload={(publicUrl: string) => handleImageUpload(publicUrl)}
              label="Upload Image"
              currentUrl={plantData.image_url}
            />
          </div>
          {/* 🌿 Common Name */}
          <div className="relative">
            <label className="block text-sm font-medium mb-1">
              Common Name
            </label>
            <Input
              placeholder="e.g. Monstera"
              value={plantData.nombre_comun}
              onChange={handleCommonNameChange}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
              onFocus={() => {
                if (plantData.nombre_comun) setShowSuggestions(true);
              }}
            />
            {showSuggestions && filtered.length > 0 && (
              <ul className="absolute z-10 bg-background border rounded-md shadow-md mt-1 w-full max-h-40 overflow-auto">
                {filtered.map((key) => (
                  <li
                    key={key}
                    onMouseDown={() => handleSelectSuggestion(key)}
                    className="px-3 py-1 cursor-pointer hover:bg-accent"
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 🔬 Scientific Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Scientific Name
            </label>
            <Input
              placeholder="Auto-filled if known"
              value={plantData.nombre_cientifico}
              onChange={(e) =>
                setPlantData({
                  ...plantData,
                  nombre_cientifico: e.target.value,
                })
              }
            />
          </div>

          {/* 🧬 Species / Family */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Species</label>
              <Input
                value={plantData.especie}
                onChange={(e) =>
                  setPlantData({ ...plantData, especie: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Family</label>
              <Input
                value={plantData.familia}
                onChange={(e) =>
                  setPlantData({ ...plantData, familia: e.target.value })
                }
              />
            </div>
          </div>
        </div>
      </ModalDialog>
    </>
  );
}
