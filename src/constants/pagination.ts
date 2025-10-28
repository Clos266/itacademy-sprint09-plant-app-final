export const PAGINATION_SIZES = {
  CARDS: 9,

  TABLE: 5,

  GRID: 6,

  LIST: 8,
} as const;

export const DEFAULT_PAGINATION = {
  startPage: 1,

  defaultSize: PAGINATION_SIZES.TABLE,

  maxSize: 50,
} as const;

export const PAGINATION_CONFIG = {
  showIfSinglePage: false,

  maxVisiblePages: 7,

  showEllipsis: true,
} as const;

export const CONTENT_PAGINATION_MAP = {
  plants: PAGINATION_SIZES.CARDS,
  userPlants: PAGINATION_SIZES.TABLE,
  events: PAGINATION_SIZES.GRID,
  swappoints: PAGINATION_SIZES.GRID,
  swaps: PAGINATION_SIZES.TABLE,
  users: PAGINATION_SIZES.LIST,
} as const;

export const PAGINATION_LABELS = {
  previous: "Previous",
  next: "Next",
  showingTemplate: "Showing {start}–{end} of {total}",
  page: "Page",
  goToPage: "Go to page",
  itemsPerPage: "Items per page",
} as const;
