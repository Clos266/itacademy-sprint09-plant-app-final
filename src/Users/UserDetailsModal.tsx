import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Leaf } from "lucide-react";
import { supabase } from "@/services/supabaseClient";
import type { Database } from "@/types/supabase";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Plant = Database["public"]["Tables"]["plants"]["Row"];

interface UserDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
}

export function UserDetailsModal({
  open,
  onOpenChange,
  userId,
}: UserDetailsModalProps) {
  const [user, setUser] = useState<Profile | null>(null);
  const [userPlants, setUserPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch user + plants
  useEffect(() => {
    if (!userId || !open) return;

    const fetchUserData = async () => {
      setLoading(true);

      // 👤 Usuario
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (userError) {
        console.error("Error fetching user:", userError.message);
        setLoading(false);
        return;
      }

      setUser(userData);

      // 🌿 Plantas del usuario
      const { data: plantsData, error: plantsError } = await supabase
        .from("plants")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (plantsError) {
        console.error("Error fetching plants:", plantsError.message);
      } else {
        setUserPlants(plantsData || []);
      }

      setLoading(false);
    };

    fetchUserData();
  }, [userId, open]);

  if (!open || !userId) return null;

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="p-8 text-center text-muted-foreground">
            Cargando usuario...
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg p-0 overflow-hidden">
        <div className="flex flex-col p-5">
          {/* 👤 Avatar */}
          <div className="flex justify-center mb-5">
            <img
              src={user.avatar_url || "/imagenotfound.jpeg"}
              alt={user.username || "User"}
              className="w-24 h-24 rounded-full object-cover border border-border shadow-sm"
            />
          </div>

          {/* 🧾 Header */}
          <DialogHeader className="text-center space-y-1 mb-3">
            <DialogTitle className="text-2xl font-semibold">
              @{user.username || "usuario"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {user.email || "—"}
            </DialogDescription>
          </DialogHeader>

          {/* 📍 Location */}
          <div className="flex justify-center items-center gap-2 mb-4 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{user.ciudad || "Ubicación desconocida"}</span>
            {user.cp && <Badge variant="default">{user.cp}</Badge>}
          </div>

          {/* 🌿 Plantas del usuario */}
          {userPlants.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <Leaf className="w-4 h-4 text-primary" /> Plants
              </h3>
              <div className="flex flex-wrap gap-3">
                {userPlants.slice(0, 4).map((p) => (
                  <div
                    key={p.id}
                    className="flex flex-col items-center text-xs text-muted-foreground"
                  >
                    <img
                      src={p.image_url || "/imagenotfound.jpeg"}
                      alt={p.nombre_comun}
                      className="w-14 h-14 rounded-md object-cover border border-border cursor-pointer transition-transform hover:scale-105"
                    />
                    <span className="truncate max-w-[60px]">
                      {p.nombre_comun}
                    </span>
                  </div>
                ))}
              </div>
              {userPlants.length > 4 && (
                <p className="text-xs text-center text-muted-foreground mt-2">
                  +{userPlants.length - 4} more
                </p>
              )}
            </div>
          )}

          {/* 🔘 Actions */}
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button>Start Chat</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
