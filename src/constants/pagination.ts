/**
 * 📄 Centralized pagination constants
 *
 * Different content types use different optimal page sizes
 * based on layout (cards vs table) and content density.
 */

// 📊 Items per page configurations for different content types
export const PAGINATION_SIZES = {
  /**
   * Card layouts (like Home page plant browsing)
   * Larger page size works well with grid layouts
   */
  CARDS: 9,

  /**
   * Table layouts (like Plants, Swaps management)
   * Smaller page size reduces scrolling in dense tables
   */
  TABLE: 5,

  /**
   * Grid layouts (like Events page)
   * Medium page size balances content and performance
   */
  GRID: 6,

  /**
   * List layouts for compact content
   */
  LIST: 8,
} as const;

// 🎯 Default pagination settings
export const DEFAULT_PAGINATION = {
  /**
   * Default page number (1-based indexing)
   */
  startPage: 1,

  /**
   * Default items per page (fallback if type not specified)
   */
  defaultSize: PAGINATION_SIZES.TABLE,

  /**
   * Maximum items per page (performance safety)
   */
  maxSize: 50,
} as const;

// 🔢 Pagination display configuration
export const PAGINATION_CONFIG = {
  /**
   * Show pagination controls only if total pages > 1
   */
  showIfSinglePage: false,

  /**
   * Maximum number of page buttons to show in pagination
   */
  maxVisiblePages: 7,

  /**
   * Show "..." ellipsis when there are many pages
   */
  showEllipsis: true,
} as const;

// 📋 Content type to pagination size mapping
export const CONTENT_PAGINATION_MAP = {
  plants: PAGINATION_SIZES.CARDS, // Home page plant browsing
  userPlants: PAGINATION_SIZES.TABLE, // My Plants management
  events: PAGINATION_SIZES.GRID, // Events browsing
  swappoints: PAGINATION_SIZES.GRID, // Swap points browsing
  swaps: PAGINATION_SIZES.TABLE, // Swap management
  users: PAGINATION_SIZES.LIST, // User listings
} as const;

// 🎨 Pagination UI text configurations
export const PAGINATION_LABELS = {
  previous: "Previous",
  next: "Next",
  showingTemplate: "Showing {start}–{end} of {total}",
  page: "Page",
  goToPage: "Go to page",
  itemsPerPage: "Items per page",
} as const;
