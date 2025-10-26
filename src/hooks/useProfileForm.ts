import { useState, useCallback } from "react";
import { showError } from "@/services/toastService";

// TODO: Replace with Zod schema when integrating validation
// TODO: Add advanced validation rules (email format, postal code patterns, etc.)
// TODO: Consider adding debounced validation for real-time feedback
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

  // Optimized field handlers - prevent unnecessary re-renders
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

  // Generic field updater for programmatic changes
  const updateField = useCallback(
    (field: keyof ProfileFormData, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Reset form to initial or provided data
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

  // Unified save handler with validation
  const handleSave = useCallback(async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      // Prepare clean form data (trim strings, convert empty to null)
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

  // Computed values
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
    // Form state
    form,
    saving,
    isValid,
    isFormDirty,

    // Field handlers
    handleUsernameChange,
    handleCiudadChange,
    handleCpChange,
    handleImageUpload,

    // Utility functions
    updateField,
    resetForm,
    handleSave,
    validateForm,
  };
}

/*
  TODO: Future enhancements for useProfileForm hook:
  
  1. Zod schema integration:
     - Replace ProfileFormData interface with inferred Zod type
     - Add comprehensive validation rules (email format, postal code patterns)
     - Support for real-time validation feedback
     - Custom validation messages per field
     
  2. Advanced features:
     - Debounced validation for better UX
     - Field-level error tracking and display
     - Auto-save functionality with conflict resolution
     - Form state persistence (localStorage/sessionStorage)
     - Undo/redo capabilities
     
  3. Accessibility improvements:
     - ARIA attributes for validation messages
     - Screen reader announcements for form state changes
     - Keyboard navigation enhancements
     
  4. Performance optimizations:
     - Selective field update subscriptions
     - Virtualized form rendering for large forms
     - Background validation with web workers
     
  5. Integration enhancements:
     - Support for multiple form modes (create, edit, view)
     - Integration with React Hook Form or Formik if needed
     - Server-side validation integration
     - Real-time collaborative editing features
*/
