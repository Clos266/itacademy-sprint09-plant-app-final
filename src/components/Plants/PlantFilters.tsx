import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Filter, RefreshCcw } from "lucide-react";
import { FilterBar } from "@/components/common/FilterBar";
import { SearchInput } from "@/components/common/SearchInput";
import type { FilterType } from "@/hooks/usePlantSwap";

interface PlantFiltersProps {
  search: string;
  filterType: FilterType;
  onSearchChange: (value: string) => void;
  onFilterChange: (type: FilterType) => void;
  onClearSearch: () => void;
}

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "available", label: "Available" },
  { value: "unavailable", label: "Unavailable" },
];

export const PlantFilters = memo(function PlantFilters({
  search,
  filterType,
  onSearchChange,
  onFilterChange,
  onClearSearch,
}: PlantFiltersProps) {
  return (
    <Card>
      <CardContent>
        <FilterBar
          searchComponent={
            <SearchInput
              value={search}
              onChange={onSearchChange}
              onClear={onClearSearch}
              placeholder="Search plants or species..."
            />
          }
          filters={
            <>
              <Filter className="h-4 w-4 text-muted-foreground" />
              {FILTER_OPTIONS.map(({ value, label }) => (
                <Button
                  key={value}
                  variant={filterType === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => onFilterChange(value)}
                >
                  {label}
                </Button>
              ))}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClearSearch}
                title="Clear search"
              >
                <RefreshCcw className="w-4 h-4" />
              </Button>
            </>
          }
        />
      </CardContent>
    </Card>
  );
});

PlantFilters.displayName = "PlantFilters";
