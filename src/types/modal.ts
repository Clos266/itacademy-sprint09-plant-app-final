import type { ReactNode } from "react";
import type { BaseModalProps, WithLoading } from "./ui";

// ============================================================
// 🪟 TIPOS ESPECÍFICOS PARA MODALES
// ============================================================

export interface ModalDialogProps extends BaseModalProps, WithLoading {
  title: string;
  description?: string;
  children: ReactNode;
  onConfirm?: () => void | Promise<void>;
  confirmLabel?: string;
  cancelLabel?: string;
}

export interface ConfirmationModalProps extends BaseModalProps {
  title: string;
  description: string;
  onConfirm: () => void | Promise<void>;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
}
