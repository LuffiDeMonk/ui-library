"use client";

import * as React from "react";
import {
  Tabs as ShadcnTabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import { cn } from "../../../lib/utils";

export interface TabItem {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  disabled?: boolean;
}

export interface CustomTabsProps {
  items: TabItem[];
  activeKey?: string;
  defaultActiveKey?: string;
  onChange?: (key: string) => void;
  className?: string;
  listClassName?: string;
  contentClassName?: string;
  orientation?: "horizontal" | "vertical";
}

export default function CustomTabs({
  items,
  activeKey,
  defaultActiveKey,
  onChange,
  className,
  listClassName,
  contentClassName,
  orientation = "horizontal",
}: CustomTabsProps) {
  const isControlled = activeKey !== undefined;
  const currentKey = isControlled ? activeKey : defaultActiveKey || items[0]?.key;

  const listRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  const checkScroll = React.useCallback(() => {
    const el = listRef.current;
    if (!el || orientation === "vertical") return;
    const hasScroll = el.scrollWidth > el.clientWidth + 1;
    setCanScrollLeft(hasScroll && el.scrollLeft > 4);
    setCanScrollRight(
      hasScroll && el.scrollLeft < el.scrollWidth - el.clientWidth - 4,
    );
  }, [orientation]);

  React.useEffect(() => {
    checkScroll();
    const el = listRef.current;
    if (!el || orientation === "vertical") return;

    const handleResize = () => checkScroll();
    window.addEventListener("resize", handleResize);

    const resizeObserver = new ResizeObserver(() => {
      checkScroll();
    });
    resizeObserver.observe(el);

    return () => {
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
    };
  }, [checkScroll, items, orientation]);

  // Auto-scroll active tab into view smoothly
  React.useEffect(() => {
    const el = listRef.current;
    if (!el || orientation === "vertical") return;

    const activeEl = el.querySelector<HTMLElement>(
      `[data-slot="tabs-trigger"][data-state="active"], [data-slot="tabs-trigger"][data-active="true"]`,
    );
    if (activeEl) {
      activeEl.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
    checkScroll();
  }, [currentKey, orientation, checkScroll]);

  return (
    <ShadcnTabs
      value={isControlled ? activeKey : undefined}
      defaultValue={
        !isControlled ? defaultActiveKey || items[0]?.key : undefined
      }
      onValueChange={onChange}
      orientation={orientation}
      className={cn(
        "w-full min-w-0 max-w-full flex",
        orientation === "vertical" ? "flex-row gap-6" : "flex-col",
        className,
      )}
    >
      <div className="relative w-full min-w-0 max-w-full">
        {/* Left scroll fade indicator for mobile/touch */}
        {orientation === "horizontal" && canScrollLeft && (
          <div
            className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-6 sm:w-8 bg-linear-to-r from-card to-transparent"
            aria-hidden="true"
          />
        )}

        <TabsList
          ref={listRef}
          variant="line"
          className={cn("scroll-smooth min-w-0 max-w-full", listClassName)}
          onScroll={checkScroll}
        >
          {items.map((item) => (
            <TabsTrigger
              key={item.key}
              value={item.key}
              disabled={item.disabled}
              data-active={currentKey === item.key ? "true" : undefined}
            >
              {item.icon && (
                <span className="flex items-center justify-center shrink-0 leading-none">
                  {item.icon}
                </span>
              )}
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Right scroll fade indicator for mobile/touch */}
        {orientation === "horizontal" && canScrollRight && (
          <div
            className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-6 sm:w-8 bg-linear-to-l from-card to-transparent"
            aria-hidden="true"
          />
        )}
      </div>

      {items.map(
        (item) =>
          item.children && (
            <TabsContent
              key={item.key}
              value={item.key}
              className={cn("mt-4 outline-none w-full", contentClassName)}
            >
              {item.children}
            </TabsContent>
          ),
      )}
    </ShadcnTabs>
  );
}

export { CustomTabs, CustomTabs as Tabs };
