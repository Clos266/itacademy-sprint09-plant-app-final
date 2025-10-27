/**
 * @fileoverview Centralized status constants for the PlantApp application
 *
 * This file provides type-safe status definitions used across multiple components
 * including SwapsPage, SwapInfoModal, ProposeSwapModal, and FilterButtons.
 *
 * Usage:
 * - Import SWAP_STATUSES for consistent status values
 * - Use SwapStatus type for type safety in component props and state
 * - Import SWAP_STATUS_LIST for iteration (dropdowns, filters, etc.)
 * - Use SWAP_STATUS_LABELS for user-facing display text
 *
 * @example
 * ```typescript
 * import { SWAP_STATUSES, SwapStatus, SWAP_STATUS_LABELS } from '@/constants/status';
 *
 * const updateSwapStatus = (status: SwapStatus) => {
 *   if (status === SWAP_STATUSES.ACCEPTED) {
 *     // Handle accepted swap
 *   }
 * };
 *
 * const statusLabel = SWAP_STATUS_LABELS[SWAP_STATUSES.PENDING]; // "Pending"
 * ```
 */

/**
 * Swap status constants used throughout the application.
 *
 * These statuses represent the lifecycle of a plant swap:
 * - NEW: Initial state when a swap is first proposed
 * - ACCEPTED: Receiver has agreed to the swap proposal
 * - DECLINED: Receiver has rejected the swap proposal
 * - COMPLETED: Both parties have confirmed the physical exchange
 *
 * Used in:
 * - SwapsPage.tsx (filtering and display)
 * - SwapInfoModal.tsx (status checks and updates)
 * - ProposeSwapModal.tsx (initial status assignment)
 * - FilterButtons.tsx (filter options)
 * - swapCrudService.ts (database operations)
 */
export const SWAP_STATUSES = {
  NEW: "pending", // Note: Database uses 'pending' for new swaps
  ACCEPTED: "accepted",
  DECLINED: "rejected", // Note: Database uses 'rejected' for declined
  COMPLETED: "completed",
} as const;

/**
 * Type representing valid swap status values.
 * Derived from SWAP_STATUSES object values for type safety.
 */
export type SwapStatus = (typeof SWAP_STATUSES)[keyof typeof SWAP_STATUSES];

/**
 * Array of all swap statuses for iteration purposes.
 *
 * Useful for:
 * - Generating filter options
 * - Creating dropdown menus
 * - Iterating over all possible statuses
 * - Form validation schemas
 *
 * @example
 * ```typescript
 * const statusOptions = SWAP_STATUS_LIST.map(status => ({
 *   value: status,
 *   label: SWAP_STATUS_LABELS[status]
 * }));
 * ```
 */
export const SWAP_STATUS_LIST: readonly SwapStatus[] =
  Object.values(SWAP_STATUSES);

/**
 * Human-readable labels for swap statuses.
 *
 * Provides consistent display text across the application UI.
 * Use these labels instead of capitalizing status values directly.
 *
 * Used in:
 * - Status badges and indicators
 * - Filter button labels
 * - Notification messages
 * - Status change confirmations
 */
export const SWAP_STATUS_LABELS: Record<SwapStatus, string> = {
  [SWAP_STATUSES.NEW]: "Pending",
  [SWAP_STATUSES.ACCEPTED]: "Accepted",
  [SWAP_STATUSES.DECLINED]: "Declined",
  [SWAP_STATUSES.COMPLETED]: "Completed",
} as const;

/**
 * Filter options for swap status filtering, including "all" option.
 *
 * Extends SWAP_STATUS_LIST with an "all" option for comprehensive filtering.
 * Used primarily in FilterButtons and filtering components.
 *
 * @example
 * ```typescript
 * const filterOptions = SWAP_STATUS_FILTERS.map(status => ({
 *   value: status,
 *   label: status === 'all' ? 'All Swaps' : SWAP_STATUS_LABELS[status as SwapStatus]
 * }));
 * ```
 */
export const SWAP_STATUS_FILTERS = ["all", ...SWAP_STATUS_LIST] as const;

/**
 * Type for swap status filter values (includes "all" option).
 */
export type SwapStatusFilter = (typeof SWAP_STATUS_FILTERS)[number];

/**
 * Status transition helpers for business logic validation.
 *
 * Defines which status transitions are allowed in the swap lifecycle.
 * Use these constants to validate status updates and prevent invalid transitions.
 */
export const SWAP_STATUS_TRANSITIONS = {
  [SWAP_STATUSES.NEW]: [SWAP_STATUSES.ACCEPTED, SWAP_STATUSES.DECLINED],
  [SWAP_STATUSES.ACCEPTED]: [SWAP_STATUSES.COMPLETED, SWAP_STATUSES.DECLINED],
  [SWAP_STATUSES.DECLINED]: [], // Terminal state
  [SWAP_STATUSES.COMPLETED]: [], // Terminal state
} as const;

/**
 * Status colors for consistent UI theming.
 *
 * Maps each status to appropriate Tailwind CSS color classes.
 * Use these for badges, indicators, and other status-based styling.
 */
export const SWAP_STATUS_COLORS = {
  [SWAP_STATUSES.NEW]: "bg-yellow-100 text-yellow-800",
  [SWAP_STATUSES.ACCEPTED]: "bg-green-100 text-green-800",
  [SWAP_STATUSES.DECLINED]: "bg-red-100 text-red-800",
  [SWAP_STATUSES.COMPLETED]: "bg-blue-100 text-blue-800",
} as const;
