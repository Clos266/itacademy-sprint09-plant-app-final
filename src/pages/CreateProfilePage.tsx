import { useState, useEffect } from "react";
import { supabase } from "@/services/supabaseClient";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { showSuccess, showError } from "@/services/toastService";
import { useNavigate } from "react-router-dom";

export default function CreateProfilePage() {
  const [form, setForm] = useState({
    username: "",
    ciudad: "",
    cp: "",
  });
  const [user, setUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        showError("No active session");
        navigate("/login");
        return;
      }
      setUser(data.user);
    })();
  }, []);

  const handleSave = async () => {
    if (!user) return;
    if (!form.username.trim()) {
      showError("Please enter a username");
      return;
    }

    try {
      setSaving(true);
      const { error } = await supabase.from("profiles").insert({
        id: user.id,
        email: user.email,
        username: form.username,
        ciudad: form.ciudad,
        cp: form.cp,
      });

      if (error) throw error;
      showSuccess("Profile created!");
      navigate("/plants");
    } catch (err: any) {
      showError(err.message || "Failed to create profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="max-w-md w-full bg-white dark:bg-card p-6 rounded-2xl shadow">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Create your profile 🌿
        </h2>

        <div className="space-y-4">
          <div>
            <Label>Username</Label>
            <Input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </div>

          <div>
            <Label>City</Label>
            <Input
              value={form.ciudad}
              onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
            />
          </div>

          <div>
            <Label>Postal Code</Label>
            <Input
              value={form.cp}
              onChange={(e) => setForm({ ...form, cp: e.target.value })}
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full mt-4"
          >
            {saving ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </div>
    </div>
  );
}
