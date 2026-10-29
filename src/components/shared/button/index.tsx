"use client";

import * as React from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { VariantProps } from "class-variance-authority";
import {
  Button as ShadcnButton,
  buttonVariants,
} from "../../../components/ui/button";
import { Spinner } from "../../../components/ui/spinner";
import { cn } from "../../../lib/utils";

export interface ButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * If true, displays a loading spinner in place of any icon and disables the button.
   */
  loading?: boolean;
  /**
   * Whether to delegate rendering to the immediate child element (e.g. Next.js Link).
   */
  asChild?: boolean;
  /**
   * Optional icon element to display. When the button enters loading state,
   * this icon is replaced by the loading spinner.
   */
  icon?: ReactNode;
  /**
   * Position of the icon relative to the button label. Defaults to "left".
   */
  iconPosition?: "left" | "right";
  /**
   * Alias for an icon positioned at the start (left).
   */
  startIcon?: ReactNode;
  /**
   * Alias for an icon positioned at the end (right).
   */
  endIcon?: ReactNode;
  children?: ReactNode;
}

/**
 * Helper to detect if a React node is an icon or SVG element.
 */
function isIconElement(element: ReactNode): boolean {
  if (!React.isValidElement(element)) return false;
  if (element.type === "svg") return true;

  const anyType = element.type as any;
  if (typeof anyType === "string") return false;

  if (typeof anyType === "function") {
    const name = anyType.displayName || anyType.name || "";
    if (name.toLowerCase().includes("icon") || name.toLowerCase().includes("spinner")) {
      return true;
    }
  }

  if (typeof anyType === "object" && anyType !== null) {
    const name = anyType.displayName || anyType.name || "";
    // Lucide React and other icon libraries use displayName on their component definitions
    if (name && typeof name === "string") {
      return true;
    }
  }

  if (element.props && typeof element.props === "object") {
    const p = element.props as Record<string, any>;
    if (p["data-icon"] || p["aria-hidden"] === true || p["aria-hidden"] === "true") {
      return true;
    }
    if (typeof p.className === "string" && (p.className.includes("lucide") || p.className.includes("icon"))) {
      return true;
    }
  }

  return false;
}

/**
 * Helper to recursively flatten React fragments so inline icons can be inspected.
 */
function flattenChildren(children: ReactNode): ReactNode[] {
  const result: ReactNode[] = [];
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && child.type === React.Fragment) {
      result.push(...flattenChildren((child.props as any).children));
    } else if (child !== null && child !== undefined && typeof child !== "boolean") {
      result.push(child);
    }
  });
  return result;
}

export function Button({
  className,
  variant = "default",
  size = "default",
  loading = false,
  disabled,
  asChild = false,
  icon,
  iconPosition = "left",
  startIcon,
  endIcon,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const leftIcon = startIcon || (iconPosition === "left" ? icon : undefined);
  const rightIcon = endIcon || (iconPosition === "right" ? icon : undefined);
  const hasIconProp = Boolean(leftIcon || rightIcon);

  if (asChild) {
    return (
      <ShadcnButton
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={isDisabled}
        aria-busy={loading}
        asChild
        {...props}
      >
        {children}
      </ShadcnButton>
    );
  }

  const renderContent = () => {
    // 1. Icon provided explicitly via props (icon, startIcon, or endIcon)
    if (hasIconProp) {
      return (
        <>
          {leftIcon && (
            loading && (leftIcon || (!rightIcon && iconPosition === "left")) ? (
              <Spinner className={cn("size-4 shrink-0", children && "mr-2")} />
            ) : (
              <span className={cn("inline-flex shrink-0 items-center justify-center", children && "mr-2")}>
                {leftIcon}
              </span>
            )
          )}
          {children}
          {rightIcon && (
            loading && iconPosition === "right" ? (
              <Spinner className={cn("size-4 shrink-0", children && "ml-2")} />
            ) : (
              <span className={cn("inline-flex shrink-0 items-center justify-center", children && "ml-2")}>
                {rightIcon}
              </span>
            )
          )}
        </>
      );
    }

    // 2. Icon inlined inside children - if loading, replace the first found icon with the spinner
    if (loading) {
      const flat = flattenChildren(children);
      let replaced = false;

      const processed = flat.map((child, idx) => {
        if (!replaced && isIconElement(child)) {
          replaced = true;
          const childProps = (child as React.ReactElement).props as Record<string, any>;
          const childClassName = typeof childProps?.className === "string" ? childProps.className : "";
          // Preserve any explicit margin class on the inline icon (e.g. mr-2, ml-2)
          const marginMatch = childClassName.match(/\bm[rlebxyts]-\S+/g);
          const marginClass = marginMatch ? marginMatch.join(" ") : flat.length > 1 ? "mr-2" : "";
          return (
            <Spinner
              key={`spinner-${idx}`}
              className={cn("size-4 shrink-0", marginClass)}
            />
          );
        }
        return child;
      });

      if (replaced) {
        return processed;
      }

      // 3. Text-only button fallback: prepend the spinner
      return (
        <>
          <Spinner className={cn("size-4 shrink-0", children && "mr-2")} />
          {children}
        </>
      );
    }

    // 4. Default: not loading and no icon props
    return children;
  };

  return (
    <ShadcnButton
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={isDisabled}
      aria-busy={loading}
      {...props}
    >
      {renderContent()}
    </ShadcnButton>
  );
}

export { buttonVariants };
