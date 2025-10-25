import type { Event } from "@/types/supabase";
import type { BaseModalProps } from "@/types/ui";

// ============================================================
// 📅 TIPOS ESPECÍFICOS PARA COMPONENTES DE EVENTOS
// ============================================================

export interface EventCardProps {
  event: Event;
  isSelected?: boolean;
  onSelect?: (eventId: number) => void;
}

export interface EventDetailsModalProps extends BaseModalProps {
  eventId: number | null;
}

export interface NewEventModalProps extends BaseModalProps {
  // Props adicionales si es necesario
}

// Tipos para formularios de eventos
export interface EventFormData {
  title: string;
  description: string;
  date: string;
  location: string;
  image_url: string;
}
