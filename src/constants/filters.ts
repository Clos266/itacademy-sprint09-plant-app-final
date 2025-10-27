/**
 * 🔍 Centralized filtering constants for the application
 *
 * Extracted from multiple page components to ensure consistency
 * across the filtering system and reduce duplication.
 */

// 🌱 Plant availability filters (used in Home, Plants pages)
export const AVAILABILITY_FILTERS = [
  "all",
  "available",
  "unavailable",
] as const;

// 📅 Event date-based filters (used in Events page)
export const EVENT_DATE_FILTERS = ["all", "upcoming", "past"] as const;

// 🔄 Swap status filters (used in Swaps page)
export const SWAP_STATUS_FILTERS = [
  "new",
  "accepted",
  "declined",
  "completed",
] as const;

// 🔤 Sortable directions for table columns
export const SORT_DIRECTIONS = ["asc", "desc"] as const;

// 🏷️ Filter component display configurations
export const FILTER_DISPLAY_CONFIG = {
  /**
   * Common filter button styling and behavior
   */
  button: {
    size: "sm" as const,
    activeVariant: "default" as const,
    inactiveVariant: "outline" as const,
    className: "transition-colors duration-200",
  },

  /**
   * Toggle component styling for multi-select filters
   */
  toggle: {
    className: "transition-all duration-200",
    activeClassName: "bg-primary text-white shadow-md",
    inactiveClassName:
      "border border-muted-foreground text-muted-foreground hover:bg-muted hover:border-primary",
  },
} as const;

// 📝 Search placeholder text configurations
export const SEARCH_PLACEHOLDERS = {
  plants: "Search plants or species...",
  userPlants: "Search your plants...",
  events: "Search events...",
  swappoints: "Search swap points...",
  swaps: "Search swaps by user, plants, or status...",
  users: "Search users...",
} as const;

// 🎯 Empty state messages for filtered results
export const EMPTY_STATE_MESSAGES = {
  plants: "No plants found.",
  events: "No events found.",
  swappoints: "No swap points found.",
  swaps: "No swaps found.",
  filtered: "No results match your current filters.",
  search: "No results found for your search.",
} as const;

// 🔢 Default values for filter states
export const DEFAULT_FILTER_VALUES = {
  search: "",
  availability: "all" as const,
  eventDate: "all" as const,
  swapStatus: [] as string[],
  sortDirection: "desc" as const,
} as const;
