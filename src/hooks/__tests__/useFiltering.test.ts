import { renderHook, act } from "@testing-library/react";
import { useFiltering } from "../useFiltering";
import type { FilteringConfig } from "@/types/filtering";

interface TestItem {
  id: number;
  name: string;
  category: string;
  status: string;
  created_at: string;
  price: number;
  tags: string[];
  author?: {
    name: string;
  };
}

const mockItems: TestItem[] = [
  {
    id: 1,
    name: "Monstera Deliciosa",
    category: "Tropical",
    status: "available",
    created_at: "2024-01-15T10:00:00Z",
    price: 25,
    tags: ["indoor", "popular"],
    author: { name: "John Doe" },
  },
  {
    id: 2,
    name: "Snake Plant",
    category: "Succulent",
    status: "unavailable",
    created_at: "2024-02-20T15:30:00Z",
    price: 15,
    tags: ["beginner", "low-light"],
    author: { name: "Jane Smith" },
  },
  {
    id: 3,
    name: "Pothos",
    category: "Tropical",
    status: "available",
    created_at: "2024-03-10T08:45:00Z",
    price: 12,
    tags: ["trailing", "easy"],
  },
  {
    id: 4,
    name: "Peace Lily",
    category: "Flowering",
    status: "available",
    created_at: "2023-12-05T12:00:00Z",
    price: 30,
    tags: ["flowering", "indoor"],
    author: { name: "Bob Wilson" },
  },
];

const mockConfig: FilteringConfig<TestItem> = {
  searchFields: ["name", "category", "author.name"] as any,
  statusField: "status",
  dateField: "created_at",
  customFilters: {
    priceRange: (item, value) => {
      const [min, max] = value;
      return item.price >= min && item.price <= max;
    },
    hasAuthor: (item) => !!item.author,
  },
  defaultSort: {
    field: "created_at",
    direction: "desc",
  },
};

describe("useFiltering Hook", () => {
  describe("Initial State", () => {
    it("should initialize with default values", () => {
      const { result } = renderHook(() => useFiltering(mockItems));

      expect(result.current.filters.search).toBe("");
      expect(result.current.filters.status).toBe("all");
      expect(result.current.filters.multiStatus).toEqual([]);
      expect(result.current.filters.date).toBe("all");
      expect(result.current.filters.custom).toEqual({});
      expect(result.current.hasActiveFilters).toBe(false);
      expect(result.current.activeFilterCount).toBe(0);
    });

    it("should initialize with custom config", () => {
      const { result } = renderHook(() => useFiltering(mockItems, mockConfig));

      expect(result.current.filters.sort.field).toBe("created_at");
      expect(result.current.filters.sort.direction).toBe("desc");
      expect(result.current.filteredItems).toHaveLength(4);
    });

    it("should return all items when no filters applied", () => {
      const { result } = renderHook(() => useFiltering(mockItems));

      expect(result.current.filteredItems).toHaveLength(4);

      expect(
        result.current.filteredItems.map((item) => item.id).sort()
      ).toEqual([1, 2, 3, 4]);
    });
  });

  describe("Text Search Filtering", () => {
    it("should filter by name", () => {
      const { result } = renderHook(() => useFiltering(mockItems, mockConfig));

      act(() => {
        result.current.updateFilter("search", "Monstera");
      });

      expect(result.current.filteredItems).toHaveLength(1);
      expect(result.current.filteredItems[0].name).toBe("Monstera Deliciosa");
    });

    it("should filter by category", () => {
      const { result } = renderHook(() => useFiltering(mockItems, mockConfig));

      act(() => {
        result.current.updateFilter("search", "Tropical");
      });

      expect(result.current.filteredItems).toHaveLength(2);
      expect(
        result.current.filteredItems.every(
          (item) => item.category === "Tropical"
        )
      ).toBe(true);
    });

    it("should filter by nested field (author.name)", () => {
      const { result } = renderHook(() => useFiltering(mockItems, mockConfig));

      act(() => {
        result.current.updateFilter("search", "John");
      });

      expect(result.current.filteredItems).toHaveLength(1);
      expect(result.current.filteredItems[0].author?.name).toBe("John Doe");
    });

    it("should be case insensitive", () => {
      const { result } = renderHook(() => useFiltering(mockItems, mockConfig));

      act(() => {
        result.current.updateFilter("search", "SNAKE");
      });

      expect(result.current.filteredItems).toHaveLength(1);
      expect(result.current.filteredItems[0].name).toBe("Snake Plant");
    });

    it("should handle partial matches", () => {
      const { result } = renderHook(() => useFiltering(mockItems, mockConfig));

      act(() => {
        result.current.updateFilter("search", "Plant");
      });

      const plantNames = result.current.filteredItems.map((item) => item.name);
      expect(result.current.filteredItems.length).toBeGreaterThanOrEqual(1);
      expect(plantNames.some((name) => name.includes("Plant"))).toBe(true);
    });

    it("should clear search correctly", () => {
      const { result } = renderHook(() => useFiltering(mockItems, mockConfig));

      act(() => {
        result.current.updateFilter("search", "Monstera");
      });

      expect(result.current.filteredItems).toHaveLength(1);

      act(() => {
        result.current.clearSearch();
      });

      expect(result.current.filters.search).toBe("");
      expect(result.current.filteredItems).toHaveLength(4);
    });
  });

  describe("Status Filtering", () => {
    it("should filter by status", () => {
      const { result } = renderHook(() => useFiltering(mockItems, mockConfig));

      act(() => {
        result.current.updateFilter("status", "available");
      });

      expect(result.current.filteredItems).toHaveLength(3);
      expect(
        result.current.filteredItems.every(
          (item) => item.status === "available"
        )
      ).toBe(true);
    });

    it('should show all when status is "all"', () => {
      const { result } = renderHook(() => useFiltering(mockItems, mockConfig));

      act(() => {
        result.current.updateFilter("status", "unavailable");
      });
      expect(result.current.filteredItems).toHaveLength(1);

      act(() => {
        result.current.updateFilter("status", "all");
      });

      expect(result.current.filteredItems).toHaveLength(4);
    });

    it("should toggle status correctly", () => {
      const { result } = renderHook(() => useFiltering(mockItems, mockConfig));

      act(() => {
        result.current.toggleStatus("available");
      });

      expect(result.current.filters.multiStatus).toContain("available");

      act(() => {
        result.current.toggleStatus("available");
      });

      expect(result.current.filters.multiStatus).not.toContain("available");
    });
  });

  describe("Date Filtering", () => {
    it("should filter upcoming items", () => {
      const futureItems = [
        ...mockItems,
        {
          id: 5,
          name: "Future Plant",
          category: "Test",
          status: "available",
          created_at: "2026-01-01T00:00:00Z", // Future date (2026)
          price: 20,
          tags: [],
        },
      ];

      const { result } = renderHook(() =>
        useFiltering(futureItems, mockConfig)
      );

      act(() => {
        result.current.updateFilter("date", "upcoming");
      });

      const futureItem = result.current.filteredItems.find(
        (item) => item.name === "Future Plant"
      );
      expect(futureItem).toBeDefined();
    });

    it("should filter past items", () => {
      const { result } = renderHook(() => useFiltering(mockItems, mockConfig));

      act(() => {
        result.current.updateFilter("date", "past");
      });

      expect(result.current.filteredItems).toHaveLength(4);
    });
  });

  describe("Custom Filters", () => {
    it("should apply price range filter", () => {
      const { result } = renderHook(() => useFiltering(mockItems, mockConfig));

      act(() => {
        result.current.updateFilter("custom", { priceRange: [10, 20] });
      });

      const filtered = result.current.filteredItems;
      expect(filtered).toHaveLength(2);
      expect(
        filtered.every((item) => item.price >= 10 && item.price <= 20)
      ).toBe(true);
    });

    it("should apply hasAuthor filter", () => {
      const { result } = renderHook(() => useFiltering(mockItems, mockConfig));

      act(() => {
        result.current.updateFilter("custom", { hasAuthor: true });
      });

      const filtered = result.current.filteredItems;
      expect(filtered).toHaveLength(3);
      expect(filtered.every((item) => !!item.author)).toBe(true);
    });

    it("should combine multiple custom filters", () => {
      const { result } = renderHook(() => useFiltering(mockItems, mockConfig));

      act(() => {
        result.current.updateFilter("custom", {
          priceRange: [20, 35],
          hasAuthor: true,
        });
      });

      const filtered = result.current.filteredItems;
      expect(filtered).toHaveLength(2);
    });
  });

  describe("Sorting", () => {
    it("should sort by string field ascending", () => {
      const { result } = renderHook(() => useFiltering(mockItems, mockConfig));

      act(() => {
        result.current.updateSort("name", "asc");
      });

      const names = result.current.filteredItems.map((item) => item.name);
      expect(names).toEqual([
        "Monstera Deliciosa",
        "Peace Lily",
        "Pothos",
        "Snake Plant",
      ]);
    });

    it("should sort by string field descending", () => {
      const { result } = renderHook(() => useFiltering(mockItems, mockConfig));

      act(() => {
        result.current.updateSort("name", "desc");
      });

      const names = result.current.filteredItems.map((item) => item.name);
      expect(names).toEqual([
        "Snake Plant",
        "Pothos",
        "Peace Lily",
        "Monstera Deliciosa",
      ]);
    });

    it("should sort by number field", () => {
      const { result } = renderHook(() => useFiltering(mockItems, mockConfig));

      act(() => {
        result.current.updateSort("price", "asc");
      });

      const prices = result.current.filteredItems.map((item) => item.price);
      expect(prices).toEqual([12, 15, 25, 30]);
    });

    it("should sort by date field", () => {
      const { result } = renderHook(() => useFiltering(mockItems, mockConfig));

      act(() => {
        result.current.updateSort("created_at", "desc");
      });

      const dates = result.current.filteredItems.map((item) => item.created_at);

      expect(new Date(dates[0]) >= new Date(dates[1])).toBe(true);
    });

    it("should toggle sort direction when same field clicked", () => {
      const { result } = renderHook(() => useFiltering(mockItems, mockConfig));

      act(() => {
        result.current.updateSort("name");
      });
      expect(result.current.filters.sort.direction).toBe("asc");

      act(() => {
        result.current.updateSort("name");
      });
      expect(result.current.filters.sort.direction).toBe("desc");
    });
  });

  describe("Combined Filters", () => {
    it("should apply multiple filters simultaneously", () => {
      const { result } = renderHook(() => useFiltering(mockItems, mockConfig));

      act(() => {
        result.current.updateFilter("search", "Tropical");
        result.current.updateFilter("status", "available");
        result.current.updateFilter("custom", { priceRange: [10, 30] });
      });

      const filtered = result.current.filteredItems;
      expect(filtered).toHaveLength(2);
      expect(
        filtered.every(
          (item) =>
            item.category === "Tropical" &&
            item.status === "available" &&
            item.price >= 10 &&
            item.price <= 30
        )
      ).toBe(true);
    });

    it("should return empty array when no items match", () => {
      const { result } = renderHook(() => useFiltering(mockItems, mockConfig));

      act(() => {
        result.current.updateFilter("search", "NonExistentPlant");
      });

      expect(result.current.filteredItems).toHaveLength(0);
    });
  });

  describe("Filter State Management", () => {
    it("should track active filters correctly", () => {
      const { result } = renderHook(() => useFiltering(mockItems, mockConfig));

      expect(result.current.hasActiveFilters).toBe(false);
      expect(result.current.activeFilterCount).toBe(0);

      act(() => {
        result.current.updateFilter("search", "Monstera");
        result.current.updateFilter("status", "available");
      });

      expect(result.current.hasActiveFilters).toBe(true);
      expect(result.current.activeFilterCount).toBe(2);
    });

    it("should reset all filters", () => {
      const { result } = renderHook(() => useFiltering(mockItems, mockConfig));

      act(() => {
        result.current.updateFilter("search", "Monstera");
        result.current.updateFilter("status", "available");
        result.current.updateFilter("custom", { priceRange: [10, 20] });
      });

      expect(result.current.hasActiveFilters).toBe(true);

      act(() => {
        result.current.resetFilters();
      });

      expect(result.current.filters.search).toBe("");
      expect(result.current.filters.status).toBe("all");
      expect(result.current.filters.custom).toEqual({});
      expect(result.current.hasActiveFilters).toBe(false);
      expect(result.current.filteredItems).toHaveLength(4);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty items array", () => {
      const { result } = renderHook(() => useFiltering([], mockConfig));

      expect(result.current.filteredItems).toEqual([]);
      expect(result.current.hasActiveFilters).toBe(false);
    });

    it("should handle missing config", () => {
      const { result } = renderHook(() => useFiltering(mockItems));

      expect(result.current.filteredItems).toHaveLength(4);

      act(() => {
        result.current.updateFilter("search", "test");
      });

      expect(result.current.filteredItems).toHaveLength(4);
    });

    it("should handle undefined/null values in items", () => {
      const itemsWithNulls = [
        ...mockItems,
        {
          id: 5,
          name: "",
          category: "",
          status: "available",
          created_at: "",
          price: 0,
          tags: [],
          author: undefined,
        },
      ];

      const { result } = renderHook(() =>
        useFiltering(itemsWithNulls, mockConfig)
      );

      expect(result.current.filteredItems).toHaveLength(5);

      act(() => {
        result.current.updateFilter("search", "nonexistent");
      });

      expect(result.current.filteredItems).toHaveLength(0);
    });

    it("should handle invalid sort fields gracefully", () => {
      const { result } = renderHook(() => useFiltering(mockItems, mockConfig));

      act(() => {
        result.current.updateSort("nonexistentField", "asc");
      });

      expect(result.current.filteredItems).toHaveLength(4);
    });
  });
});

describe("useFiltering Performance", () => {
  const largeDataset = Array.from({ length: 1000 }, (_, index) => ({
    id: index,
    name: `Item ${index}`,
    category: index % 2 === 0 ? "Even" : "Odd",
    status: index % 3 === 0 ? "available" : "unavailable",
    created_at: new Date(2024, 0, index + 1).toISOString(),
    price: Math.floor(Math.random() * 100),
    tags: [`tag${index % 5}`],
  }));

  it("should handle large datasets efficiently", () => {
    const startTime = performance.now();

    const { result } = renderHook(() =>
      useFiltering(largeDataset, {
        searchFields: ["name", "category"],
        statusField: "status",
      })
    );

    const renderTime = performance.now() - startTime;

    expect(result.current.filteredItems).toHaveLength(1000);
    expect(renderTime).toBeLessThan(100);
  });

  it("should filter large datasets efficiently", () => {
    const { result } = renderHook(() =>
      useFiltering(largeDataset, {
        searchFields: ["name", "category"],
        statusField: "status",
      })
    );

    const startTime = performance.now();

    act(() => {
      result.current.updateFilter("search", "Item 1");
    });

    const filterTime = performance.now() - startTime;

    expect(filterTime).toBeLessThan(50);
    expect(result.current.filteredItems.length).toBeGreaterThan(0);
  });
});
