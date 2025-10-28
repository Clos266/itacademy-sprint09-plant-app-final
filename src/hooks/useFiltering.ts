import { useState, useMemo, useCallback } from "react";
import type {
  FilteringConfig,
  FilterState,
  UseFilteringReturn,
  SortDirection,
} from "@/types/filtering";
import { DEFAULT_FILTER_VALUES } from "@/constants/filters";

export function useFiltering<T extends Record<string, any>>(
  items: T[],
  config: FilteringConfig<T> = {}
): UseFilteringReturn<T> {
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

  const applyTextSearch = useCallback(
    (items: T[], query: string): T[] => {
      if (!query.trim() || !config.searchFields?.length) return items;

      const searchTerm = query.toLowerCase();

      return items.filter((item) => {
        return config.searchFields!.some((field) => {
          const value = getNestedValue(item, field as string);
          return String(value || "")
            .toLowerCase()
            .includes(searchTerm);
        });
      });
    },
    [config.searchFields]
  );

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

  const applySorting = useCallback(
    (items: T[], sortField: string, sortDirection: SortDirection): T[] => {
      if (!sortField) return items;

      return [...items].sort((a, b) => {
        const aValue = getNestedValue(a, sortField);
        const bValue = getNestedValue(b, sortField);

        if (typeof aValue === "string" && typeof bValue === "string") {
          const result = aValue.localeCompare(bValue);
          return sortDirection === "asc" ? result : -result;
        }

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
        }

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

  const filteredItems = useMemo(() => {
    let result = items;

    result = applyTextSearch(result, filters.search);
    result = applyStatusFilter(result, filters.status);
    result = applyDateFilter(result, filters.date);
    result = applyCustomFilters(result, filters.custom);

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

  const updateFilter = useCallback((key: keyof FilterState, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

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

  const clearSearch = useCallback(() => {
    updateFilter("search", "");
  }, [updateFilter]);

  const toggleStatus = useCallback((status: string) => {
    setFilters((prev) => ({
      ...prev,
      multiStatus: prev.multiStatus.includes(status)
        ? prev.multiStatus.filter((s) => s !== status)
        : [...prev.multiStatus, status],
    }));
  }, []);

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

  const hasActiveFilters = useMemo(() => {
    return (
      filters.search !== "" ||
      filters.status !== "all" ||
      filters.multiStatus.length > 0 ||
      filters.date !== "all" ||
      Object.keys(filters.custom).length > 0
    );
  }, [filters]);

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

function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

export { FilteringPresets } from "@/config/filteringPresets";
export type {
  FilteringPresetName,
  FilteringPresetConfig,
} from "@/config/filteringPresets";
