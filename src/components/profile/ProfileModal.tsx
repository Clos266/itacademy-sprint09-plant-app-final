import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ImageUploader } from "@/components/common/ImageUploader";
import { useState } from "react";
import { LoadingState } from "@/components/common/LoadingState";
import { ModalDialog } from "@/components/modals/ModalDialog";

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

  // Custom footer with profile-specific actions
  const customFooter = user && !loading && (
    <div className="flex justify-end gap-2">
      <Button variant="outline" onClick={() => onOpenChange(false)}>
        Close
      </Button>
      <Button>Start chat</Button>
    </div>
  );

  return (
    <ModalDialog
      open={open}
      onOpenChange={onOpenChange}
      title={user ? `@${user.username || "user"}` : "User Profile"}
      description={
        loading
          ? "Loading user profile..."
          : user?.email || "User profile information"
      }
      showFooter={false}
      size="md"
    >
      {loading ? (
        <LoadingState className="p-6" />
      ) : user ? (
        <div className="flex flex-col items-center space-y-4">
          <div className="flex flex-col items-center mb-5">
            <Avatar className="w-24 h-24 mb-3">
              <AvatarImage
                src={uploadedImage || user.avatar_url || "/imagenotfound.jpeg"}
                alt={user.username || "User"}
              />
              <AvatarFallback>
                {user.username ? user.username[0]?.toUpperCase() : "?"}
              </AvatarFallback>
            </Avatar>

            <ImageUploader
              bucket="avatars"
              pathPrefix={user.id}
              currentUrl={user.avatar_url}
              onUpload={(url) => setUploadedImage(url)}
              label="Change photo"
            />
          </div>

          <div className="flex justify-center items-center gap-2 text-sm text-muted-foreground mb-6">
            <MapPin className="w-4 h-4" />
            <span>{user.ciudad || "Unknown location"}</span>
            {user.cp && <Badge variant="secondary">{user.cp}</Badge>}
          </div>
        </div>
      ) : (
        <div className="text-center text-muted-foreground p-6">
          User not found.
        </div>
      )}

      {customFooter}
    </ModalDialog>
  );
}
