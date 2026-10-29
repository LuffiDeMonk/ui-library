"use client";

import { useId } from "react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupTextarea,
} from "../../../components/ui/input-group";
import { Label } from "../label";

import type { ComponentProps, ReactNode } from "react";

export interface TextareaProps extends ComponentProps<
  typeof InputGroupTextarea
> {
  /**
   * Label text rendered above the textarea.
   */
  label?: string;
  /**
   * Error message rendered below the textarea. Also sets the invalid state.
   */
  error?: string;
  /**
   * Helper text rendered below the textarea when there is no error.
   */
  helperText?: string;
  /**
   * Content rendered before the control, typically an icon.
   */
  startIcon?: ReactNode;
  /**
   * Content rendered after the control, typically an icon.
   */
  endIcon?: ReactNode;
}

export function Textarea({
  className,
  label,
  error,
  helperText,
  startIcon,
  endIcon,
  id,
  ...props
}: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const errorId = error ? `${textareaId}-error` : undefined;
  const helperId = helperText ? `${textareaId}-helper` : undefined;

  return (
    <div className="w-full">
      {label && (
        <Label
          htmlFor={textareaId}
          className="mb-2 block"
        >
          {label}
        </Label>
      )}

      <InputGroup className={className}>
        {startIcon && (
          <InputGroupAddon align="inline-start">{startIcon}</InputGroupAddon>
        )}
        <InputGroupTextarea
          id={textareaId}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            [errorId, helperId].filter(Boolean).join(" ") || undefined
          }
          {...props}
        />
        {endIcon && (
          <InputGroupAddon align="inline-end">{endIcon}</InputGroupAddon>
        )}
      </InputGroup>

      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={helperId} className="mt-1.5 text-xs text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
}
