import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/common/SearchInput";
import { FilterButtons } from "@/components/common/FilterButtons";
import { cn } from "@/lib/utils";
import type {
  FilterConfig,
  FilterState,
  EnhancedFilterBarProps,
} from "@/types/filtering";

// 🔍 Original simple FilterBar (backward compatibility)
interface FilterBarProps {
  /** Componente de búsqueda, como <SearchInput /> */
  searchComponent?: React.ReactNode;
  /** Filtros adicionales (botones, selects, etc.) */
  filters?: React.ReactNode;
}

/**
 * 🔍 Basic FilterBar - maintains backward compatibility
 * Compatible with existing usage across pages.
 */
export function FilterBar({ searchComponent, filters }: FilterBarProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4">
      {/* Campo de búsqueda o espacio vacío */}
      <div className="w-full md:w-1/2">{searchComponent}</div>

      {/* Controles de filtro (botones, selects, etc.) */}
      <div className="flex gap-2 md:w-auto flex-wrap justify-end">
        {filters}
      </div>
    </div>
  );
}

/**
 * 🎛️ Enhanced config-based FilterBar for unified filtering system
 *
 * Supports declarative filter configuration with automatic UI generation.
 * Handles text search, status filters, multi-status toggles, and custom filters.
 *
 * @example
 * <EnhancedFilterBar
 *   config={[
 *     { key: "search", type: "text", placeholder: "Search plants..." },
 *     { key: "status", type: "status", options: ["all", "available", "unavailable"] }
 *   ]}
 *   values={{ search: "", status: "all" }}
 *   onChange={(key, value) => updateFilter(key, value)}
 * />
 */
export function EnhancedFilterBar({
  config,
  values,
  onChange,
  actions,
  searchPlaceholder,
  showReset = false,
  onReset,
  className,
  disabled = false,
}: EnhancedFilterBarProps) {
  // Helper to render individual filter based on config
  const renderFilter = (filterConfig: FilterConfig) => {
    const {
      key,
      type,
      placeholder,
      options = [],
      multiple = false,
    } = filterConfig;
    const currentValue = values[key as keyof FilterState];

    switch (type) {
      case "text":
        return (
          <SearchInput
            key={key}
            value={(currentValue as string) || ""}
            onChange={(value) => onChange(key, value)}
            onClear={() => onChange(key, "")}
            placeholder={searchPlaceholder || placeholder || "Search..."}
          />
        );

      case "status":
      case "multiStatus":
        const filterValue = multiple
          ? Array.isArray(currentValue)
            ? currentValue
            : []
          : typeof currentValue === "string"
          ? currentValue
          : "";

        return (
          <FilterButtons
            key={key}
            options={options}
            value={filterValue}
            onChange={(value) => onChange(key, value)}
            multiple={type === "multiStatus"}
            disabled={disabled}
          />
        );

      // TODO: Add support for date, sort, tab, and custom filter types
      case "date":
      case "sort":
      case "tab":
      case "custom":
        console.warn(`Filter type "${type}" is not yet implemented`);
        return null;

      default:
        console.warn(`Unknown filter type: ${type}`);
        return null;
    }
  };

  // Separate search filters from other filters
  const searchFilters = config.filter((f) => f.type === "text");
  const otherFilters = config.filter((f) => f.type !== "text");

  // Check if any filters are active for reset button
  const hasActiveFilters = Object.entries(values).some(([key, value]) => {
    if (key === "search") return Boolean(value);
    if (Array.isArray(value)) return value.length > 0;
    return value !== "" && value !== "all";
  });

  return (
    <div
      className={cn(
        "flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4",
        className
      )}
    >
      {/* Search section */}
      <div className="w-full md:w-1/2 flex flex-col gap-2">
        {searchFilters.map(renderFilter)}
      </div>

      {/* Filter controls section */}
      <div className="flex gap-2 md:w-auto flex-wrap justify-end items-center">
        {/* Render non-search filters */}
        {otherFilters.map(renderFilter)}

        {/* Reset button */}
        {showReset && hasActiveFilters && onReset && (
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            disabled={disabled}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear Filters
          </Button>
        )}

        {/* Additional actions (New Plant, New Event, etc.) */}
        {actions}
      </div>
    </div>
  );
}
