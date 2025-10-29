import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Leaf } from "lucide-react";
import { supabase } from "@/services/supabaseClient";
import type { Database } from "@/types/supabase";
import { LoadingState } from "@/components/common/LoadingState";

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
          <LoadingState className="p-8" />
        </DialogContent>
      </Dialog>
    );
  }

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full mx-auto">
        <div className="flex flex-col items-center space-y-6 p-2">
          {/* 👤 Avatar */}
          <div className="flex justify-center">
            <img
              src={user.avatar_url || "/imagenotfound.jpeg"}
              alt={user.username || "User"}
              className="w-24 h-24 rounded-full object-cover border border-border shadow-sm"
            />
          </div>

          {/* 🧾 Header */}
          <DialogHeader className="text-center space-y-2">
            <DialogTitle className="text-2xl font-semibold">
              @{user.username || "usuario"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground flex items-center justify-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{user.ciudad || "Ubicación desconocida"}</span>
            </DialogDescription>
          </DialogHeader>

          {/* 🌿 Plantas del usuario */}
          {userPlants.length > 0 && (
            <div className="w-full">
              <h3 className="font-medium text-foreground mb-3 flex items-center justify-center gap-2">
                <Leaf className="w-4 h-4 text-primary" />
                Plants ({userPlants.length})
              </h3>
              <div className="flex justify-center">
                <div className="grid grid-cols-4 gap-3 max-w-xs">
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
                      <span className="truncate max-w-[60px] text-center mt-1">
                        {p.nombre_comun}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 🔘 Actions */}
          <div className="flex justify-center w-full">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
