"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Label as ShadcnLabel } from "../../../components/ui/label";
import { cn } from "../../../lib/utils";

export const labelVariants = cva(
  "leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 select-none",
  {
    variants: {
      variant: {
        default: "font-medium text-foreground",
        uppercase: "font-semibold tracking-wider text-foreground uppercase",
        muted: "font-medium text-muted-foreground",
        destructive: "font-medium text-red-600",
      },
      size: {
        xs: "text-xs",
        sm: "text-xs",
        default: "text-sm",
        lg: "text-base",
      },
    },
    compoundVariants: [
      {
        variant: "uppercase",
        size: "default",
        className: "text-xs",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface LabelProps
  extends React.ComponentPropsWithoutRef<typeof ShadcnLabel>,
    VariantProps<typeof labelVariants> {
  /**
   * If true, displays a red asterisk (*) indicating a required field.
   */
  required?: boolean;
  /**
   * If true, displays a subtle "(optional)" indicator.
   */
  optional?: boolean;
  /**
   * Optional helper or description text rendered below the label.
   */
  description?: React.ReactNode;
}

export const Label = React.forwardRef<
  React.ComponentRef<typeof ShadcnLabel>,
  LabelProps
>(
  (
    {
      className,
      variant = "default",
      size = "default",
      required = false,
      optional = false,
      description,
      children,
      ...props
    },
    ref,
  ) => {
    const labelContent = (
      <ShadcnLabel
        ref={ref}
        className={cn(labelVariants({ variant, size }), className)}
        {...props}
      >
        {children}
        {required && (
          <span
            className="ml-1 font-semibold text-red-600"
            aria-hidden="true"
          >
            *
          </span>
        )}
        {optional && (
          <span className="ml-1 text-xs font-normal normal-case tracking-normal text-muted-foreground">
            (optional)
          </span>
        )}
      </ShadcnLabel>
    );

    if (description) {
      return (
        <div className="space-y-1">
          {labelContent}
          <p className="text-xs font-normal text-muted-foreground">
            {description}
          </p>
        </div>
      );
    }

    return labelContent;
  },
);

Label.displayName = "Label";

export default Label;
