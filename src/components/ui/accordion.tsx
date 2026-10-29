"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";

const Accordion = AccordionPrimitive.Root;
const AccordionHeader = AccordionPrimitive.Header;

function AccordionItem({
  className,
  ref,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item> & {
  ref?: React.Ref<React.ComponentRef<typeof AccordionPrimitive.Item>>;
}) {
  return (
    <AccordionPrimitive.Item
      ref={ref}
      className={cn("border-b border-gray-200 dark:border-gray-800", className)}
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  ref,
  hideChevron = false,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger> & {
  ref?: React.Ref<React.ComponentRef<typeof AccordionPrimitive.Trigger>>;
  hideChevron?: boolean;
}) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          "flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all cursor-pointer [&[data-state=open]>svg.accordion-chevron]:rotate-180",
          className
        )}
        {...props}
      >
        {children}
        {!hideChevron && (
          <ChevronDown className="accordion-chevron h-4 w-4 shrink-0 text-gray-500 transition-transform duration-200 dark:text-gray-400" />
        )}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ref,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content> & {
  ref?: React.Ref<React.ComponentRef<typeof AccordionPrimitive.Content>>;
}) {
  return (
    <AccordionPrimitive.Content
      ref={ref}
      className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div className={cn("pb-4 pt-0", className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionContent,
  AccordionPrimitive,
};
