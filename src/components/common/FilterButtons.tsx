import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import { FILTER_DISPLAY_CONFIG } from "@/constants/filters";
import type { FilterButtonsProps } from "@/types/filtering";

/**
 * 🔘 Reusable filter button group component
 *
 * Extracted from repetitive button patterns across Home, Plants, Events, and Swaps pages.
 * Supports both single-select (buttons) and multi-select (toggles) modes.
 *
 * @example
 * // Single-select filter buttons (like availability filters)
 * <FilterButtons
 *   options={["all", "available", "unavailable"]}
 *   value="available"
 *   onChange={(value) => setFilter(value)}
 * />
 *
 * @example
 * // Multi-select toggle buttons (like swap status filters)
 * <FilterButtons
 *   options={["new", "accepted", "declined", "completed"]}
 *   value={["new", "accepted"]}
 *   onChange={(value) => setStatuses(value)}
 *   multiple
 * />
 */
export function FilterButtons({
  options,
  value,
  onChange,
  multiple = false,
  size = "sm",
  className,
  disabled = false,
}: FilterButtonsProps) {
  // Helper to capitalize first letter for display
  const capitalize = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1);

  // Handle single-select button clicks
  const handleSingleSelect = (option: string) => {
    if (disabled) return;
    onChange(option);
  };

  // Handle multi-select toggle changes
  const handleMultiSelect = (option: string) => {
    if (disabled) return;

    const currentValues = Array.isArray(value) ? value : [];
    const newValues = currentValues.includes(option)
      ? currentValues.filter((v) => v !== option)
      : [...currentValues, option];

    onChange(newValues);
  };

  // Render single-select buttons
  if (!multiple) {
    return (
      <div className={cn("flex gap-2 flex-wrap", className)}>
        {options.map((option) => {
          const isActive = value === option;

          return (
            <Button
              key={option}
              variant={
                isActive
                  ? FILTER_DISPLAY_CONFIG.button.activeVariant
                  : FILTER_DISPLAY_CONFIG.button.inactiveVariant
              }
              size={size}
              onClick={() => handleSingleSelect(option)}
              disabled={disabled}
              className={cn(
                FILTER_DISPLAY_CONFIG.button.className,
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {capitalize(option)}
            </Button>
          );
        })}
      </div>
    );
  }

  // Render multi-select toggles
  const activeValues = Array.isArray(value) ? value : [];

  return (
    <div className={cn("flex gap-2 flex-wrap", className)}>
      {options.map((option) => {
        const isPressed = activeValues.includes(option);

        return (
          <Toggle
            key={option}
            pressed={isPressed}
            onPressedChange={() => handleMultiSelect(option)}
            disabled={disabled}
            className={cn(
              FILTER_DISPLAY_CONFIG.toggle.className,
              isPressed
                ? FILTER_DISPLAY_CONFIG.toggle.activeClassName
                : FILTER_DISPLAY_CONFIG.toggle.inactiveClassName,
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {capitalize(option)}
          </Toggle>
        );
      })}
    </div>
  );
}

// 🎨 Preset configurations for common filter types
export const FilterButtonPresets = {
  /**
   * Plant availability filters (all/available/unavailable)
   */
  availability: {
    options: ["all", "available", "unavailable"] as const,
    multiple: false,
  },

  /**
   * Event date filters (all/upcoming/past)
   */
  eventDate: {
    options: ["all", "upcoming", "past"] as const,
    multiple: false,
  },

  /**
   * Swap status filters (new/accepted/declined/completed)
   */
  swapStatus: {
    options: ["new", "accepted", "declined", "completed"] as const,
    multiple: true,
  },
} as const;
