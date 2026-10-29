"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "../../../lib/utils";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "onChange"> {
  /**
   * Visual variant. "default" is an inline checkbox with optional label.
   * "card" is a prominent selectable card container.
   */
  variant?: "default" | "card";
  /**
   * Primary label text or element.
   */
  label?: React.ReactNode;
  /**
   * Optional helper description rendered below label.
   */
  description?: React.ReactNode;
  /**
   * Optional error message rendered below the checkbox.
   */
  error?: string;
  /**
   * Controlled checked state.
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

export function Checkbox({
  ref,
  variant = "default",
  label,
  description,
  error,
  checked: controlledChecked,
  defaultChecked,
  onCheckedChange,
  onChange,
  disabled = false,
  required = false,
  className,
  containerClassName,
  id,
  name,
  value,
  ...props
}: CheckboxProps & { ref?: React.Ref<HTMLInputElement> }) {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    const [uncontrolledChecked, setUncontrolledChecked] = React.useState(
      Boolean(defaultChecked)
    );

    const isControlled = controlledChecked !== undefined;
    const isChecked = isControlled ? controlledChecked : uncontrolledChecked;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      if (!isControlled) {
        setUncontrolledChecked(e.target.checked);
      }
      onCheckedChange?.(e.target.checked);
      onChange?.(e);
    };

    const handleContainerClick = () => {
      if (disabled) return;
      const nextChecked = !isChecked;
      if (!isControlled) {
        setUncontrolledChecked(nextChecked);
      }
      onCheckedChange?.(nextChecked);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleContainerClick();
      }
    };

    // Shared visual checkbox box
    const indicator = (
      <div
        className={cn(
          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
          isChecked
            ? "border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900"
            : error
            ? "border-red-600 bg-white dark:bg-gray-800"
            : "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
      >
        {isChecked && <Check className="h-3 w-3" strokeWidth={2.5} />}
      </div>
    );

    if (variant === "card") {
      return (
        <div className={cn("w-full", containerClassName)}>
          <div
            role="checkbox"
            tabIndex={disabled ? -1 : 0}
            aria-checked={isChecked}
            aria-disabled={disabled}
            aria-required={required}
            onClick={handleContainerClick}
            onKeyDown={handleKeyDown}
            className={cn(
              "flex cursor-pointer items-start gap-3.5 rounded border p-4 transition-all focus:outline-none focus:border-gray-900 dark:focus:border-white",
              isChecked
                ? "border-gray-900 bg-gray-50 dark:border-white dark:bg-gray-800"
                : error
                ? "border-red-600 bg-white dark:border-red-600 dark:bg-gray-900"
                : "border-gray-200 hover:border-gray-300 dark:border-gray-700",
              disabled && "cursor-not-allowed opacity-50"
            )}
          >
            <input
              ref={ref}
              type="checkbox"
              id={inputId}
              name={name}
              value={value}
              checked={isChecked}
              onChange={handleInputChange}
              disabled={disabled}
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
            "inline-flex cursor-pointer items-start gap-2.5 select-none",
            disabled && "cursor-not-allowed opacity-50"
          )}
        >
          <input
            ref={ref}
            type="checkbox"
            id={inputId}
            name={name}
            value={value}
            checked={isChecked}
            onChange={handleInputChange}
            disabled={disabled}
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

