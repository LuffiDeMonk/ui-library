"use client";

import * as React from "react";
import { cn } from "../../../lib/utils";

// Context for RadioGroup
interface RadioGroupContextValue {
  name?: string;
  value?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(
  null
);

export interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Currently selected value.
   */
  value?: string;
  /**
   * Default selected value for uncontrolled state.
   */
  defaultValue?: string;
  /**
   * Name applied to all radio inputs in this group.
   */
  name?: string;
  /**
   * Layout orientation.
   */
  orientation?: "horizontal" | "vertical";
  /**
   * Whether the entire radio group is disabled.
   */
  disabled?: boolean;
  /**
   * Callback invoked when selected value changes.
   */
  onValueChange?: (value: string) => void;
}

export function RadioGroup({
  ref,
  value: controlledValue,
  defaultValue,
  name: customName,
  orientation = "vertical",
  disabled = false,
  onValueChange,
  className,
  children,
  ...props
}: RadioGroupProps & { ref?: React.Ref<HTMLDivElement> }) {
    const generatedName = React.useId();
    const groupName = customName || generatedName;

    const [uncontrolledValue, setUncontrolledValue] = React.useState(
      defaultValue || ""
    );

    const isControlled = controlledValue !== undefined;
    const activeValue = isControlled ? controlledValue : uncontrolledValue;

    const handleChange = React.useCallback(
      (val: string) => {
        if (!isControlled) {
          setUncontrolledValue(val);
        }
        onValueChange?.(val);
      },
      [isControlled, onValueChange]
    );

    return (
      <RadioGroupContext.Provider
        value={{
          name: groupName,
          value: activeValue,
          disabled,
          onChange: handleChange,
        }}
      >
        <div
          ref={ref}
          role="radiogroup"
          aria-orientation={orientation}
          className={cn(
            "flex",
            orientation === "horizontal"
              ? "flex-row items-center gap-6"
              : "flex-col gap-3",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </RadioGroupContext.Provider>
    );
}

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "onChange"> {
  /**
   * Visual variant. "default" is an inline radio button with label.
   * "card" is a selectable card container.
   */
  variant?: "default" | "card";
  /**
   * Value of this radio option.
   */
  value?: string;
  /**
   * Primary label text or element.
   */
  label?: React.ReactNode;
  /**
   * Optional helper description rendered below label.
   */
  description?: React.ReactNode;
  /**
   * Optional error message rendered below the radio option.
   */
  error?: string;
  /**
   * Controlled checked state when used outside of RadioGroup.
   */
  checked?: boolean;
  /**
   * Callback invoked when checked state changes.
   */
  onCheckedChange?: (checked: boolean) => void;
  /**
   * Native change event handler.
   */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /**
   * Container element class name.
   */
  containerClassName?: string;
}

export function Radio({
  ref,
  variant = "default",
  value = "",
  label,
  description,
  error,
  checked: propChecked,
  defaultChecked,
  onCheckedChange,
  onChange,
  disabled: propDisabled = false,
  required = false,
  className,
  containerClassName,
  id,
  name: propName,
  ...props
}: RadioProps & { ref?: React.Ref<HTMLInputElement> }) {
    const groupContext = React.useContext(RadioGroupContext);
    const generatedId = React.useId();
    const inputId = id || generatedId;

    const [uncontrolledChecked, setUncontrolledChecked] = React.useState(
      Boolean(defaultChecked)
    );

    const isInsideGroup = Boolean(groupContext);
    const isChecked = isInsideGroup
      ? groupContext?.value === value
      : propChecked !== undefined
      ? propChecked
      : uncontrolledChecked;

    const isDisabled = propDisabled || Boolean(groupContext?.disabled);
    const radioName = propName || groupContext?.name;

    const handleSelect = () => {
      if (isDisabled) return;
      if (isInsideGroup) {
        groupContext?.onChange?.(value);
      } else {
        if (propChecked === undefined) {
          setUncontrolledChecked(true);
        }
      }
      onCheckedChange?.(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isDisabled) return;
      handleSelect();
      onChange?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (isDisabled) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleSelect();
      }
    };

    // Shared visual radio indicator
    const indicator = (
      <div
        className={cn(
          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors",
          isChecked
            ? "border-gray-900 bg-gray-900 dark:border-white dark:bg-white"
            : error
            ? "border-red-600 bg-white dark:bg-gray-800"
            : "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800",
          isDisabled && "cursor-not-allowed opacity-50",
          className
        )}
      >
        {isChecked && (
          <div className="h-1.5 w-1.5 rounded-full bg-white dark:bg-gray-900" />
        )}
      </div>
    );

    if (variant === "card") {
      return (
        <div className={cn("w-full", containerClassName)}>
          <div
            role="radio"
            tabIndex={isDisabled ? -1 : 0}
            aria-checked={isChecked}
            aria-disabled={isDisabled}
            aria-required={required}
            onClick={handleSelect}
            onKeyDown={handleKeyDown}
            className={cn(
              "flex cursor-pointer items-start gap-3.5 rounded border p-4 transition-all focus:outline-none focus:border-gray-900 dark:focus:border-white",
              isChecked
                ? "border-gray-900 bg-gray-50 dark:border-white dark:bg-gray-800"
                : error
                ? "border-red-600 bg-white dark:border-red-600 dark:bg-gray-900"
                : "border-gray-200 hover:border-gray-300 dark:border-gray-700",
              isDisabled && "cursor-not-allowed opacity-50"
            )}
          >
            <input
              ref={ref}
              type="radio"
              id={inputId}
              name={radioName}
              value={value}
              checked={isChecked}
              onChange={handleInputChange}
              disabled={isDisabled}
              required={required}
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
              {...props}
            />
            {indicator}
            <div className="select-none">
              {label && (
                <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                  {label}
                </span>
              )}
              {description && (
                <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
                  {description}
                </span>
              )}
            </div>
          </div>
          {error && (
            <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">{error}</p>
          )}
        </div>
      );
    }

    // Default inline variant
    return (
      <div className={cn("inline-flex flex-col", containerClassName)}>
        <label
          htmlFor={inputId}
          className={cn(
            "inline-flex cursor-pointer items-center gap-2.5 select-none",
            isDisabled && "cursor-not-allowed opacity-50"
          )}
        >
          <input
            ref={ref}
            type="radio"
            id={inputId}
            name={radioName}
            value={value}
            checked={isChecked}
            onChange={handleInputChange}
            disabled={isDisabled}
            required={required}
            className="sr-only"
            {...props}
          />
          {indicator}
          {(label || description) && (
            <div className="flex flex-col">
              {label && (
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {label}
                </span>
              )}
              {description && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {description}
                </span>
              )}
            </div>
          )}
        </label>
        {error && (
          <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">{error}</p>
        )}
      </div>
    );
}
