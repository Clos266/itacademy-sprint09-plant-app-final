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
import { useNavigate } from "react-router-dom";
import { supabase } from "@/services/supabaseClient";
import { fetchUserById, updateUser } from "@/services/userService";
import { ImageUploader } from "@/components/common/ImageUploader";
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
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    username: "",
    ciudad: "",
    cp: "",
    avatar_url: "",
  });

  // 🔹 Load current profile with cleanup
  useEffect(() => {
    if (!open) return;

    let isMounted = true;

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!isMounted) return;

        if (!user) {
          setError("No user found");
          return;
        }

        const data = await fetchUserById(user.id);

        if (!isMounted) return;

        if (data) {
          setProfile(data);
          setForm({
            username: data.username || "",
            ciudad: data.ciudad || "",
            cp: data.cp || "",
            avatar_url: data.avatar_url || "",
          });
        } else {
          setError("Could not load profile");
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        if (isMounted) {
          setError("Failed to load profile");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [open]);

  // 🔹 Save changes
  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    setError(null);

    try {
      const updated = await updateUser(profile.id, form);
      setProfile(updated);
      onOpenChange(false);

      setTimeout(() => {
        navigate("/");
      }, 300);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err instanceof Error ? err.message : "Failed to save profile");
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 rounded-2xl">
        <DialogHeader>
          <DialogTitle>{loading ? "Loading" : "Edit profile"}</DialogTitle>
          <DialogDescription>
            {loading
              ? "Please wait while your data loads."
              : "Update your public information below."}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="text-center text-muted-foreground p-6">
            Loading profile...
          </div>
        ) : (
          <>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-4">
                {error}
              </div>
            )}

            <div className="flex flex-col items-center gap-3 mt-4 mb-6">
              <ImageUploader
                bucket="avatars"
                pathPrefix={profile?.id || ""}
                currentUrl={form.avatar_url}
                label="Change photo"
                onUpload={(url) => setForm({ ...form, avatar_url: url })}
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
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
                <div className="space-y-1">
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
                <div className="space-y-1">
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
                onClick={() => onOpenChange(false)}
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
