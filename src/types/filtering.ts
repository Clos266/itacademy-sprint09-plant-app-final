import type {
  AVAILABILITY_FILTERS,
  EVENT_DATE_FILTERS,
  SWAP_STATUS_FILTERS,
  SORT_DIRECTIONS,
} from "@/constants/filters";

export type AvailabilityFilter = (typeof AVAILABILITY_FILTERS)[number];
export type EventDateFilter = (typeof EVENT_DATE_FILTERS)[number];
export type SwapStatusFilter = (typeof SWAP_STATUS_FILTERS)[number];
export type SortDirection = (typeof SORT_DIRECTIONS)[number];

export type FilterInputType =
  | "text"
  | "status"
  | "multiStatus"
  | "date"
  | "sort"
  | "tab"
  | "custom";

export interface FilterConfig {
  key: string;

  type: FilterInputType;

  label?: string;

  placeholder?: string;

  options?: readonly string[];

  multiple?: boolean;

  defaultValue?: any;

  validate?: (value: any) => boolean;

  filterFn?: (item: any, value: any) => boolean;
}

export interface FilteringConfig<T = any> {
  searchFields?: (keyof T)[];

  statusField?: keyof T;

  dateField?: keyof T;

  filters?: FilterConfig[];

  customFilters?: Record<string, (item: T, value: any) => boolean>;

  defaultSort?: {
    field: keyof T;
    direction: SortDirection;
  };

  sortableFields?: (keyof T)[];
}

export interface FilterState {
  search: string;

  status: string;

  multiStatus: string[];

  date: string;

  sort: {
    field: string;
    direction: SortDirection;
  };

  tab: string;

  custom: Record<string, any>;
}

export interface UseFilteringReturn<T> {
  filteredItems: T[];

  filters: FilterState;

  updateFilter: (key: keyof FilterState, value: any) => void;

  resetFilters: () => void;

  clearSearch: () => void;

  toggleStatus: (status: string) => void;

  updateSort: (field: string, direction?: SortDirection) => void;

  hasActiveFilters: boolean;

  activeFilterCount: number;
}

export interface FilterButtonsProps {
  options: readonly string[];

  value: string | string[];

  onChange: (value: string | string[]) => void;

  multiple?: boolean;

  size?: "sm" | "default" | "lg";

  className?: string;

  disabled?: boolean;
}

export interface EnhancedFilterBarProps {
  config: FilterConfig[];

  values: Partial<FilterState>;

  onChange: (key: string, value: any) => void;

  actions?: React.ReactNode;

  searchPlaceholder?: string;

  className?: string;

  disabled?: boolean;
}

export interface SearchableItem {
  [key: string]: any;
}

export interface StatusItem {
  status?: string;
  disponible?: boolean;
  date?: string;
}

export interface SortableItem {
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

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

export type FilterChangeHandler = (key: string, value: any) => void;
export type FilterResetHandler = () => void;
export type SearchChangeHandler = (query: string) => void;
export type SortChangeHandler = (
  field: string,
  direction: SortDirection
) => void;
