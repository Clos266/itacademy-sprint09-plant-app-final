/**
 * 🎯 Centralized filtering configuration presets
 *
 * This file contains domain-specific filtering behavior configurations for different
 * pages and components throughout the application. Each preset defines the search fields,
 * sorting options, and custom filter functions that are specific to a particular data type.
 *
 * Benefits:
 * - Separates filtering configuration from hook logic
 * - Makes filtering behavior easy to modify per domain
 * - Provides reusable configurations across multiple components
 * - Enables consistent filtering patterns throughout the app
 *
 * Usage:
 * ```tsx
 * import { FilteringPresets } from "@/config/filteringPresets";
 *
 * const { filteredItems } = useFiltering(items, FilteringPresets.plants);
 * ```
 */

/**
 * 🎯 Preset configurations for common filtering scenarios
 *
 * Each preset contains:
 * - searchFields: Array of object keys to search within
 * - defaultSort: Default sorting field and direction
 * - dateField: Field to use for date-based filtering (optional)
 * - customFilters: Domain-specific filter functions
 */
export const FilteringPresets = {
  /**
   * 🌱 Plant filtering configuration (Home, Plants pages)
   *
   * Supports searching across plant names and species, with availability-based filtering.
   * Default sort by creation date (newest first) with available plants prioritized.
   */
  plants: {
    searchFields: ["nombre_comun", "nombre_cientifico", "especie"],
    defaultSort: { field: "created_at", direction: "desc" as const },
    customFilters: {
      availability: (plant: any, value: string) => {
        if (value === "available") return plant.disponible;
        if (value === "unavailable") return !plant.disponible;
        return true; // "all"
      },
    },
  },

  /**
   * 📅 Event filtering configuration (Events page)
   *
   * Supports searching event titles and locations, with date-based filtering for
   * upcoming vs past events. Default sort by event date (newest first).
   */
  events: {
    searchFields: ["title", "location"],
    dateField: "date",
    defaultSort: { field: "date", direction: "desc" as const },
    customFilters: {
      upcoming: (event: any, _value: any) => new Date(event.date) > new Date(),
      past: (event: any, _value: any) => new Date(event.date) <= new Date(),
    },
  },

  /**
   * 🔄 Swap filtering configuration (Swaps page)
   *
   * Supports searching across user names and plant names involved in swaps.
   * Includes multi-status filtering for swap states. Default sort by creation date.
   */
  swaps: {
    searchFields: [
      "receiver.username",
      "senderPlant.nombre_comun",
      "receiverPlant.nombre_comun",
    ],
    defaultSort: { field: "created_at", direction: "desc" as const },
    customFilters: {
      multiStatus: (swap: any, statusArray: string[]) => {
        if (statusArray.length === 0) return true;
        // Note: mapSwapStatus function would need to be imported or passed in
        return statusArray.includes(swap.status);
      },
    },
  },

  /**
   * 🏪 Swap Points filtering configuration (Events page - swap points tab)
   *
   * Simple name-based search for swap point locations and descriptions.
   */
  swapPoints: {
    searchFields: ["name", "description", "address", "city"],
    defaultSort: { field: "created_at", direction: "desc" as const },
    customFilters: {},
  },

  /**
   * 👥 User filtering configuration (for user listing pages)
   *
   * Search across user profile information including username and location.
   */
  users: {
    searchFields: ["username", "ciudad", "email"],
    defaultSort: { field: "created_at", direction: "desc" as const },
    customFilters: {
      active: (user: any, _value: any) =>
        user.last_seen &&
        new Date(user.last_seen) >
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Active in last 7 days
    },
  },
} as const;

/**
 * 🔧 Type helper to extract preset names
 * Useful for type-safe preset selection in components
 */
export type FilteringPresetName = keyof typeof FilteringPresets;

/**
 * 🔧 Type helper to get the configuration type for a specific preset
 */
export type FilteringPresetConfig<T extends FilteringPresetName> =
  (typeof FilteringPresets)[T];
