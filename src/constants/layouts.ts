/**
 * @fileoverview Centralized layout and grid configuration constants
 *
 * This file provides reusable layout configurations for consistent UI patterns
 * across different pages and components. It centralizes grid systems, spacing,
 * and responsive design patterns used throughout the PlantApp.
 *
 * Usage:
 * - Import grid configurations for consistent card layouts
 * - Use spacing constants for uniform gaps and margins
 * - Apply responsive breakpoint patterns across components
 *
 * @example
 * ```typescript
 * import { GRID_CONFIGS, SPACING } from '@/constants/layouts';
 *
 * const MyGridComponent = () => (
 *   <div className={GRID_CONFIGS.CARDS.CONTAINER}>
 *     {items.map(item => (
 *       <div key={item.id} className={GRID_CONFIGS.CARDS.ITEM}>
 *         {item.content}
 *       </div>
 *     ))}
 *   </div>
 * );
 * ```
 */

/**
 * Standard grid configuration patterns used across the application.
 *
 * Provides consistent grid layouts for different content types:
 * - CARDS: For plant cards, event cards, swap cards
 * - LIST: For table-like data presentation
 * - GALLERY: For image-focused content
 *
 * Used in:
 * - EventsPage.tsx (event cards grid)
 * - SwapsPage.tsx (swap cards layout)
 * - Home.tsx (plant cards display)
 * - Various modal components
 */
export const GRID_CONFIGS = {
  /**
   * Standard card grid layout - responsive 1-2-3 column pattern.
   * Optimized for content cards with images and metadata.
   */
  CARDS: {
    CONTAINER: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
    ITEM: "bg-background border rounded-lg overflow-hidden hover:shadow-md transition-shadow",
    IMAGE: "w-full h-full object-cover",
    CONTENT: "p-4",
    TITLE: "font-semibold text-lg mb-2",
    DESCRIPTION: "text-sm text-muted-foreground mb-4",
    ACTIONS: "flex justify-between items-center",
  },

  /**
   * List-style layout for data tables and structured content.
   * Provides consistent spacing and hover states.
   */
  LIST: {
    CONTAINER: "space-y-4",
    ITEM: "flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors",
    AVATAR: "w-12 h-12 rounded-full object-cover",
    CONTENT: "flex-1 min-w-0",
    TITLE: "font-medium truncate",
    SUBTITLE: "text-sm text-muted-foreground truncate",
    ACTIONS: "flex gap-2 shrink-0",
  },

  /**
   * Gallery layout for image-heavy content.
   * Responsive grid with consistent aspect ratios.
   */
  GALLERY: {
    CONTAINER: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4",
    ITEM: "aspect-square bg-muted rounded-lg overflow-hidden group cursor-pointer",
    IMAGE:
      "w-full h-full object-cover group-hover:scale-105 transition-transform duration-200",
    OVERLAY:
      "absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors",
  },
} as const;

/**
 * Standard spacing and sizing constants for consistent UI.
 *
 * Provides uniform spacing patterns and component dimensions
 * to maintain visual consistency across the application.
 */
export const SPACING = {
  /**
   * Page-level spacing constants.
   */
  PAGE: {
    PADDING: "p-6",
    CONTAINER: "max-w-7xl mx-auto",
    HEADER_MARGIN: "mb-8",
    SECTION_GAP: "space-y-6",
  },

  /**
   * Component spacing patterns.
   */
  COMPONENT: {
    SMALL_GAP: "gap-2",
    MEDIUM_GAP: "gap-4",
    LARGE_GAP: "gap-6",
    PADDING_SMALL: "p-2",
    PADDING_MEDIUM: "p-4",
    PADDING_LARGE: "p-6",
  },

  /**
   * Form and input spacing.
   */
  FORM: {
    FIELD_GAP: "space-y-4",
    LABEL_MARGIN: "mb-2",
    BUTTON_GAP: "gap-3",
    SECTION_SPACING: "space-y-6",
  },
} as const;

/**
 * Responsive breakpoint helpers for consistent responsive design.
 *
 * Standardizes responsive patterns used across components.
 * Use these instead of hardcoding breakpoint classes.
 */
export const RESPONSIVE = {
  /**
   * Hide/show patterns for different screen sizes.
   */
  VISIBILITY: {
    MOBILE_ONLY: "md:hidden",
    DESKTOP_ONLY: "hidden md:block",
    TABLET_UP: "hidden md:block",
    LARGE_UP: "hidden lg:block",
  },

  /**
   * Flexible grid column patterns.
   */
  COLUMNS: {
    AUTO_FIT_CARDS: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    TWO_COLUMN: "grid-cols-1 md:grid-cols-2",
    THREE_COLUMN: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    FOUR_COLUMN: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  },

  /**
   * Text size responsive patterns.
   */
  TEXT: {
    HEADING_LARGE: "text-2xl md:text-3xl lg:text-4xl",
    HEADING_MEDIUM: "text-xl md:text-2xl",
    HEADING_SMALL: "text-lg md:text-xl",
  },
} as const;

/**
 * Page-specific layout configurations.
 *
 * TODO: These will be populated as pages are refactored to use centralized layouts.
 * Each section represents a specific page's layout requirements.
 */
export const PAGE_LAYOUTS = {
  /**
   * Events page grid configuration.
   * TODO: Extract from EventsPage.tsx during refactoring.
   *
   * Planned structure:
   * - Event cards in responsive grid
   * - Filter bar integration
   * - Loading state placeholders
   */
  EVENTS: {
    // Placeholder for EventsPage layout constants
    // Will be populated during Events.tsx refactoring
  },

  /**
   * Swaps page layout configuration.
   * TODO: Extract from SwapsPage.tsx during refactoring.
   *
   * Planned structure:
   * - Swap cards/list toggle
   * - Status-based styling
   * - Pagination layout
   */
  SWAPS: {
    // Placeholder for SwapsPage layout constants
    // Will be populated during Swaps.tsx refactoring
  },

  /**
   * Plants page layout configuration.
   * TODO: Extract from Home.tsx and Plants.tsx during refactoring.
   *
   * Planned structure:
   * - Plant cards grid
   * - Filter sidebar integration
   * - Search result layouts
   */
  PLANTS: {
    // Placeholder for Plants page layout constants
    // Will be populated during Plants.tsx refactoring
  },

  /**
   * Profile and user-related page layouts.
   * TODO: Extract from profile components during refactoring.
   */
  PROFILE: {
    // Placeholder for profile layout constants
    // Will be populated during profile component refactoring
  },
} as const;

/**
 * Animation and transition constants for consistent motion design.
 *
 * Provides standardized animation patterns used across interactive elements.
 */
export const ANIMATIONS = {
  /**
   * Transition duration constants.
   */
  DURATION: {
    FAST: "duration-150",
    NORMAL: "duration-200",
    SLOW: "duration-300",
    SLOWER: "duration-500",
  },

  /**
   * Common transition patterns.
   */
  TRANSITIONS: {
    DEFAULT: "transition-colors duration-200",
    TRANSFORM: "transition-transform duration-200",
    SHADOW: "transition-shadow duration-200",
    ALL: "transition-all duration-200",
  },

  /**
   * Hover and interaction effects.
   */
  EFFECTS: {
    HOVER_LIFT:
      "hover:shadow-md hover:-translate-y-1 transition-all duration-200",
    HOVER_SCALE: "hover:scale-105 transition-transform duration-200",
    HOVER_BRIGHTNESS: "hover:brightness-110 transition-all duration-200",
  },
} as const;

/**
 * Type definitions for layout configurations.
 * Ensures type safety when using layout constants.
 */
export type GridConfig = (typeof GRID_CONFIGS)[keyof typeof GRID_CONFIGS];
export type SpacingConfig = (typeof SPACING)[keyof typeof SPACING];
export type ResponsiveConfig = (typeof RESPONSIVE)[keyof typeof RESPONSIVE];
