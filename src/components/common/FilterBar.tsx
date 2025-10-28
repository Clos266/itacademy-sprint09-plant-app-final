import { SearchInput } from "@/components/common/SearchInput";
import { FilterButtons } from "@/components/common/FilterButtons";
import { cn } from "@/lib/utils";
import type {
  FilterConfig,
  FilterState,
  EnhancedFilterBarProps,
} from "@/types/filtering";

interface FilterBarProps {
  searchComponent?: React.ReactNode;
  filters?: React.ReactNode;
}

export function FilterBar({ searchComponent, filters }: FilterBarProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4">
      <div className="w-full md:w-1/2">{searchComponent}</div>

      <div className="flex gap-2 md:w-auto flex-wrap justify-end">
        {filters}
      </div>
    </div>
  );
}

export function EnhancedFilterBar({
  config,
  values,
  onChange,
  actions,
  searchPlaceholder,
  className,
  disabled = false,
}: EnhancedFilterBarProps) {
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

  const searchFilters = config.filter((f) => f.type === "text");
  const otherFilters = config.filter((f) => f.type !== "text");

  return (
    <div
      className={cn(
        "flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4",
        className
      )}
    >
      <div className="w-full md:w-1/2 flex flex-col gap-2">
        {searchFilters.map(renderFilter)}
      </div>

      <div className="flex gap-2 md:w-auto flex-wrap justify-end items-center">
        {otherFilters.map(renderFilter)}
        {actions}
      </div>
    </div>
  );
}
