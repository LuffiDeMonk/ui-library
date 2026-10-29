"use client";

import * as React from "react";
import { ChevronRightIcon } from "lucide-react";
import {
  Breadcrumb as ShadcnBreadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "../../ui/breadcrumb";
import { cn } from "../../../lib/utils";

export interface BreadcrumbItemType {
  /** The text or element displayed in the breadcrumb */
  label: React.ReactNode;
  /**
   * The navigating path (URL) for this breadcrumb item.
   * When provided, the item renders as a clickable link.
   */
  href?: string;
  /**
   * Optional click handler for programmatic navigation or client-side routing.
   */
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  /**
   * Optional icon to display before the item's label.
   */
  icon?: React.ReactNode | React.ComponentType<{ className?: string }>;
  /**
   * Explicitly sets whether this item represents the active current page.
   * Defaults to true for the last item in the breadcrumbs list.
   */
  isCurrentPage?: boolean;
  /**
   * Target attribute for link navigation (e.g. "_blank").
   */
  target?: string;
  /**
   * Rel attribute for link navigation (e.g. "noopener noreferrer").
   */
  rel?: string;
  /**
   * Additional className for the item container (`<li>`).
   */
  className?: string;
  /**
   * Additional className for the link or page element.
   */
  linkClassName?: string;
}

export interface BreadcrumbProps
  extends Omit<React.ComponentPropsWithoutRef<"nav">, "children"> {
  /**
   * Array of breadcrumb items to render in navigation order.
   * Each item includes a label, navigating path (`href`), and optional click handler.
   */
  items: BreadcrumbItemType[];
  /**
   * The separator icon or element passed as a prop to the component.
   * Can be a ReactNode (e.g. `<ChevronRightIcon />`) or a Lucide icon component.
   */
  icon?: React.ReactNode | React.ComponentType<{ className?: string }>;
  /**
   * Alternative prop name for the separator icon.
   */
  separatorIcon?: React.ReactNode | React.ComponentType<{ className?: string }>;
  /**
   * Maximum number of items to display before collapsing intermediate items with an ellipsis.
   */
  maxItems?: number;
  /**
   * Number of items to display before the collapsed ellipsis (defaults to 1).
   */
  itemsBeforeCollapse?: number;
  /**
   * Number of items to display after the collapsed ellipsis (defaults to 1).
   */
  itemsAfterCollapse?: number;
  /**
   * Additional className for the list (`<ol>`) element.
   */
  listClassName?: string;
}

function resolveIcon(
  iconProp?: React.ReactNode | React.ComponentType<{ className?: string }>,
): React.ReactNode {
  if (!iconProp) return null;
  if (React.isValidElement(iconProp)) return iconProp;
  if (typeof iconProp === "function") {
    const IconComponent = iconProp as React.ComponentType<{ className?: string }>;
    return <IconComponent className="size-3.5" />;
  }
  return iconProp as React.ReactNode;
}

export function Breadcrumb({
  items,
  icon,
  separatorIcon,
  maxItems,
  itemsBeforeCollapse = 1,
  itemsAfterCollapse = 1,
  className,
  listClassName,
  ...props
}: BreadcrumbProps) {
  const resolvedSeparator =
    resolveIcon(separatorIcon) ??
    resolveIcon(icon) ??
    <ChevronRightIcon className="size-3.5" />;

  const renderItemContent = (item: BreadcrumbItemType, index: number) => {
    const isLast = index === items.length - 1;
    const isCurrent = item.isCurrentPage ?? isLast;
    const itemIcon = resolveIcon(item.icon);

    // The last item (current page) should not be clickable
    if (isCurrent) {
      return (
        <BreadcrumbPage
          className={cn(
            "inline-flex items-center gap-1.5 font-medium text-foreground",
            item.linkClassName,
          )}
        >
          {itemIcon}
          <span>{item.label}</span>
        </BreadcrumbPage>
      );
    }

    // Preceding items with navigating path (href) or onClick are clickable
    if (item.href || item.onClick) {
      return (
        <BreadcrumbLink
          href={item.href}
          onClick={item.onClick}
          target={item.target}
          rel={item.rel}
          className={cn(
            "inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer",
            item.linkClassName,
          )}
        >
          {itemIcon}
          <span>{item.label}</span>
        </BreadcrumbLink>
      );
    }

    return (
      <BreadcrumbPage
        className={cn(
          "inline-flex items-center gap-1.5 text-muted-foreground",
          item.linkClassName,
        )}
      >
        {itemIcon}
        <span>{item.label}</span>
      </BreadcrumbPage>
    );
  };

  // Intermediate collapse handling when maxItems is specified
  const shouldCollapse = Boolean(
    maxItems &&
      items.length > maxItems &&
      itemsBeforeCollapse + itemsAfterCollapse < items.length,
  );

  if (shouldCollapse) {
    const startItems = items.slice(0, itemsBeforeCollapse);
    const endItems = items.slice(items.length - itemsAfterCollapse);
    const startIndexOffset = items.length - itemsAfterCollapse;

    return (
      <ShadcnBreadcrumb
        data-slot="shared-breadcrumb"
        className={cn("font-sans", className)}
        {...props}
      >
        <BreadcrumbList className={listClassName}>
          {startItems.map((item, idx) => (
            <React.Fragment key={item.href ?? `${item.label}-${idx}`}>
              <BreadcrumbItem className={item.className}>
                {renderItemContent(item, idx)}
              </BreadcrumbItem>
              <BreadcrumbSeparator>{resolvedSeparator}</BreadcrumbSeparator>
            </React.Fragment>
          ))}

          <BreadcrumbItem>
            <BreadcrumbEllipsis />
          </BreadcrumbItem>
          <BreadcrumbSeparator>{resolvedSeparator}</BreadcrumbSeparator>

          {endItems.map((item, idx) => {
            const actualIndex = startIndexOffset + idx;
            const isLast = idx === endItems.length - 1;
            return (
              <React.Fragment key={item.href ?? `${item.label}-${actualIndex}`}>
                <BreadcrumbItem className={item.className}>
                  {renderItemContent(item, actualIndex)}
                </BreadcrumbItem>
                {!isLast && (
                  <BreadcrumbSeparator>{resolvedSeparator}</BreadcrumbSeparator>
                )}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </ShadcnBreadcrumb>
    );
  }

  return (
    <ShadcnBreadcrumb
      data-slot="shared-breadcrumb"
      className={cn("font-sans", className)}
      {...props}
    >
      <BreadcrumbList className={listClassName}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <React.Fragment key={item.href ?? `${item.label}-${index}`}>
              <BreadcrumbItem className={item.className}>
                {renderItemContent(item, index)}
              </BreadcrumbItem>
              {!isLast && (
                <BreadcrumbSeparator>{resolvedSeparator}</BreadcrumbSeparator>
              )}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </ShadcnBreadcrumb>
  );
}

export default Breadcrumb;

// Re-export low-level primitives for advanced composition
export {
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};
