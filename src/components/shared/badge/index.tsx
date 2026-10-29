"use client";

import {
  Badge as ShadcnBadge,
  badgeVariants,
} from "../../../components/ui/badge";

import { cn } from "../../../lib/utils";

import type { VariantProps } from "class-variance-authority";
import type { HTMLAttributes, ReactNode } from "react";

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  icon?: ReactNode;
  handleIconClick?: () => void;
}

export function Badge({
  className,
  variant = "default",
  icon,
  children,
  handleIconClick,
  ...props
}: BadgeProps) {
  return (
    <ShadcnBadge
      className={cn(badgeVariants({ variant }), className)}
      data-icon={icon ? "inline-start" : undefined}
      {...props}
    >
      {icon && (
        <span
          className="inline-flex items-center justify-center"
          onClick={handleIconClick}
        >
          {icon}
        </span>
      )}
      {children}
    </ShadcnBadge>
  );
}

export { badgeVariants };
