import type { ReactNode } from "react";

// ============================================================
// 🎨 TIPOS COMUNES DE UI Y COMPONENTES
// ============================================================

// Tipos base para modales
export interface BaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Props para componentes que pueden tener children
export interface WithChildren {
  children?: ReactNode;
}

// Props para componentes con className opcional
export interface WithClassName {
  className?: string;
}

// Props para componentes con loading state
export interface WithLoading {
  loading?: boolean;
}

// Props para componentes con disabled state
export interface WithDisabled {
  disabled?: boolean;
}

// Props para componentes de formulario
export interface FormFieldProps extends WithClassName {
  label?: string;
  error?: string;
  required?: boolean;
}

// Props para componentes de paginación
export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// Props para componentes de tabla
export interface TableColumn<T> {
  key: string;
  header: string | ReactNode;
  render: (item: T) => ReactNode;
}

export interface TableProps<T> extends PaginationProps {
  data: T[];
  columns: TableColumn<T>[];
}

// Props para componentes de cards paginados
export interface PaginatedCardsProps<T> extends PaginationProps {
  data: T[];
  renderCard: (item: T) => ReactNode;
  emptyMessage?: string;
}

// Props para componentes de filtrado
export interface FilterBarProps extends WithChildren {
  searchComponent?: ReactNode;
  filters?: ReactNode;
}

// Props para componentes de búsqueda
export interface SearchInputProps extends WithClassName {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
}

// Props para componentes de carga de imágenes
export interface ImageUploaderProps {
  bucket: string;
  pathPrefix?: string;
  onUpload: (url: string) => void;
  currentUrl?: string | null;
  label?: string;
}

// Props para componentes de imagen con fallback
export interface ImageWithFallbackProps extends WithClassName {
  src: string;
  alt: string;
  fallbackSrc?: string;
  onClick?: () => void;
}

// Variantes comunes de componentes
export type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";
export type ButtonSize = "default" | "sm" | "lg" | "icon";
export type BadgeVariant = "default" | "secondary" | "destructive" | "outline";
