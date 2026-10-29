"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "../../../lib/utils";

export type TooltipPlacement =
  | "top"
  | "left"
  | "right"
  | "bottom"
  | "topLeft"
  | "topRight"
  | "bottomLeft"
  | "bottomRight"
  | "leftTop"
  | "leftBottom"
  | "rightTop"
  | "rightBottom";

export type TooltipTriggerType = "hover" | "focus" | "click" | "contextMenu";

const PLACEMENT_MAP: Record<
  TooltipPlacement,
  {
    side: "top" | "bottom" | "left" | "right";
    align: "start" | "center" | "end";
  }
> = {
  top: { side: "top", align: "center" },
  topLeft: { side: "top", align: "start" },
  topRight: { side: "top", align: "end" },
  bottom: { side: "bottom", align: "center" },
  bottomLeft: { side: "bottom", align: "start" },
  bottomRight: { side: "bottom", align: "end" },
  left: { side: "left", align: "center" },
  leftTop: { side: "left", align: "start" },
  leftBottom: { side: "left", align: "end" },
  right: { side: "right", align: "center" },
  rightTop: { side: "right", align: "start" },
  rightBottom: { side: "right", align: "end" },
};

const PRESET_COLORS: Record<string, string> = {
  pink: "#eb2f96",
  red: "#f5222d",
  yellow: "#fadb14",
  orange: "#fa8c16",
  cyan: "#13c2c2",
  green: "#52c41a",
  blue: "#1890ff",
  purple: "#722ed1",
  geekblue: "#2f54eb",
  magenta: "#ff00ff",
  volcano: "#fa541c",
  gold: "#faad14",
  lime: "#a0d911",
};

export interface TooltipProps {
  /** The content to show in the tooltip popup */
  title?: React.ReactNode | (() => React.ReactNode);
  /** The position of the tooltip relative to the target */
  placement?: TooltipPlacement;
  /** How the tooltip is triggered: 'hover' | 'focus' | 'click' | 'contextMenu' */
  trigger?: TooltipTriggerType | TooltipTriggerType[];
  /** Controlled open state */
  open?: boolean;
  /** Uncontrolled initial open state */
  defaultOpen?: boolean;
  /** Callback executed when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Background color of the tooltip (preset name like 'red' or hex/rgb) */
  color?: string;
  /** Whether to show the arrow pointer */
  arrow?: boolean | { pointAtCenter?: boolean };
  /** Delay in seconds before showing tooltip on hover */
  mouseEnterDelay?: number;
  /** Delay in seconds before hiding tooltip on hover */
  mouseLeaveDelay?: number;
  /** Custom CSS class for the tooltip overlay */
  overlayClassName?: string;
  className?: string;
  /** Custom inline style for the tooltip overlay */
  overlayStyle?: React.CSSProperties;
  style?: React.CSSProperties;
  /** z-index of the tooltip popup */
  zIndex?: number;
  /** Target element that triggers the tooltip */
  children: React.ReactNode;
}

export function Tooltip({
  title,
  placement = "top",
  trigger = "hover",
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  color,
  arrow = true,
  mouseEnterDelay = 0.1,
  mouseLeaveDelay = 0.1,
  overlayClassName,
  className,
  overlayStyle,
  style,
  zIndex = 50,
  children,
}: TooltipProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

  const triggers = Array.isArray(trigger) ? trigger : [trigger];
  const triggerHover = triggers.includes("hover");
  const triggerFocus = triggers.includes("focus");
  const triggerClick = triggers.includes("click");
  const triggerContextMenu = triggers.includes("contextMenu");

  const triggerRef = React.useRef<HTMLButtonElement | null>(null);

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange],
  );

  // If title is null/undefined/empty, render children without tooltip
  const renderedTitle = typeof title === "function" ? title() : title;
  const hasTitle =
    renderedTitle !== null &&
    renderedTitle !== undefined &&
    renderedTitle !== "";

  if (!hasTitle) {
    return children;
  }

  const { side, align } = PLACEMENT_MAP[placement] || PLACEMENT_MAP.top;

  // Resolve custom color if provided
  const resolvedBgColor = color ? PRESET_COLORS[color] || color : undefined;

  // Event handlers for trigger interactions
  const handleClick = (e: React.MouseEvent) => {
    if (triggerClick) {
      handleOpenChange(!isOpen);
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (triggerClick) {
      // Prevent Radix default onClose on pointer down so click can toggle
      e.preventDefault();
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!triggerHover) {
      // Prevent Radix from opening on hover when hover trigger is disabled
      e.preventDefault();
    }
  };

  const handlePointerLeave = (e: React.PointerEvent) => {
    if (!triggerHover) {
      e.preventDefault();
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (triggerContextMenu) {
      e.preventDefault();
      handleOpenChange(!isOpen);
    }
  };

  const handleFocus = (e: React.FocusEvent) => {
    if (!triggerFocus) {
      e.preventDefault();
    } else {
      handleOpenChange(true);
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    if (!triggerFocus) {
      e.preventDefault();
    } else if (!triggerClick) {
      handleOpenChange(false);
    }
  };

  // Ensure child is a valid React element for Radix Slot without using deprecated cloneElement
  const triggerElement = React.isValidElement(children) ? (
    children
  ) : (
    <span>{children}</span>
  );

  return (
    <TooltipPrimitive.Provider
      delayDuration={triggerHover ? mouseEnterDelay * 1000 : 0}
      skipDelayDuration={mouseLeaveDelay * 1000}
    >
      <TooltipPrimitive.Root
        open={isOpen}
        defaultOpen={defaultOpen}
        onOpenChange={handleOpenChange}
      >
        <TooltipPrimitive.Trigger
          asChild
          ref={triggerRef}
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          onContextMenu={handleContextMenu}
          onFocus={handleFocus}
          onBlur={handleBlur}
        >
          {triggerElement}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            align={align}
            sideOffset={6}
            onPointerDownOutside={(e) => {
              if (
                triggerClick &&
                triggerRef.current?.contains(e.target as Node)
              ) {
                e.preventDefault();
              }
            }}
            style={{
              zIndex,
              ...(resolvedBgColor
                ? {
                    backgroundColor: resolvedBgColor,
                    borderColor: resolvedBgColor,
                  }
                : {}),
              ...overlayStyle,
              ...style,
            }}
            className={cn(
              "z-50 max-w-xs rounded-md bg-foreground px-3 py-1.5 text-xs text-background shadow-md",
              "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
              "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2",
              overlayClassName,
              className,
            )}
          >
            {renderedTitle}
            {arrow && (
              <TooltipPrimitive.Arrow
                className="fill-foreground"
                style={resolvedBgColor ? { fill: resolvedBgColor } : undefined}
                width={8}
                height={4}
              />
            )}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
