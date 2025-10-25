import type { Profile } from "@/types/supabase";
import type { BaseModalProps } from "@/types/ui";

// ============================================================
// 👤 TIPOS ESPECÍFICOS PARA COMPONENTES DE PERFIL
// ============================================================

export interface ProfileModalProps extends BaseModalProps {
  userId: string | null;
}

export interface EditProfileModalProps extends BaseModalProps {
  // Sin props adicionales por ahora
}

export interface UserDetailsModalProps extends BaseModalProps {
  userId: string | null;
}

// Tipos para formularios de perfil
export interface ProfileFormData {
  username: string;
  ciudad: string;
  cp: string;
  avatar_url: string;
}
