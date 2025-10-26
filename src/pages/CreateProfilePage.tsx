import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/services/supabaseClient";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { showSuccess, showError } from "@/services/toastService";
import { useNavigate } from "react-router-dom";
import type { User } from "@supabase/supabase-js";

// TODO: Extract to useProfileForm hook - form state management and validation
interface ProfileFormData {
  username: string;
  ciudad: string;
  cp: string;
}

export default function CreateProfilePage() {
  const [form, setForm] = useState<ProfileFormData>({
    username: "",
    ciudad: "",
    cp: "",
  });
  const [user, setUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  // TODO: Extract to useAuth hook - authentication state management
  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();

        if (error) {
          console.error("Error getting user:", error);
          showError("Authentication error");
          navigate("/login");
          return;
        }

        if (!data.user) {
          showError("No active session");
          navigate("/login");
          return;
        }

        setUser(data.user);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown authentication error";
        console.error("Error loading user:", err);
        showError(errorMessage);
        navigate("/login");
      }
    };

    loadUser();
  }, [navigate]);

  // TODO: Extract to useProfileForm hook - form validation and submission logic
  const handleSave = useCallback(async () => {
    if (!user) {
      showError("User not authenticated");
      return;
    }

    // TODO: Replace with Zod validation when integrating schema validation
    if (!form.username.trim()) {
      showError("Please enter a username");
      return;
    }

    try {
      setSaving(true);

      // TODO: Extract to useProfileForm hook - Supabase profile creation logic
      // Using upsert instead of insert to handle cases where the profile already exists
      // (database trigger on_auth_user_created may have already created a basic profile)
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email,
        username: form.username.trim(),
        ciudad: form.ciudad.trim() || null,
        cp: form.cp.trim() || null,
      });

      if (error) throw error;

      showSuccess("Profile created!");
      navigate("/plants");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create profile";
      console.error("Error creating profile:", err);
      showError(errorMessage);
    } finally {
      setSaving(false);
    }
  }, [user, form, navigate]);

  // TODO: Extract to useProfileForm hook - optimized form field handlers
  const handleUsernameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, username: e.target.value }));
    },
    []
  );

  const handleCiudadChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, ciudad: e.target.value }));
    },
    []
  );

  const handleCpChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, cp: e.target.value }));
    },
    []
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="max-w-md w-full bg-white dark:bg-card p-6 rounded-2xl shadow">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Create your profile
        </h2>

        <div className="space-y-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={form.username}
              onChange={handleUsernameChange}
              placeholder="Enter your username"
              disabled={saving}
              required
            />
          </div>

          <div>
            <Label htmlFor="ciudad">City</Label>
            <Input
              id="ciudad"
              type="text"
              value={form.ciudad}
              onChange={handleCiudadChange}
              placeholder="Enter your city (optional)"
              disabled={saving}
            />
          </div>

          <div>
            <Label htmlFor="cp">Postal Code</Label>
            <Input
              id="cp"
              type="text"
              value={form.cp}
              onChange={handleCpChange}
              placeholder="Enter postal code (optional)"
              disabled={saving}
              maxLength={5}
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={saving || !form.username.trim()}
            className="w-full mt-4"
          >
            {saving ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/*
  TODO: Refactoring opportunities identified:
  
  1. useProfileForm hook extraction:
     - Form state management (ProfileFormData)
     - Optimized field handlers (handleUsernameChange, handleCiudadChange, handleCpChange)
     - Form validation logic (currently basic, ready for Zod integration)
     - Form submission logic (handleSave with Supabase integration)
     
  2. useAuth hook extraction:
     - User authentication state management
     - Session validation and error handling
     - Navigation logic for unauthenticated users
     
  3. Zod schema integration ready:
     - ProfileFormData interface can be replaced with inferred Zod type
     - Basic validation is isolated and ready for schema replacement
     - Error handling structure supports detailed validation messages
     
  4. Service layer improvements:
     - Direct Supabase calls can be replaced with userService.createUserProfile
     - Error handling is standardized for service integration
     
  Current improvements implemented:
  - ✅ Full TypeScript typing (User, ProfileFormData)
  - ✅ Optimized handlers with useCallback
  - ✅ Enhanced error handling with proper type guards
  - ✅ Improved form UX (placeholders, disabled states, validation)
  - ✅ Better accessibility (htmlFor, required, maxLength)
  - ✅ Performance optimization (no inline objects or functions)
*/
