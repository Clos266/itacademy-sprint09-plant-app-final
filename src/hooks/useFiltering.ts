import { useState, useMemo, useCallback } from "react";
import type {
  FilteringConfig,
  FilterState,
  UseFilteringReturn,
  SortDirection,
} from "@/types/filtering";
import { DEFAULT_FILTER_VALUES } from "@/constants/filters";

/**
 * 🎣 Universal filtering hook for consistent filtering logic across pages
 *
 * Provides a unified interface for text search, status filtering, sorting,
 * and custom filter functions. Handles pagination reset automatically and
 * optimizes performance with memoization.
 *
 * @example
 * // Basic plant filtering (Home, Plants pages)
 * const { filteredItems, filters, updateFilter } = useFiltering(plants, {
 *   searchFields: ["nombre_comun", "nombre_cientifico", "especie"],
 *   statusField: "disponible",
 *   customFilters: {
 *     availability: (plant, value) => {
 *       if (value === "available") return plant.disponible;
 *       if (value === "unavailable") return !plant.disponible;
 *       return true; // "all"
 *     }
 *   }
 * });
 *
 * @example
 * // Advanced swap filtering with multi-status
 * const { filteredItems, toggleStatus } = useFiltering(swaps, {
 *   searchFields: ["receiver.username", "senderPlant.nombre_comun"],
 *   customFilters: {
 *     multiStatus: (swap, statusArray) => {
 *       if (statusArray.length === 0) return true;
 *       return statusArray.includes(mapSwapStatus(swap.status));
 *     }
 *   }
 * });
 */
export function useFiltering<T extends Record<string, any>>(
  items: T[],
  config: FilteringConfig<T> = {}
): UseFilteringReturn<T> {
  // Initialize filter state with defaults
  const [filters, setFilters] = useState<FilterState>({
    search: DEFAULT_FILTER_VALUES.search,
    status: DEFAULT_FILTER_VALUES.availability,
    multiStatus: [],
    date: DEFAULT_FILTER_VALUES.eventDate,
    sort: {
      field: (config.defaultSort?.field as string) || "created_at",
      direction:
        config.defaultSort?.direction || DEFAULT_FILTER_VALUES.sortDirection,
    },
    tab: "",
    custom: {},
  });

  // Generic text search across multiple fields
  const applyTextSearch = useCallback(
    (items: T[], query: string): T[] => {
      if (!query.trim() || !config.searchFields?.length) return items;

      const searchTerm = query.toLowerCase();

      return items.filter((item) => {
        return config.searchFields!.some((field) => {
          // Handle nested field access (e.g., "receiver.username")
          const value = getNestedValue(item, field as string);
          return String(value || "")
            .toLowerCase()
            .includes(searchTerm);
        });
      });
    },
    [config.searchFields]
  );

  // Apply status-based filtering
  const applyStatusFilter = useCallback(
    (items: T[], status: string): T[] => {
      if (!status || status === "all" || !config.statusField) return items;

      return items.filter((item) => {
        const itemStatus = item[config.statusField!];
        return itemStatus === status;
      });
    },
    [config.statusField]
  );

  // Apply date-based filtering (for events)
  const applyDateFilter = useCallback(
    (items: T[], dateFilter: string): T[] => {
      if (!dateFilter || dateFilter === "all" || !config.dateField)
        return items;

      const now = new Date();

      return items.filter((item) => {
        const itemDate = new Date(item[config.dateField!] as string);
        const isUpcoming = itemDate > now;

        if (dateFilter === "upcoming") return isUpcoming;
        if (dateFilter === "past") return !isUpcoming;
        return true;
      });
    },
    [config.dateField]
  );

  // Apply custom filters
  const applyCustomFilters = useCallback(
    (items: T[], customValues: Record<string, any>): T[] => {
      if (!config.customFilters || Object.keys(customValues).length === 0)
        return items;

      return items.filter((item) => {
        return Object.entries(customValues).every(([key, value]) => {
          const filterFn = config.customFilters![key];
          if (!filterFn) return true;
          return filterFn(item, value);
        });
      });
    },
    [config.customFilters]
  );

  // Apply sorting
  const applySorting = useCallback(
    (items: T[], sortField: string, sortDirection: SortDirection): T[] => {
      if (!sortField) return items;

      return [...items].sort((a, b) => {
        const aValue = getNestedValue(a, sortField);
        const bValue = getNestedValue(b, sortField);

        // Handle different data types
        if (typeof aValue === "string" && typeof bValue === "string") {
          const result = aValue.localeCompare(bValue);
          return sortDirection === "asc" ? result : -result;
        }

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
        }

        // Handle dates
        if (
          aValue instanceof Date ||
          bValue instanceof Date ||
          (typeof aValue === "string" &&
            typeof bValue === "string" &&
            sortField.includes("date")) ||
          sortField.includes("created_at") ||
          sortField.includes("updated_at")
        ) {
          const dateA = new Date(aValue as string).getTime();
          const dateB = new Date(bValue as string).getTime();
          return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
        }

        return 0;
      });
    },
    []
  );

  // Main filtering logic with memoization for performance
  const filteredItems = useMemo(() => {
    let result = items;

    // Apply filters in sequence
    result = applyTextSearch(result, filters.search);
    result = applyStatusFilter(result, filters.status);
    result = applyDateFilter(result, filters.date);
    result = applyCustomFilters(result, filters.custom);

    // Apply sorting last
    result = applySorting(result, filters.sort.field, filters.sort.direction);

    return result;
  }, [
    items,
    filters.search,
    filters.status,
    filters.date,
    filters.custom,
    filters.sort,
    applyTextSearch,
    applyStatusFilter,
    applyDateFilter,
    applyCustomFilters,
    applySorting,
  ]);

  // Update individual filter
  const updateFilter = useCallback((key: keyof FilterState, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // Reset all filters to defaults
  const resetFilters = useCallback(() => {
    setFilters({
      search: DEFAULT_FILTER_VALUES.search,
      status: DEFAULT_FILTER_VALUES.availability,
      multiStatus: [],
      date: DEFAULT_FILTER_VALUES.eventDate,
      sort: {
        field: (config.defaultSort?.field as string) || "created_at",
        direction:
          config.defaultSort?.direction || DEFAULT_FILTER_VALUES.sortDirection,
      },
      tab: "",
      custom: {},
    });
  }, [config.defaultSort]);

  // Clear search specifically
  const clearSearch = useCallback(() => {
    updateFilter("search", "");
  }, [updateFilter]);

  // Toggle status in multi-status array
  const toggleStatus = useCallback((status: string) => {
    setFilters((prev) => ({
      ...prev,
      multiStatus: prev.multiStatus.includes(status)
        ? prev.multiStatus.filter((s) => s !== status)
        : [...prev.multiStatus, status],
    }));
  }, []);

  // Update sort configuration
  const updateSort = useCallback((field: string, direction?: SortDirection) => {
    setFilters((prev) => ({
      ...prev,
      sort: {
        field,
        direction:
          direction ||
          (prev.sort.field === field
            ? prev.sort.direction === "asc"
              ? "desc"
              : "asc"
            : "asc"),
      },
    }));
  }, []);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.search !== "" ||
      filters.status !== "all" ||
      filters.multiStatus.length > 0 ||
      filters.date !== "all" ||
      Object.keys(filters.custom).length > 0
    );
  }, [filters]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status !== "all") count++;
    if (filters.multiStatus.length > 0) count++;
    if (filters.date !== "all") count++;
    count += Object.keys(filters.custom).length;
    return count;
  }, [filters]);

  return {
    filteredItems,
    filters,
    updateFilter,
    resetFilters,
    clearSearch,
    toggleStatus,
    updateSort,
    hasActiveFilters,
    activeFilterCount,
  };
}

/**
 * 🔍 Helper function to get nested object values
 * Supports dot notation like "receiver.username" or "plant.nombre_comun"
 */
function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

// 🎯 Re-export centralized filtering presets for backward compatibility
// The actual presets are now defined in @/config/filteringPresets.ts
export { FilteringPresets } from "@/config/filteringPresets";
export type {
  FilteringPresetName,
  FilteringPresetConfig,
} from "@/config/filteringPresets";
