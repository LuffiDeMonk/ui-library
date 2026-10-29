"use client";

import {
  type ComponentProps,
  type CSSProperties,
  isValidElement,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  useCallback,
  useState,
} from "react";
import { X } from "lucide-react";
import {
  Drawer as ShadcnDrawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../../ui/drawer";
import { cn } from "../../../lib/utils";

export type DrawerPlacement = "top" | "right" | "bottom" | "left";
export type DrawerSize = "default" | "large";

export interface DrawerClassNames {
  header?: string;
  body?: string;
  footer?: string;
  mask?: string;
  content?: string;
  wrapper?: string;
}

export interface DrawerStyles {
  header?: CSSProperties;
  body?: CSSProperties;
  footer?: CSSProperties;
  mask?: CSSProperties;
  content?: CSSProperties;
  wrapper?: CSSProperties;
}

export interface DrawerClosableConfig {
  closeIcon?: ReactNode;
  placement?: "start" | "end";
}

export interface DrawerProps {
  open?: boolean;
  visible?: boolean;
  defaultOpen?: boolean;
  onClose?: (e?: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => void;
  onOpenChange?: (open: boolean) => void;
  afterOpenChange?: (open: boolean) => void;
  placement?: DrawerPlacement;
  size?: DrawerSize;
  width?: number | string;
  height?: number | string;
  title?: ReactNode;
  description?: ReactNode;
  extra?: ReactNode;
  footer?: ReactNode;
  closable?: boolean | DrawerClosableConfig;
  closeIcon?: ReactNode;
  closeIconPosition?: "start" | "end";
  mask?: boolean;
  maskClosable?: boolean;
  maskClassName?: string;
  maskStyle?: CSSProperties;
  destroyOnClose?: boolean;
  keyboard?: boolean;
  zIndex?: number;
  className?: string;
  style?: CSSProperties;
  rootClassName?: string;
  rootStyle?: CSSProperties;
  classNames?: DrawerClassNames;
  styles?: DrawerStyles;
  headerStyle?: CSSProperties;
  bodyStyle?: CSSProperties;
  footerStyle?: CSSProperties;
  children?: ReactNode;
  trigger?: ReactNode;
  showSwipeHandle?: boolean;
}

const swipeDirectionMap: Record<
  DrawerPlacement,
  "left" | "right" | "up" | "down"
> = {
  left: "left",
  right: "right",
  top: "up",
  bottom: "down",
};

export function DrawerBody({
  className,
  children,
  style,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-body"
      className={cn(
        "min-h-0 flex-1 overflow-y-auto p-4 text-sm text-foreground sm:p-5",
        className
      )}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}

function DrawerRoot({
  open: controlledOpen,
  visible,
  defaultOpen = false,
  onClose,
  onOpenChange,
  afterOpenChange,
  placement = "right",
  size = "default",
  width,
  height,
  title,
  description,
  extra,
  footer,
  closable = true,
  closeIcon,
  closeIconPosition = "end",
  mask = true,
  maskClosable = true,
  maskClassName,
  maskStyle,
  destroyOnClose = false,
  keyboard = true,
  zIndex,
  className,
  style,
  rootClassName,
  rootStyle,
  classNames,
  styles,
  headerStyle,
  bodyStyle,
  footerStyle,
  children,
  trigger,
  showSwipeHandle: customShowSwipeHandle,
}: DrawerProps): ReactElement | null {
  const showSwipeHandle =
    customShowSwipeHandle !== undefined
      ? customShowSwipeHandle
      : placement === "bottom";
  const isControlled = controlledOpen !== undefined || visible !== undefined;
  const effectiveOpenProp =
    controlledOpen !== undefined ? controlledOpen : visible;

  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = isControlled ? Boolean(effectiveOpenProp) : uncontrolledOpen;

  const handleOpenChange = useCallback(
    (nextOpen: boolean, eventDetails?: any) => {
      if (
        !nextOpen &&
        keyboard === false &&
        eventDetails?.reason === "escape-key"
      ) {
        return;
      }

      if (
        !nextOpen &&
        maskClosable === false &&
        eventDetails?.reason === "outside-press"
      ) {
        return;
      }

      if (!isControlled) {
        setUncontrolledOpen(nextOpen);
      }

      onOpenChange?.(nextOpen);
      afterOpenChange?.(nextOpen);

      if (!nextOpen) {
        onClose?.();
      }
    },
    [
      isControlled,
      keyboard,
      maskClosable,
      onOpenChange,
      afterOpenChange,
      onClose,
    ]
  );

  const isClosable = typeof closable === "object" ? true : closable !== false;
  const resolvedCloseIconPosition =
    typeof closable === "object" && closable.placement
      ? closable.placement
      : closeIconPosition;
  const resolvedCloseIcon =
    (typeof closable === "object" ? closable.closeIcon : undefined) ??
    closeIcon ?? <X className="size-4" />;

  const handleCloseClick = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      handleOpenChange(false);
      onClose?.(e);
    },
    [handleOpenChange, onClose]
  );

  const defaultWidth = size === "large" ? 736 : 378;
  const defaultHeight = size === "large" ? 736 : 378;

  const resolvedWidth =
    width !== undefined
      ? typeof width === "number"
        ? `${width}px`
        : width
      : `${defaultWidth}px`;

  const resolvedHeight =
    height !== undefined
      ? typeof height === "number"
        ? `${height}px`
        : height
      : placement === "bottom"
        ? "90dvh"
        : `${defaultHeight}px`;

  const isHorizontal = placement === "left" || placement === "right";

  const mergedStyle: CSSProperties = {
    ...(isHorizontal
      ? {
          ["--drawer-content-width" as any]: resolvedWidth,
          width: resolvedWidth,
          maxWidth: "100vw",
        }
      : {
          ["--drawer-content-height" as any]: resolvedHeight,
          height: resolvedHeight,
          maxHeight: "95dvh",
        }),
    ...(zIndex !== undefined ? { zIndex } : {}),
    ...style,
    ...styles?.content,
  };

  const closeButton = isClosable ? (
    <button
      type="button"
      aria-label="Close"
      onClick={handleCloseClick}
      className="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden"
    >
      {resolvedCloseIcon}
    </button>
  ) : null;

  const hasHeader = Boolean(title || extra || isClosable);

  const headerElement = hasHeader ? (
    <div
      data-slot="drawer-header"
      className={cn(
        "flex shrink-0 items-center justify-between border-b border-border px-4 py-3 sm:px-5 sm:py-4",
        classNames?.header
      )}
      style={{ ...headerStyle, ...styles?.header }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        {resolvedCloseIconPosition === "start" && closeButton}
        {title ? (
          <DrawerTitle className="truncate text-base font-semibold tracking-tight text-foreground">
            {title}
          </DrawerTitle>
        ) : (
          <DrawerTitle className="sr-only">Drawer</DrawerTitle>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {extra && <div className="flex items-center gap-1.5">{extra}</div>}
        {resolvedCloseIconPosition === "end" && closeButton}
      </div>
    </div>
  ) : (
    <DrawerTitle className="sr-only">Drawer</DrawerTitle>
  );

  const bodyElement = (
    <DrawerBody
      className={classNames?.body}
      style={{ ...bodyStyle, ...styles?.body }}
    >
      {children}
    </DrawerBody>
  );

  const footerElement = footer ? (
    <div
      data-slot="drawer-footer"
      className={cn(
        "flex shrink-0 items-center justify-end gap-2 border-t border-border bg-background px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] sm:px-5 sm:py-3.5 sm:pb-3.5",
        classNames?.footer
      )}
      style={{ ...footerStyle, ...styles?.footer }}
    >
      {footer}
    </div>
  ) : null;

  const swipeDirection = swipeDirectionMap[placement];

  return (
    <ShadcnDrawer
      open={isOpen}
      onOpenChange={handleOpenChange}
      modal={mask}
      disablePointerDismissal={!maskClosable}
      swipeDirection={swipeDirection}
      showSwipeHandle={showSwipeHandle}
    >
      {trigger && (
        <DrawerTrigger
          render={
            isValidElement(trigger) ? (trigger as ReactElement) : undefined
          }
        >
          {!isValidElement(trigger) ? trigger : undefined}
        </DrawerTrigger>
      )}

      <DrawerContent
        className={cn(
          "bg-background text-foreground shadow-2xl transition-all",
          isHorizontal && "h-full",
          rootClassName,
          classNames?.wrapper,
          className,
          classNames?.content
        )}
        style={{ ...rootStyle, ...styles?.wrapper, ...mergedStyle }}
        overlayClassName={cn(maskClassName, classNames?.mask)}
        overlayStyle={{ ...maskStyle, ...styles?.mask }}
      >
        {description ? (
          <DrawerDescription className="sr-only">
            {description}
          </DrawerDescription>
        ) : (
          <DrawerDescription className="sr-only">
            Drawer dialog
          </DrawerDescription>
        )}

        {destroyOnClose && !isOpen ? null : (
          <>
            {headerElement}
            {bodyElement}
            {footerElement}
          </>
        )}
      </DrawerContent>
    </ShadcnDrawer>
  );
}

export interface DrawerComponent {
  (props: DrawerProps): ReactElement | null;
  Header: typeof DrawerHeader;
  Title: typeof DrawerTitle;
  Description: typeof DrawerDescription;
  Body: typeof DrawerBody;
  Footer: typeof DrawerFooter;
  Close: typeof DrawerClose;
  Trigger: typeof DrawerTrigger;
}

export const Drawer: DrawerComponent = Object.assign(DrawerRoot, {
  Header: DrawerHeader,
  Title: DrawerTitle,
  Description: DrawerDescription,
  Body: DrawerBody,
  Footer: DrawerFooter,
  Close: DrawerClose,
  Trigger: DrawerTrigger,
});

export {
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
  DrawerTrigger,
};
