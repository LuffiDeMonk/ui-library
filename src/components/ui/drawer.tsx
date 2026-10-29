"use client";

import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";

import { cn } from "../../lib/utils";

type Direction = "top" | "bottom" | "left" | "right";
type SwipeDirection = Direction | "up" | "down";

interface DrawerContextValue {
  direction?: Direction;
  showSwipeHandle?: boolean;
  modal?: boolean;
}

const DrawerContext = React.createContext<DrawerContextValue>({
  direction: "bottom",
  showSwipeHandle: false,
  modal: true,
});

function normalizeDirection(dir?: SwipeDirection): Direction {
  if (dir === "up") return "top";
  if (dir === "down") return "bottom";
  return dir ?? "bottom";
}

export type DrawerPrimitiveProps = React.ComponentProps<
  typeof DrawerPrimitive.Root
> & {
  swipeDirection?: SwipeDirection;
  disablePointerDismissal?: boolean;
  showSwipeHandle?: boolean;
};

function Drawer({
  shouldScaleBackground = true,
  direction,
  swipeDirection,
  disablePointerDismissal,
  dismissible,
  showSwipeHandle,
  modal = true,
  children,
  ...props
}: DrawerPrimitiveProps) {
  const resolvedDirection = normalizeDirection(swipeDirection ?? direction);
  const resolvedDismissible =
    disablePointerDismissal !== undefined
      ? !disablePointerDismissal
      : dismissible;

  return (
    <DrawerContext.Provider
      value={{
        direction: resolvedDirection,
        showSwipeHandle,
        modal,
      }}
    >
      <DrawerPrimitive.Root
        data-slot="drawer"
        shouldScaleBackground={shouldScaleBackground}
        direction={resolvedDirection}
        dismissible={resolvedDismissible}
        modal={modal}
        {...props}
      >
        {children}
      </DrawerPrimitive.Root>
    </DrawerContext.Provider>
  );
}

export type DrawerTriggerProps = React.ComponentProps<
  typeof DrawerPrimitive.Trigger
> & {
  render?: React.ReactElement;
};

function DrawerTrigger({
  render,
  children,
  asChild,
  ...props
}: DrawerTriggerProps) {
  if (render) {
    return (
      <DrawerPrimitive.Trigger data-slot="drawer-trigger" asChild {...props}>
        {render}
      </DrawerPrimitive.Trigger>
    );
  }
  return (
    <DrawerPrimitive.Trigger
      data-slot="drawer-trigger"
      asChild={asChild}
      {...props}
    >
      {children}
    </DrawerPrimitive.Trigger>
  );
}

function DrawerPortal({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
}

function DrawerClose({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

function DrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  );
}

export type DrawerContentProps = React.ComponentProps<
  typeof DrawerPrimitive.Content
> & {
  overlayClassName?: string;
  overlayStyle?: React.CSSProperties;
  showSwipeHandle?: boolean;
};

function DrawerContent({
  className,
  children,
  overlayClassName,
  overlayStyle,
  showSwipeHandle: contentShowSwipeHandle,
  ...props
}: DrawerContentProps) {
  const { direction, showSwipeHandle: contextShowSwipeHandle, modal } =
    React.useContext(DrawerContext);
  const showHandle = contentShowSwipeHandle ?? contextShowSwipeHandle;

  return (
    <DrawerPortal>
      {modal !== false && (
        <DrawerOverlay className={overlayClassName} style={overlayStyle} />
      )}
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        className={cn(
          "fixed z-50 flex flex-col bg-background text-foreground",
          direction === "bottom" &&
            "inset-x-0 bottom-0 mt-24 rounded-t-lg border-t border-border",
          direction === "top" &&
            "inset-x-0 top-0 mb-24 rounded-b-lg border-b border-border",
          direction === "left" &&
            "inset-y-0 left-0 h-full w-3/4 border-r border-border sm:max-w-sm",
          direction === "right" &&
            "inset-y-0 right-0 h-full w-3/4 border-l border-border sm:max-w-sm",
          className
        )}
        {...props}
      >
        {showHandle && direction === "bottom" && (
          <div className="mx-auto mt-4 h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/20" />
        )}
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  );
}

function DrawerHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn("flex flex-col gap-1.5 p-4 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function DrawerFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn(
        "text-base font-semibold leading-none tracking-tight text-foreground",
        className
      )}
      {...props}
    />
  );
}

function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function DrawerHandle({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Handle>) {
  return (
    <DrawerPrimitive.Handle
      data-slot="drawer-handle"
      className={cn(
        "mx-auto mt-4 h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/20",
        className
      )}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  DrawerHandle,
};
