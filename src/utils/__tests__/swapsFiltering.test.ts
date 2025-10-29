import {
  mapSwapStatus,
  getSwapStatusBadgeVariant,
  filterAndSortSwaps,
  isSortableColumn,
  getSwapStatistics,
  createSortableHeaderProps,
  type SwapFilters,
  type FullSwap,
  SWAPS_DEFAULT_CONFIG,
} from "../swapsFiltering";
import { SWAP_STATUSES } from "@/constants/status";
import { DOMAIN_FILTER_TYPES } from "@/constants/filterTypes";

// Mock del servicio
jest.mock("@/services/swapCrudService", () => ({
  canUserActOnSwap: jest.fn(),
}));

// Mock data helpers
const createMockSwap = (overrides: Partial<FullSwap> = {}): FullSwap => ({
  id: 1,
  sender_id: "user1",
  receiver_id: "user2",
  sender_plant_id: 1,
  receiver_plant_id: 2,
  status: "pending",
  swap_point_id: null,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  sender: {
    id: "user1",
    username: "john_doe",
    email: "john@example.com",
    created_at: "2024-01-01T00:00:00Z",
    cp: "12345",
    ciudad: "Test City",
    lat: 40.7128,
    lng: -74.006,
    avatar_url: null,
  },
  receiver: {
    id: "user2",
    username: "jane_smith",
    email: "jane@example.com",
    created_at: "2024-01-01T00:00:00Z",
    cp: "54321",
    ciudad: "Test City",
    lat: 40.7128,
    lng: -74.006,
    avatar_url: null,
  },
  senderPlant: {
    id: 1,
    nombre_comun: "Monstera Deliciosa",
    nombre_cientifico: "Monstera deliciosa",
    user_id: "user1",
    disponible: true,
    created_at: "2024-01-01T00:00:00Z",
    especie: "Deliciosa",
    familia: "Araceae",
    interval_days: 7,
    image_url: null,
    last_watered: "2024-01-01T00:00:00Z",
  },
  receiverPlant: {
    id: 2,
    nombre_comun: "Snake Plant",
    nombre_cientifico: "Sansevieria trifasciata",
    user_id: "user2",
    disponible: true,
    created_at: "2024-01-01T00:00:00Z",
    especie: "Trifasciata",
    familia: "Asparagaceae",
    interval_days: 14,
    image_url: null,
    last_watered: "2024-01-01T00:00:00Z",
  },
  ...overrides,
});

const createMockSwaps = (): FullSwap[] => [
  createMockSwap({
    id: 1,
    status: "pending",
    created_at: "2024-01-15T10:00:00Z",
  }),
  createMockSwap({
    id: 2,
    status: "accepted",
    created_at: "2024-01-10T10:00:00Z",
    sender: {
      id: "user3",
      username: "bob_wilson",
      email: "bob@example.com",
      created_at: "2024-01-01T00:00:00Z",
      cp: "12345",
      ciudad: "Test City",
      lat: 40.7128,
      lng: -74.006,
      avatar_url: null,
    },
    senderPlant: {
      id: 3,
      nombre_comun: "Peace Lily",
      nombre_cientifico: "Spathiphyllum",
      user_id: "user3",
      disponible: true,
      created_at: "2024-01-01T00:00:00Z",
      especie: "Wallisii",
      familia: "Araceae",
      interval_days: 10,
      image_url: null,
      last_watered: "2024-01-01T00:00:00Z",
    },
  }),
  createMockSwap({
    id: 3,
    status: "rejected",
    created_at: "2024-01-05T10:00:00Z",
    receiver: {
      id: "user4",
      username: "alice_cooper",
      email: "alice@example.com",
      created_at: "2024-01-01T00:00:00Z",
      cp: "12345",
      ciudad: "Test City",
      lat: 40.7128,
      lng: -74.006,
      avatar_url: null,
    },
    receiverPlant: {
      id: 4,
      nombre_comun: "Rubber Plant",
      nombre_cientifico: "Ficus elastica",
      user_id: "user4",
      disponible: true,
      created_at: "2024-01-01T00:00:00Z",
      especie: "Elastica",
      familia: "Moraceae",
      interval_days: 7,
      image_url: null,
      last_watered: "2024-01-01T00:00:00Z",
    },
  }),
  createMockSwap({
    id: 4,
    status: "completed",
    created_at: "2024-01-20T10:00:00Z",
  }),
];

describe("swapsFiltering", () => {
  describe("mapSwapStatus", () => {
    it("should map pending to NEW", () => {
      expect(mapSwapStatus("pending")).toBe(SWAP_STATUSES.NEW);
    });

    it("should map rejected to DECLINED", () => {
      expect(mapSwapStatus("rejected")).toBe(SWAP_STATUSES.DECLINED);
    });

    it("should map accepted to ACCEPTED", () => {
      expect(mapSwapStatus("accepted")).toBe(SWAP_STATUSES.ACCEPTED);
    });

    it("should map completed to COMPLETED", () => {
      expect(mapSwapStatus("completed")).toBe(SWAP_STATUSES.COMPLETED);
    });

    it("should return the same value for unknown status", () => {
      expect(mapSwapStatus("unknown_status")).toBe("unknown_status");
    });
  });

  describe("getSwapStatusBadgeVariant", () => {
    it("should return secondary for NEW status", () => {
      expect(getSwapStatusBadgeVariant(SWAP_STATUSES.NEW)).toBe("secondary");
    });

    it("should return default for ACCEPTED status", () => {
      expect(getSwapStatusBadgeVariant(SWAP_STATUSES.ACCEPTED)).toBe("default");
    });

    it("should return destructive for DECLINED status", () => {
      expect(getSwapStatusBadgeVariant(SWAP_STATUSES.DECLINED)).toBe(
        "destructive"
      );
    });

    it("should return outline for COMPLETED status", () => {
      expect(getSwapStatusBadgeVariant(SWAP_STATUSES.COMPLETED)).toBe(
        "outline"
      );
    });

    it("should return secondary for unknown status", () => {
      expect(getSwapStatusBadgeVariant("unknown" as any)).toBe("secondary");
    });
  });

  describe("filterAndSortSwaps", () => {
    const mockSwaps = createMockSwaps();
    const defaultFilters: SwapFilters = {
      searchQuery: "",
      activeStatuses: [],
      sortColumn: "created_at",
      sortDirection: "desc",
    };

    describe("filtering", () => {
      it("should return all swaps when no filters applied", () => {
        const result = filterAndSortSwaps(mockSwaps, defaultFilters);
        expect(result).toHaveLength(4);
      });

      it("should filter by search query - username", () => {
        const filters = { ...defaultFilters, searchQuery: "bob" };
        const result = filterAndSortSwaps(mockSwaps, filters);
        expect(result).toHaveLength(1);
        expect(result[0].sender?.username).toBe("bob_wilson");
      });

      it("should filter by search query - plant name", () => {
        const filters = { ...defaultFilters, searchQuery: "monstera" };
        const result = filterAndSortSwaps(mockSwaps, filters);
        expect(result).toHaveLength(3); // Three swaps have Monstera (all except Peace Lily)
        expect(
          result.every(
            (swap) =>
              swap.senderPlant?.nombre_comun
                ?.toLowerCase()
                .includes("monstera") ||
              swap.receiverPlant?.nombre_comun
                ?.toLowerCase()
                .includes("monstera") ||
              swap.senderPlant?.nombre_cientifico
                ?.toLowerCase()
                .includes("monstera") ||
              swap.receiverPlant?.nombre_cientifico
                ?.toLowerCase()
                .includes("monstera")
          )
        ).toBe(true);
      });

      it("should filter by search query - status", () => {
        const filters = { ...defaultFilters, searchQuery: "pending" };
        const result = filterAndSortSwaps(mockSwaps, filters);
        expect(result).toHaveLength(1);
        expect(result[0].status).toBe("pending");
      });

      it("should be case insensitive", () => {
        const filters = { ...defaultFilters, searchQuery: "MONSTERA" };
        const result = filterAndSortSwaps(mockSwaps, filters);
        expect(result).toHaveLength(3);
      });

      it("should filter by active statuses", () => {
        const filters = {
          ...defaultFilters,
          activeStatuses: [SWAP_STATUSES.ACCEPTED, SWAP_STATUSES.COMPLETED],
        };
        const result = filterAndSortSwaps(mockSwaps, filters);
        expect(result).toHaveLength(2);
        expect(
          result.every(
            (s) => s.status === "accepted" || s.status === "completed"
          )
        ).toBe(true);
      });

      it("should combine search and status filters", () => {
        const filters = {
          ...defaultFilters,
          searchQuery: "monstera",
          activeStatuses: [SWAP_STATUSES.NEW],
        };
        const result = filterAndSortSwaps(mockSwaps, filters);
        expect(result).toHaveLength(1);
        expect(result[0].status).toBe("pending");
      });
    });

    describe("sorting", () => {
      it("should sort by created_at desc by default", () => {
        const result = filterAndSortSwaps(mockSwaps, defaultFilters);
        const dates = result.map((s) => new Date(s.created_at).getTime());
        for (let i = 1; i < dates.length; i++) {
          expect(dates[i - 1]).toBeGreaterThanOrEqual(dates[i]);
        }
      });

      it("should sort by created_at asc", () => {
        const filters = { ...defaultFilters, sortDirection: "asc" as const };
        const result = filterAndSortSwaps(mockSwaps, filters);
        const dates = result.map((s) => new Date(s.created_at).getTime());
        for (let i = 1; i < dates.length; i++) {
          expect(dates[i - 1]).toBeLessThanOrEqual(dates[i]);
        }
      });

      it("should sort by status (string field)", () => {
        const filters = {
          ...defaultFilters,
          sortColumn: "status" as const,
          sortDirection: "asc" as const,
        };
        const result = filterAndSortSwaps(mockSwaps, filters);
        const statuses = result.map((s) => s.status);
        const sortedStatuses = [...statuses].sort();
        expect(statuses).toEqual(sortedStatuses);
      });

      it("should handle number fields", () => {
        const filters = {
          ...defaultFilters,
          sortColumn: "id" as const,
          sortDirection: "asc" as const,
        };
        const result = filterAndSortSwaps(mockSwaps, filters);
        const ids = result.map((s) => s.id);
        for (let i = 1; i < ids.length; i++) {
          expect(ids[i - 1]).toBeLessThanOrEqual(ids[i]);
        }
      });
    });

    describe("edge cases", () => {
      it("should handle empty array", () => {
        const result = filterAndSortSwaps([], defaultFilters);
        expect(result).toEqual([]);
      });

      it("should handle empty search query", () => {
        const filters = { ...defaultFilters, searchQuery: "   " };
        const result = filterAndSortSwaps(mockSwaps, filters);
        expect(result).toHaveLength(4);
      });

      it("should handle no matching results", () => {
        const filters = { ...defaultFilters, searchQuery: "nonexistent" };
        const result = filterAndSortSwaps(mockSwaps, filters);
        expect(result).toEqual([]);
      });
    });
  });

  describe("isSortableColumn", () => {
    it("should return true for sortable columns", () => {
      const sortableColumns = DOMAIN_FILTER_TYPES.SWAPS.SORT_BY;
      sortableColumns.forEach((column) => {
        expect(isSortableColumn(column)).toBe(true);
      });
    });

    it("should return false for non-sortable columns", () => {
      expect(isSortableColumn("non_existent_column" as any)).toBe(false);
    });
  });

  describe("getSwapStatistics", () => {
    const mockSwaps = createMockSwaps();

    it("should calculate correct statistics", () => {
      const stats = getSwapStatistics(mockSwaps);

      expect(stats.total).toBe(4);
      expect(stats.new).toBe(1);
      expect(stats.accepted).toBe(1);
      expect(stats.declined).toBe(1);
      expect(stats.completed).toBe(1);
    });

    it("should handle empty array", () => {
      const stats = getSwapStatistics([]);

      expect(stats.total).toBe(0);
      expect(stats.new).toBe(0);
      expect(stats.accepted).toBe(0);
      expect(stats.declined).toBe(0);
      expect(stats.completed).toBe(0);
    });

    it("should include byStatus breakdown", () => {
      const stats = getSwapStatistics(mockSwaps);

      expect(stats.byStatus).toEqual({
        [SWAP_STATUSES.NEW]: 1,
        [SWAP_STATUSES.ACCEPTED]: 1,
        [SWAP_STATUSES.DECLINED]: 1,
        [SWAP_STATUSES.COMPLETED]: 1,
      });
    });
  });

  describe("createSortableHeaderProps", () => {
    const mockOnSort = jest.fn();

    beforeEach(() => {
      mockOnSort.mockClear();
    });

    it("should create correct props for active column", () => {
      const props = createSortableHeaderProps(
        "created_at",
        "Date Created",
        "created_at",
        mockOnSort
      );

      expect(props).toEqual({
        column: "created_at",
        label: "Date Created",
        isActive: true,
        onClick: expect.any(Function),
        className:
          "flex items-center cursor-pointer hover:text-primary transition-colors duration-200",
        iconClassName:
          "w-4 h-4 ml-1 transition-colors duration-200 text-primary",
      });
    });

    it("should create correct props for inactive column", () => {
      const props = createSortableHeaderProps(
        "status",
        "Status",
        "created_at",
        mockOnSort
      );

      expect(props).toEqual({
        column: "status",
        label: "Status",
        isActive: false,
        onClick: expect.any(Function),
        className:
          "flex items-center cursor-pointer hover:text-primary transition-colors duration-200",
        iconClassName:
          "w-4 h-4 ml-1 transition-colors duration-200 text-muted-foreground",
      });
    });

    it("should call onSort when onClick is triggered", () => {
      const props = createSortableHeaderProps(
        "status",
        "Status",
        "created_at",
        mockOnSort
      );

      props.onClick();
      expect(mockOnSort).toHaveBeenCalledWith("status");
    });
  });

  describe("SWAPS_DEFAULT_CONFIG", () => {
    it("should have correct default values", () => {
      expect(SWAPS_DEFAULT_CONFIG.SORT_COLUMN).toBe("created_at");
      expect(SWAPS_DEFAULT_CONFIG.SORT_DIRECTION).toBe("desc");
    });
  });
});
