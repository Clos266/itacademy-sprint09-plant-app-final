import { useState, useCallback } from "react";
import { showError } from "@/services/toastService";

export interface ProfileFormData {
  username: string;
  ciudad: string;
  cp: string;
  avatar_url?: string;
}

interface UseProfileFormOptions {
  initialData?: Partial<ProfileFormData>;
  onSave: (formData: ProfileFormData) => Promise<void>;
}

export function useProfileForm({
  initialData = {},
  onSave,
}: UseProfileFormOptions) {
  const [form, setForm] = useState<ProfileFormData>({
    username: initialData.username || "",
    ciudad: initialData.ciudad || "",
    cp: initialData.cp || "",
    avatar_url: initialData.avatar_url || "",
  });
  const [saving, setSaving] = useState(false);

  // TODO: Extract validation logic when integrating Zod schema
  const validateForm = useCallback(() => {
    if (!form.username.trim()) {
      showError("Please enter a username");
      return false;
    }
    return true;
  }, [form.username]);

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

  const handleImageUpload = useCallback((url: string) => {
    setForm((prev) => ({ ...prev, avatar_url: url }));
  }, []);

  const updateField = useCallback(
    (field: keyof ProfileFormData, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const resetForm = useCallback(
    (newData?: Partial<ProfileFormData>) => {
      const dataToUse = newData || initialData;
      setForm({
        username: dataToUse.username || "",
        ciudad: dataToUse.ciudad || "",
        cp: dataToUse.cp || "",
        avatar_url: dataToUse.avatar_url || "",
      });
    },
    [initialData]
  );

  const handleSave = useCallback(async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      const cleanFormData: ProfileFormData = {
        username: form.username.trim(),
        ciudad: form.ciudad.trim() || "",
        cp: form.cp.trim() || "",
        avatar_url: form.avatar_url?.trim() || "",
      };

      await onSave(cleanFormData);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save profile";
      console.error("Error saving profile:", err);
      showError(errorMessage);
    } finally {
      setSaving(false);
    }
  }, [form, validateForm, onSave]);

  const isValid = form.username.trim().length > 0;
  const isFormDirty =
    JSON.stringify(form) !==
    JSON.stringify({
      username: initialData.username || "",
      ciudad: initialData.ciudad || "",
      cp: initialData.cp || "",
      avatar_url: initialData.avatar_url || "",
    });

  return {
    form,
    saving,
    isValid,
    isFormDirty,

    handleUsernameChange,
    handleCiudadChange,
    handleCpChange,
    handleImageUpload,

    updateField,
    resetForm,
    handleSave,
    validateForm,
  };
}
