/**
 * @fileoverview Centralized filter type definitions and reusable filter arrays
 *
 * This file provides standardized filter type arrays and patterns used across
 * different domain pages (Plants, Events, Swaps, Users). It complements the
 * existing filteringPresets.ts system by providing the raw filter options
 * and type definitions.
 *
 * Relationship to existing filtering system:
 * - Works alongside /src/config/filteringPresets.ts
 * - Provides the base filter arrays used in preset configurations
 * - Offers reusable patterns for consistent filtering UX
 * - Integrates with /src/hooks/useFiltering.ts and FilterBar components
 *
 * Usage:
 * ```typescript
 * import { DOMAIN_FILTER_TYPES, COMMON_FILTERS } from '@/constants/filterTypes';
 *
 * // Use in filteringPresets.ts
 * export const plantsPreset = {
 *   filters: [
 *     { key: 'status', type: 'status', options: DOMAIN_FILTER_TYPES.PLANTS.STATUS }
 *   ]
 * };
 * ```
 */

/**
 * Common filter patterns used across multiple domains.
 *
 * These are universal filter types that appear in different contexts
 * but follow the same pattern (e.g., "all" + specific options).
 */
export const COMMON_FILTERS = {
  /**
   * Universal "all" option for inclusive filtering.
   * Used as the first option in most filter arrays.
   */
  ALL: "all",

  /**
   * Common availability states for items.
   * Used across plants, swap points, and other resources.
   */
  AVAILABILITY: ["all", "available", "unavailable"] as const,

  /**
   * Common sort directions for consistent ordering UX.
   */
  SORT_DIRECTIONS: ["asc", "desc"] as const,

  /**
   * Standard time-based filters for events and activities.
   */
  TIME_FILTERS: ["all", "upcoming", "past"] as const,

  /**
   * Common status patterns for active/inactive states.
   */
  ACTIVE_STATUS: ["all", "active", "inactive"] as const,
} as const;

/**
 * Domain-specific filter type definitions.
 *
 * Each domain (Plants, Events, Swaps, Users) has its own set of filter
 * options that are specific to that context. These arrays provide the
 * raw filter values used in filteringPresets configurations.
 *
 * TODO: During page refactoring, extract hardcoded filter arrays from:
 * - Plants.tsx: FILTER_TYPES = ["all", "available", "unavailable"]
 * - Events.tsx: FILTER_TYPES = ["all", "upcoming", "past"]
 * - Swaps.tsx: SORTABLE_COLUMNS and status filters
 */
export const DOMAIN_FILTER_TYPES = {
  /**
   * Plant-specific filter options.
   *
   * Used in Home.tsx, Plants.tsx, and plant-related components.
   * Relates to plant availability, care requirements, and characteristics.
   *
   * TODO: Extract from Plants.tsx during refactoring
   */
  PLANTS: {
    STATUS: ["all", "available", "unavailable"] as const,
    CARE_LEVEL: ["all", "easy", "medium", "hard"] as const,
    SIZE: ["all", "small", "medium", "large"] as const,
    LIGHT_REQUIREMENTS: ["all", "low", "medium", "high"] as const,
    SORT_BY: ["name", "created_at", "updated_at", "care_level"] as const,
  },

  /**
   * Event-specific filter options.
   *
   * Used in Events.tsx and event-related components.
   * Focuses on timing, location, and event characteristics.
   *
   * TODO: Extract from Events.tsx during refactoring
   */
  EVENTS: {
    STATUS: ["all", "upcoming", "past"] as const,
    TYPE: ["all", "workshop", "exchange", "community"] as const,
    LOCATION: ["all", "online", "in-person"] as const,
    SORT_BY: ["date", "name", "created_at", "location"] as const,
  },

  /**
   * Swap-specific filter options.
   *
   * Used in Swaps.tsx, SwapInfoModal.tsx, and swap-related components.
   * Centers on swap lifecycle, participants, and transaction status.
   *
   * References status.ts for swap status values.
   * TODO: Extract from Swaps.tsx during refactoring
   */
  SWAPS: {
    // Note: Status values come from /src/constants/status.ts SWAP_STATUS_FILTERS
    PARTICIPANT_ROLE: ["all", "proposer", "receiver"] as const,
    COMPLETION_STATUS: ["all", "in-progress", "completed"] as const,
    SORT_BY: ["created_at", "updated_at", "status"] as const,
  },

  /**
   * User-specific filter options.
   *
   * Used in user directory, admin panels, and user-related components.
   * Focuses on user activity, location, and engagement metrics.
   */
  USERS: {
    STATUS: ["all", "active", "inactive"] as const,
    ROLE: ["all", "user", "moderator", "admin"] as const,
    ACTIVITY_LEVEL: ["all", "high", "medium", "low"] as const,
    SORT_BY: ["username", "created_at", "last_active", "plant_count"] as const,
  },
} as const;

/**
 * Filter configuration patterns for different UI components.
 *
 * Provides standardized filter configurations that can be reused
 * across different pages and components. These patterns integrate
 * with the FilterBar and FilterButtons components.
 */
export const FILTER_PATTERNS = {
  /**
   * Standard search + status filter pattern.
   * Most common filtering combination across the app.
   */
  SEARCH_AND_STATUS: {
    search: { type: "text", placeholder: "Search..." },
    status: { type: "status", options: COMMON_FILTERS.AVAILABILITY },
  },

  /**
   * Full filtering pattern with search, status, and sort.
   * Comprehensive filtering for complex data views.
   */
  COMPREHENSIVE: {
    search: { type: "text", placeholder: "Search..." },
    status: { type: "status", options: COMMON_FILTERS.AVAILABILITY },
    sortBy: { type: "sort", options: ["name", "created_at", "updated_at"] },
    sortDirection: { type: "sort", options: COMMON_FILTERS.SORT_DIRECTIONS },
  },

  /**
   * Multi-status filter pattern for complex status management.
   * Used in components that need to filter by multiple status values.
   */
  MULTI_STATUS: {
    search: { type: "text", placeholder: "Search..." },
    statuses: { type: "multiStatus", options: [] }, // Populated per domain
  },
} as const;

/**
 * Integration helpers for connecting with existing filtering system.
 *
 * These utilities help bridge the gap between these raw filter types
 * and the existing filteringPresets.ts configuration system.
 */
export const FILTER_INTEGRATION = {
  /**
   * Helper to create status filter options with "all" prefix.
   * Standardizes the pattern of ['all', ...specificOptions].
   */
  createStatusOptions: <T extends readonly string[]>(options: T) =>
    ["all", ...options] as const,

  /**
   * Helper to create sort options from domain-specific fields.
   * Adds common sort fields to domain-specific ones.
   */
  createSortOptions: <T extends readonly string[]>(domainFields: T) =>
    [...domainFields, "created_at", "updated_at"] as const,

  /**
   * Helper to merge common filters with domain-specific ones.
   * Ensures consistent base filtering capabilities.
   */
  mergeWithCommon: <T extends Record<string, readonly string[]>>(
    domainFilters: T,
    commonPattern: keyof typeof COMMON_FILTERS = "AVAILABILITY"
  ) => ({
    ...domainFilters,
    common: COMMON_FILTERS[commonPattern],
  }),
} as const;

/**
 * Type definitions for filter type arrays and configurations.
 *
 * Provides type safety when using filter constants and ensures
 * compatibility with existing filtering system types.
 */
export type CommonFilterType =
  (typeof COMMON_FILTERS)[keyof typeof COMMON_FILTERS][number];

// Helper type to extract values from domain filter arrays
type ExtractFilterValues<T> = T extends readonly (infer U)[] ? U : never;

export type DomainFilterType<T extends keyof typeof DOMAIN_FILTER_TYPES> = {
  [K in keyof (typeof DOMAIN_FILTER_TYPES)[T]]: ExtractFilterValues<
    (typeof DOMAIN_FILTER_TYPES)[T][K]
  >;
}[keyof (typeof DOMAIN_FILTER_TYPES)[T]];

/**
 * Plant filter types for type safety in plant-related components.
 */
export type PlantFilterType = DomainFilterType<"PLANTS">;
export type PlantStatusFilter =
  (typeof DOMAIN_FILTER_TYPES.PLANTS.STATUS)[number];
export type PlantSortField =
  (typeof DOMAIN_FILTER_TYPES.PLANTS.SORT_BY)[number];

/**
 * Event filter types for type safety in event-related components.
 */
export type EventFilterType = DomainFilterType<"EVENTS">;
export type EventStatusFilter =
  (typeof DOMAIN_FILTER_TYPES.EVENTS.STATUS)[number];
export type EventSortField =
  (typeof DOMAIN_FILTER_TYPES.EVENTS.SORT_BY)[number];

/**
 * Swap filter types for type safety in swap-related components.
 */
export type SwapFilterType = DomainFilterType<"SWAPS">;
export type SwapSortField = (typeof DOMAIN_FILTER_TYPES.SWAPS.SORT_BY)[number];

/**
 * User filter types for type safety in user-related components.
 */
export type UserFilterType = DomainFilterType<"USERS">;
export type UserStatusFilter =
  (typeof DOMAIN_FILTER_TYPES.USERS.STATUS)[number];
export type UserSortField = (typeof DOMAIN_FILTER_TYPES.USERS.SORT_BY)[number];

/**
 * Migration notes for existing pages:
 *
 * When refactoring pages to use these constants:
 *
 * 1. Plants.tsx:
 *    - Replace local FILTER_TYPES with DOMAIN_FILTER_TYPES.PLANTS.STATUS
 *    - Update filteringPresets.ts to use these constants
 *
 * 2. Events.tsx:
 *    - Replace local FILTER_TYPES with DOMAIN_FILTER_TYPES.EVENTS.STATUS
 *    - Add event-specific filtering preset configuration
 *
 * 3. Swaps.tsx:
 *    - Replace SORTABLE_COLUMNS with DOMAIN_FILTER_TYPES.SWAPS.SORT_BY
 *    - Integrate with status.ts for swap status filtering
 *    - Update filtering preset to use centralized constants
 *
 * 4. Update filteringPresets.ts:
 *    - Import relevant constants from this file
 *    - Replace hardcoded arrays with references to these constants
 *    - Maintain backward compatibility during transition
 */
