import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/services/supabaseClient";
import { fetchUserById, updateUser } from "@/services/userService";
import { ImageUploader } from "@/components/common/ImageUploader";
import { showSuccess, showError } from "@/services/toastService"; // ✅ añadimos esto
import type { Database } from "@/types/supabase";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProfileModal({
  open,
  onOpenChange,
}: EditProfileModalProps) {
  const [form, setForm] = useState({
    username: "",
    ciudad: "",
    cp: "",
    avatar_url: "",
  });
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // 🔹 Load current profile
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        setLoading(true);
        const { data } = await supabase.auth.getUser();
        const user = data.user;
        if (!user) return;

        const userData = await fetchUserById(user.id);
        if (userData) {
          setProfile(userData);
          setForm({
            username: userData.username || "",
            ciudad: userData.ciudad || "",
            cp: userData.cp || "",
            avatar_url: userData.avatar_url || "",
          });
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        showError("Could not load profile data.");
      } finally {
        setLoading(false);
      }
    })();
  }, [open]);

  // 🔹 Save profile
  const handleSave = async () => {
    if (!profile) return;
    try {
      setSaving(true);
      await updateUser(profile.id, form);
      showSuccess("Profile updated successfully!");
      onOpenChange(false); // Realtime actualiza el resto automáticamente
    } catch (err) {
      console.error("Error updating profile:", err);
      showError(
        err instanceof Error ? err.message : "Failed to save profile changes."
      );
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 rounded-2xl">
        <DialogHeader>
          <DialogTitle>{loading ? "Loading..." : "Edit profile"}</DialogTitle>
          <DialogDescription>
            {loading
              ? "Please wait while we load your data."
              : "Update your public information below."}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className="text-center text-muted-foreground py-6">
            Loading profile...
          </p>
        ) : (
          <>
            <div className="flex flex-col items-center gap-3 mt-4 mb-6">
              <ImageUploader
                bucket="avatars"
                pathPrefix={profile?.id || ""}
                currentUrl={form.avatar_url}
                label="Change photo"
                onUpload={(url) => {
                  setForm({ ...form, avatar_url: url });
                  showSuccess("Profile photo updated!");
                }}
              />
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                  disabled={saving}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="ciudad">City</Label>
                  <Input
                    id="ciudad"
                    value={form.ciudad}
                    onChange={(e) =>
                      setForm({ ...form, ciudad: e.target.value })
                    }
                    disabled={saving}
                  />
                </div>
                <div>
                  <Label htmlFor="cp">Postal Code</Label>
                  <Input
                    id="cp"
                    value={form.cp}
                    onChange={(e) => setForm({ ...form, cp: e.target.value })}
                    disabled={saving}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  showError("Edit cancelled");
                }}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
