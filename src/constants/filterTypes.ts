export const COMMON_FILTERS = {
  ALL: "all",

  AVAILABILITY: ["all", "available", "unavailable"] as const,

  SORT_DIRECTIONS: ["asc", "desc"] as const,

  TIME_FILTERS: ["all", "upcoming", "past"] as const,

  ACTIVE_STATUS: ["all", "active", "inactive"] as const,
} as const;

export const DOMAIN_FILTER_TYPES = {
  PLANTS: {
    STATUS: ["all", "available", "unavailable"] as const,
    CARE_LEVEL: ["all", "easy", "medium", "hard"] as const,
    SIZE: ["all", "small", "medium", "large"] as const,
    LIGHT_REQUIREMENTS: ["all", "low", "medium", "high"] as const,
    SORT_BY: ["name", "created_at", "updated_at", "care_level"] as const,
  },

  EVENTS: {
    STATUS: ["all", "upcoming", "past"] as const,
    TYPE: ["all", "workshop", "exchange", "community"] as const,
    LOCATION: ["all", "online", "in-person"] as const,
    SORT_BY: ["date", "name", "created_at", "location"] as const,
  },

  SWAPS: {
    PARTICIPANT_ROLE: ["all", "proposer", "receiver"] as const,
    COMPLETION_STATUS: ["all", "in-progress", "completed"] as const,
    SORT_BY: ["created_at", "updated_at", "status"] as const,
  },

  USERS: {
    STATUS: ["all", "active", "inactive"] as const,
    ROLE: ["all", "user", "moderator", "admin"] as const,
    ACTIVITY_LEVEL: ["all", "high", "medium", "low"] as const,
    SORT_BY: ["username", "created_at", "last_active", "plant_count"] as const,
  },
} as const;

export const FILTER_PATTERNS = {
  SEARCH_AND_STATUS: {
    search: { type: "text", placeholder: "Search..." },
    status: { type: "status", options: COMMON_FILTERS.AVAILABILITY },
  },

  COMPREHENSIVE: {
    search: { type: "text", placeholder: "Search..." },
    status: { type: "status", options: COMMON_FILTERS.AVAILABILITY },
    sortBy: { type: "sort", options: ["name", "created_at", "updated_at"] },
    sortDirection: { type: "sort", options: COMMON_FILTERS.SORT_DIRECTIONS },
  },

  MULTI_STATUS: {
    search: { type: "text", placeholder: "Search..." },
    statuses: { type: "multiStatus", options: [] }, // Populated per domain
  },
} as const;

export const FILTER_INTEGRATION = {
  createStatusOptions: <T extends readonly string[]>(options: T) =>
    ["all", ...options] as const,

  createSortOptions: <T extends readonly string[]>(domainFields: T) =>
    [...domainFields, "created_at", "updated_at"] as const,

  mergeWithCommon: <T extends Record<string, readonly string[]>>(
    domainFilters: T,
    commonPattern: keyof typeof COMMON_FILTERS = "AVAILABILITY"
  ) => ({
    ...domainFilters,
    common: COMMON_FILTERS[commonPattern],
  }),
} as const;

export type CommonFilterType =
  (typeof COMMON_FILTERS)[keyof typeof COMMON_FILTERS][number];

type ExtractFilterValues<T> = T extends readonly (infer U)[] ? U : never;

export type DomainFilterType<T extends keyof typeof DOMAIN_FILTER_TYPES> = {
  [K in keyof (typeof DOMAIN_FILTER_TYPES)[T]]: ExtractFilterValues<
    (typeof DOMAIN_FILTER_TYPES)[T][K]
  >;
}[keyof (typeof DOMAIN_FILTER_TYPES)[T]];

export type PlantFilterType = DomainFilterType<"PLANTS">;
export type PlantStatusFilter =
  (typeof DOMAIN_FILTER_TYPES.PLANTS.STATUS)[number];
export type PlantSortField =
  (typeof DOMAIN_FILTER_TYPES.PLANTS.SORT_BY)[number];

export type EventFilterType = DomainFilterType<"EVENTS">;
export type EventStatusFilter =
  (typeof DOMAIN_FILTER_TYPES.EVENTS.STATUS)[number];
export type EventSortField =
  (typeof DOMAIN_FILTER_TYPES.EVENTS.SORT_BY)[number];

export type SwapFilterType = DomainFilterType<"SWAPS">;
export type SwapSortField = (typeof DOMAIN_FILTER_TYPES.SWAPS.SORT_BY)[number];

export type UserFilterType = DomainFilterType<"USERS">;
export type UserStatusFilter =
  (typeof DOMAIN_FILTER_TYPES.USERS.STATUS)[number];
export type UserSortField = (typeof DOMAIN_FILTER_TYPES.USERS.SORT_BY)[number];
