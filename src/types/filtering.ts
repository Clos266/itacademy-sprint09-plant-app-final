/**
 * 🔍 TypeScript definitions for the unified filtering system
 *
 * Provides type safety and intellisense support for filtering
 * components, hooks, and configurations across the application.
 */

import type {
  AVAILABILITY_FILTERS,
  EVENT_DATE_FILTERS,
  SWAP_STATUS_FILTERS,
  SORT_DIRECTIONS,
} from "@/constants/filters";

// 🏷️ Base filter types derived from constants
export type AvailabilityFilter = (typeof AVAILABILITY_FILTERS)[number];
export type EventDateFilter = (typeof EVENT_DATE_FILTERS)[number];
export type SwapStatusFilter = (typeof SWAP_STATUS_FILTERS)[number];
export type SortDirection = (typeof SORT_DIRECTIONS)[number];

// 🎛️ Filter input types for different UI components
export type FilterInputType =
  | "text" // SearchInput component
  | "status" // Single-select filter buttons
  | "multiStatus" // Multi-select toggle buttons
  | "date" // Date-based filtering (upcoming/past)
  | "sort" // Sortable column headers
  | "tab" // Tab-based content switching
  | "custom"; // Custom filter implementation

// ⚙️ Individual filter configuration
export interface FilterConfig {
  /** Unique identifier for the filter */
  key: string;

  /** Type of filter input UI */
  type: FilterInputType;

  /** Display label for the filter */
  label?: string;

  /** Placeholder text for text inputs */
  placeholder?: string;

  /** Available options for status/multiStatus filters */
  options?: readonly string[];

  /** Whether multiple values can be selected */
  multiple?: boolean;

  /** Default value for the filter */
  defaultValue?: any;

  /** Custom validation function */
  validate?: (value: any) => boolean;

  /** Custom filter function for complex logic */
  filterFn?: (item: any, value: any) => boolean;
}

// 🗂️ Complete filtering configuration for a page/component
export interface FilteringConfig<T = any> {
  /** Fields to search in for text filtering */
  searchFields?: (keyof T)[];

  /** Field to use for status filtering */
  statusField?: keyof T;

  /** Field to use for date-based filtering */
  dateField?: keyof T;

  /** Individual filter configurations */
  filters?: FilterConfig[];

  /** Custom filter functions that don't fit standard patterns */
  customFilters?: Record<string, (item: T, value: any) => boolean>;

  /** Default sort field and direction */
  defaultSort?: {
    field: keyof T;
    direction: SortDirection;
  };

  /** Fields that can be sorted */
  sortableFields?: (keyof T)[];
}

// 📊 Filter state management types
export interface FilterState {
  /** Text search query */
  search: string;

  /** Single status selection */
  status: string;

  /** Multiple status selections */
  multiStatus: string[];

  /** Date-based filter value */
  date: string;

  /** Sort configuration */
  sort: {
    field: string;
    direction: SortDirection;
  };

  /** Tab selection for tabbed interfaces */
  tab: string;

  /** Custom filter values */
  custom: Record<string, any>;
}

// 🎣 Hook return types
export interface UseFilteringReturn<T> {
  /** Filtered and sorted items */
  filteredItems: T[];

  /** Current filter state */
  filters: FilterState;

  /** Update a specific filter */
  updateFilter: (key: keyof FilterState, value: any) => void;

  /** Reset all filters to defaults */
  resetFilters: () => void;

  /** Clear search filter specifically */
  clearSearch: () => void;

  /** Toggle a status in multi-status filter */
  toggleStatus: (status: string) => void;

  /** Update sort configuration */
  updateSort: (field: string, direction?: SortDirection) => void;

  /** Check if any filters are active */
  hasActiveFilters: boolean;

  /** Count of active filters */
  activeFilterCount: number;
}

// 🎨 Filter UI component prop types
export interface FilterButtonsProps {
  /** Available filter options */
  options: readonly string[];

  /** Currently selected value(s) */
  value: string | string[];

  /** Change handler */
  onChange: (value: string | string[]) => void;

  /** Whether multiple selection is allowed */
  multiple?: boolean;

  /** Button size variant */
  size?: "sm" | "default" | "lg";

  /** Custom className */
  className?: string;

  /** Disabled state */
  disabled?: boolean;
}

export interface EnhancedFilterBarProps {
  /** Filter configuration array */
  config: FilterConfig[];

  /** Current filter values */
  values: Partial<FilterState>;

  /** Filter change handler */
  onChange: (key: string, value: any) => void;

  /** Additional action buttons (New Plant, etc.) */
  actions?: React.ReactNode;

  /** Override search placeholder */
  searchPlaceholder?: string;

  /** Show filter reset button */
  showReset?: boolean;

  /** Callback when filters are reset */
  onReset?: () => void;

  /** Custom className for container */
  className?: string;

  /** Disable all filters */
  disabled?: boolean;
}

// 🔧 Utility types for specific filtering scenarios
export interface SearchableItem {
  /** Items must have some searchable text fields */
  [key: string]: any;
}

export interface StatusItem {
  /** Items with status field for filtering */
  status?: string;
  disponible?: boolean; // For plant availability
  date?: string; // For date-based filtering
}

export interface SortableItem {
  /** Items that can be sorted by various fields */
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

// 📋 Pre-configured filter types for common scenarios
export interface PlantFilters extends FilterState {
  availability: AvailabilityFilter;
}

export interface EventFilters extends FilterState {
  dateRange: EventDateFilter;
  tab: "events" | "swappoints";
}

export interface SwapFilters extends FilterState {
  statuses: SwapStatusFilter[];
}

// 🎯 Callback function types
export type FilterChangeHandler = (key: string, value: any) => void;
export type FilterResetHandler = () => void;
export type SearchChangeHandler = (query: string) => void;
export type SortChangeHandler = (
  field: string,
  direction: SortDirection
) => void;
