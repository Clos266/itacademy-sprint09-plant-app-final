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
import type { User } from "@/data/mockUsers";
import { mockPlants } from "@/data/mockPlants";

interface UserDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export function UserDetailsModal({
  open,
  onOpenChange,
  user,
}: UserDetailsModalProps) {
  if (!user) return null;

  const userPlants = mockPlants.filter((p) => p.user_id === user.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg p-0 overflow-hidden">
        <div className="flex flex-col p-5">
          {/* 👤 Avatar */}
          <div className="flex justify-center mb-5">
            <img
              src={user.avatar_url || "/public/imagenotfound.jpeg"}
              alt={user.username}
              className="w-24 h-24 rounded-full object-cover border border-border shadow-sm"
            />
          </div>

          {/* 🧾 Header */}
          <DialogHeader className="text-center space-y-1 mb-3">
            <DialogTitle className="text-2xl font-semibold">
              {user.name || `@${user.username}`}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              @{user.username}
            </DialogDescription>
          </DialogHeader>

          {/* 📍 Location & badges */}
          <div className="flex justify-center items-center gap-2 mb-4 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{user.city || "Unknown location"}</span>
            {user.isVerified && <Badge variant="default">Verified</Badge>}
          </div>

          {/* 💬 Bio */}
          {user.bio && (
            <p className="text-sm text-muted-foreground text-center mb-4 leading-relaxed">
              {user.bio}
            </p>
          )}

          {/* 🌿 User’s plants */}
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
                      src={p.image_url || "/public/imagenotfound.jpeg"}
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
