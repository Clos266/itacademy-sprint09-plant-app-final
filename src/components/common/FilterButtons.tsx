import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import { FILTER_DISPLAY_CONFIG } from "@/constants/filters";
import type { FilterButtonsProps } from "@/types/filtering";

export function FilterButtons({
  options,
  value,
  onChange,
  multiple = false,
  size = "sm",
  className,
  disabled = false,
}: FilterButtonsProps) {
  const capitalize = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1);

  const handleSingleSelect = (option: string) => {
    if (disabled) return;
    onChange(option);
  };

  const handleMultiSelect = (option: string) => {
    if (disabled) return;

    const currentValues = Array.isArray(value) ? value : [];
    const newValues = currentValues.includes(option)
      ? currentValues.filter((v) => v !== option)
      : [...currentValues, option];

    onChange(newValues);
  };

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

export const FilterButtonPresets = {
  availability: {
    options: ["all", "available", "unavailable"] as const,
    multiple: false,
  },

  eventDate: {
    options: ["all", "upcoming", "past"] as const,
    multiple: false,
  },

  swapStatus: {
    options: ["new", "accepted", "declined", "completed"] as const,
    multiple: true,
  },
} as const;
