import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/services/supabaseClient";
import { Upload, Image as ImageIcon } from "lucide-react";
import { LoadingState } from "@/components/common/LoadingState";

interface ImageUploaderProps {
  bucket: "avatars" | "plants" | "events" | "swap_points";
  pathPrefix?: string; // ej. userId o plantId
  onUpload: (publicUrl: string) => void;
  currentUrl?: string | null;
  label?: string;
}

export function ImageUploader({
  bucket,
  pathPrefix = "",
  onUpload,
  currentUrl,
  label = "Upload image",
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(true);

      // Generar un nombre único
      const fileExt = file.name.split(".").pop();
      const fileName = `${pathPrefix}-${Date.now()}.${fileExt}`;
      const filePath = `${pathPrefix ? `${pathPrefix}/` : ""}${fileName}`;

      // Subir al bucket
      const { error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { upsert: true });

      if (error) throw error;

      // Obtener URL pública
      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      setPreview(publicUrl);
      onUpload(publicUrl);
    } catch (err) {
      console.error("Error uploading file:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Vista previa */}
      <div className="w-32 h-32 rounded-lg overflow-hidden border border-border flex items-center justify-center bg-muted">
        {preview ? (
          <img
            src={preview}
            alt="Uploaded"
            className="object-cover w-full h-full"
          />
        ) : (
          <ImageIcon className="w-8 h-8 text-muted-foreground" />
        )}
      </div>

      {/* Botones */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-4 h-4 mr-2" /> {label}
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          capture="environment" // permite tomar foto con cámara en móvil
          onChange={handleFileChange}
        />
      </div>

      {uploading && <LoadingState size="sm" className="mt-1" />}
    </div>
  );
}
