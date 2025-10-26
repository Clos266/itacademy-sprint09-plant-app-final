import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ImageUploader } from "@/components/common/ImageUploader"; // 👈 new generic uploader
import { useState } from "react";
import { LoadingState } from "@/components/common/LoadingState";

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
}

export function ProfileModal({
  open,
  onOpenChange,
  userId,
}: ProfileModalProps) {
  const { user, loading } = useUserProfile(userId, open);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  if (!open || !userId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 rounded-2xl overflow-hidden">
        {loading ? (
          <LoadingState className="p-6" />
        ) : user ? (
          <>
            <DialogHeader className="text-center space-y-1 mb-4">
              <DialogTitle className="text-2xl font-semibold">
                @{user.username || "user"}
              </DialogTitle>
              <DialogDescription>{user.email}</DialogDescription>
            </DialogHeader>

            {/* 👤 Avatar and uploader */}
            <div className="flex flex-col items-center mb-5">
              <Avatar className="w-24 h-24 mb-3">
                <AvatarImage
                  src={
                    uploadedImage || user.avatar_url || "/imagenotfound.jpeg"
                  }
                  alt={user.username || "User"}
                />
                <AvatarFallback>
                  {user.username ? user.username[0]?.toUpperCase() : "?"}
                </AvatarFallback>
              </Avatar>

              {/* 🔹 Reusable image uploader */}
              <ImageUploader
                bucket="avatars"
                pathPrefix={user.id}
                currentUrl={user.avatar_url}
                onUpload={(url) => setUploadedImage(url)}
                label="Change photo"
              />
            </div>

            {/* 📍 Location */}
            <div className="flex justify-center items-center gap-2 text-sm text-muted-foreground mb-6">
              <MapPin className="w-4 h-4" />
              <span>{user.ciudad || "Unknown location"}</span>
              {user.cp && <Badge variant="secondary">{user.cp}</Badge>}
            </div>

            {/* 🔘 Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button>Start chat</Button>
            </div>
          </>
        ) : (
          <div className="text-center text-muted-foreground p-6">
            User not found.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
