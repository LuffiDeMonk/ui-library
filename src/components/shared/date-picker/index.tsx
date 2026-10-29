"use client";

import * as React from "react";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { cn } from "../../../lib/utils";
import { Dropdown } from "../dropdown";
import { Label } from "../label";
import { Calendar, type DateRange } from "../../ui/calendar";
import { formatDate } from "./date-utils";

export type DatePickerMode = "single" | "range";

export interface BaseDatePickerProps {
  /** Label text displayed above the control */
  label?: string;
  /** Validation error message displayed below the input */
  error?: string;
  /** Helper subtext displayed below the input */
  helperText?: string;
  /** Whether the date picker is disabled */
  disabled?: boolean;
  /** Whether to show the clear button when a date is selected */
  allowClear?: boolean;
  /** Additional CSS classes for the trigger button */
  className?: string;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Custom function to determine if a specific date is disabled */
  disabledDates?: (date: Date) => boolean;
  /** Start year for the year navigation dropdown */
  fromYear?: number;
  /** End year for the year navigation dropdown */
  toYear?: number;
  /** Display date format (e.g. YYYY-MM-DD, MMMM DD, YYYY) */
  format?: string;
}

export interface SingleDatePickerProps extends BaseDatePickerProps {
  /** Single date selection mode */
  mode?: "single";
  /** Controlled selected date */
  value?: Date | null;
  /** Initial date value when uncontrolled */
  defaultValue?: Date | null;
  /** Callback fired when selected date changes */
  onChange?: (date: Date | null) => void;
  /** Placeholder text for single date picker */
  placeholder?: string;
}

export interface RangeDatePickerProps extends BaseDatePickerProps {
  /** Date range selection mode */
  mode: "range";
  /** Controlled selected date range */
  value?: DateRange | null;
  /** Initial date range when uncontrolled */
  defaultValue?: DateRange | null;
  /** Callback fired when date range changes */
  onChange?: (range: DateRange | null) => void;
  /** Placeholder text tuple or string for range picker */
  placeholder?: [string, string] | string;
}

export type DatePickerProps = SingleDatePickerProps | RangeDatePickerProps;

const SingleDatePicker = ({
  value: controlledValue,
  defaultValue = null,
  onChange,
  placeholder = "Select date",
  label,
  error,
  helperText,
  disabled = false,
  allowClear = true,
  className,
  minDate,
  maxDate,
  disabledDates,
  fromYear,
  toYear,
  format = "YYYY-MM-DD",
}: SingleDatePickerProps) => {
  const [internalDate, setInternalDate] = React.useState<Date | null>(
    defaultValue,
  );
  const [open, setOpen] = React.useState(false);

  const selectedDate =
    controlledValue !== undefined ? controlledValue : internalDate;

  const handleSelect = (date: Date | undefined) => {
    const nextDate = date ?? null;
    if (controlledValue === undefined) {
      setInternalDate(nextDate);
    }
    onChange?.(nextDate);
    if (nextDate) {
      setOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (controlledValue === undefined) {
      setInternalDate(null);
    }
    onChange?.(null);
  };

  const formattedDisplay = selectedDate ? formatDate(selectedDate, format) : "";

  return (
    <div className="flex w-full flex-col">
      {label && <Label className="mb-2">{label}</Label>}

      <Dropdown
        open={open}
        onOpenChange={setOpen}
        trigger={["click"]}
        placement="bottomLeft"
        disabled={disabled}
        menu={{ items: [] }}
        overlayClassName="w-auto max-w-none p-0 overflow-visible border border-border shadow-lg"
        dropdownRender={() => (
          <div
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            className="p-0 bg-popover rounded-md"
          >
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleSelect}
              minDate={minDate}
              maxDate={maxDate}
              disabledDates={disabledDates}
              fromYear={fromYear}
              toYear={toYear}
            />
          </div>
        )}
      >
        <button
          type="button"
          disabled={disabled}
          aria-label={label || placeholder}
          className={cn(
            "flex min-h-10 w-full items-center justify-between gap-2 rounded border border-gray-300 bg-transparent px-3 py-2 text-left text-sm transition-colors dark:bg-input/30",
            "focus-visible:border-gray-900 focus-visible:outline-none dark:focus-visible:border-white",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-600 focus-visible:border-red-600",
            className,
          )}
        >
          <div className="flex items-center gap-2 min-w-0">
            <CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
            {formattedDisplay ? (
              <span className="truncate font-medium text-foreground text-xs sm:text-sm">
                {formattedDisplay}
              </span>
            ) : (
              <span className="truncate font-normal text-muted-foreground text-xs sm:text-sm">
                {placeholder}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {allowClear && selectedDate && !disabled && (
              <span
                role="button"
                tabIndex={0}
                aria-label="Clear date"
                onClick={handleClear}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleClear(e as unknown as React.MouseEvent);
                  }
                }}
                className="rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none"
              >
                <X className="h-3.5 w-3.5" />
              </span>
            )}
          </div>
        </button>
      </Dropdown>

      {error && (
        <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-1.5 text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

const RangeDatePicker = ({
  value: controlledValue,
  defaultValue = null,
  onChange,
  placeholder = ["Start date", "End date"],
  label,
  error,
  helperText,
  disabled = false,
  allowClear = true,
  className,
  minDate,
  maxDate,
  disabledDates,
  fromYear,
  toYear,
  format = "YYYY-MM-DD",
}: RangeDatePickerProps) => {
  const [internalRange, setInternalRange] = React.useState<DateRange | null>(
    defaultValue,
  );
  const [open, setOpen] = React.useState(false);

  const selectedRange =
    controlledValue !== undefined ? controlledValue : internalRange;

  const handleSelect = (range: DateRange | undefined) => {
    const nextRange = range ?? null;
    if (controlledValue === undefined) {
      setInternalRange(nextRange);
    }
    onChange?.(nextRange);
    if (nextRange?.from && nextRange?.to) {
      setOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (controlledValue === undefined) {
      setInternalRange(null);
    }
    onChange?.(null);
  };

  const startPlaceholder = Array.isArray(placeholder)
    ? placeholder[0]
    : placeholder;
  const endPlaceholder = Array.isArray(placeholder)
    ? placeholder[1]
    : placeholder;

  const fromFormatted = selectedRange?.from
    ? formatDate(selectedRange.from, format)
    : "";
  const toFormatted = selectedRange?.to
    ? formatDate(selectedRange.to, format)
    : "";

  return (
    <div className="flex w-full flex-col">
      {label && <Label className="mb-2">{label}</Label>}

      <Dropdown
        open={open}
        onOpenChange={setOpen}
        trigger={["click"]}
        placement="bottomLeft"
        disabled={disabled}
        menu={{ items: [] }}
        overlayClassName="w-auto max-w-none p-0 overflow-visible border border-border shadow-lg"
        dropdownRender={() => (
          <div
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            className="p-0 bg-popover rounded-md"
          >
            <Calendar
              mode="range"
              selected={selectedRange}
              onSelect={handleSelect}
              minDate={minDate}
              maxDate={maxDate}
              disabledDates={disabledDates}
              fromYear={fromYear}
              toYear={toYear}
            />
          </div>
        )}
      >
        <button
          type="button"
          disabled={disabled}
          aria-label={
            label ||
            (Array.isArray(placeholder)
              ? placeholder.join(" to ")
              : placeholder)
          }
          className={cn(
            "flex min-h-10 w-full items-center justify-between gap-2 rounded border border-gray-300 bg-transparent px-3 py-2 text-left text-sm transition-colors dark:bg-input/30",
            "focus-visible:border-gray-900 focus-visible:outline-none dark:focus-visible:border-white",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-600 focus-visible:border-red-600",
            className,
          )}
        >
          <div className="flex items-center gap-2 min-w-0">
            <CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
            {fromFormatted ? (
              <div className="flex items-center gap-1.5 truncate text-xs sm:text-sm">
                <span className="font-medium text-foreground">
                  {fromFormatted}
                </span>
                <span className="text-muted-foreground">to</span>
                {toFormatted ? (
                  <span className="font-medium text-foreground">
                    {toFormatted}
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    {endPlaceholder}
                  </span>
                )}
              </div>
            ) : (
              <span className="truncate font-normal text-muted-foreground text-xs sm:text-sm">
                {startPlaceholder} ~ {endPlaceholder}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {allowClear &&
              (selectedRange?.from || selectedRange?.to) &&
              !disabled && (
                <span
                  role="button"
                  tabIndex={0}
                  aria-label="Clear range"
                  onClick={handleClear}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleClear(e as unknown as React.MouseEvent);
                    }
                  }}
                  className="rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none"
                >
                  <X className="h-3.5 w-3.5" />
                </span>
              )}
          </div>
        </button>
      </Dropdown>

      {error && (
        <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-1.5 text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export const DatePicker = (props: DatePickerProps) => {
  if (props.mode === "range") {
    return <RangeDatePicker {...props} />;
  }
  return <SingleDatePicker {...props} />;
};

export default DatePicker;

