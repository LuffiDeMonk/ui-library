"use client";

import * as React from "react";
import {
  Avatar as BaseAvatar,
  AvatarImage,
  AvatarFallback,
} from "../../ui/avatar";
import { cn } from "../../../lib/utils";

export interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof BaseAvatar> {
  name?: string | null;
  imageUrl?: string | null;
  src?: string | null;
  alt?: string;
  fallback?: React.ReactNode;
  fallbackClassName?: string;
}

/**
 * Extracts initials from a user's name:
 * e.g., "Prabhat Thapa" -> "PT"
 * "John Michael Smith" -> "JS" (first and last word initial)
 * "Prabhat" -> "PR"
 */
export function getInitials(name?: string | null): string {
  if (!name || typeof name !== "string") return "";
  const trimmed = name.trim();
  if (!trimmed) return "";

  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";

  if (words.length === 1) {
    return words[0].slice(0, Math.min(2, words[0].length)).toUpperCase();
  }

  const firstInitial = words[0][0] || "";
  const lastInitial = words[words.length - 1][0] || "";
  return `${firstInitial}${lastInitial}`.toUpperCase();
}

export function Avatar({
  name,
  imageUrl,
  src,
  alt,
  fallback,
  fallbackClassName,
  className,
  children,
  ...props
}: AvatarProps) {
  const effectiveSrc = imageUrl ?? src;
  const initials = getInitials(name);

  // If explicit children are passed, allow classic primitive composition
  if (children) {
    return (
      <BaseAvatar className={className} {...props}>
        {children}
      </BaseAvatar>
    );
  }

  return (
    <BaseAvatar className={className} {...props}>
      {effectiveSrc && (
        <AvatarImage
          src={effectiveSrc}
          alt={alt || name || "Avatar"}
        />
      )}
      <AvatarFallback
        className={cn(
          "bg-muted text-xs font-medium text-muted-foreground uppercase",
          fallbackClassName
        )}
      >
        {fallback ?? initials}
      </AvatarFallback>
    </BaseAvatar>
  );
}

export { AvatarImage, AvatarFallback };
