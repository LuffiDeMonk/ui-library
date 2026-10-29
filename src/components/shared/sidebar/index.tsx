"use client";

import * as React from "react";
import {
  Sidebar as BaseSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  SidebarEdgeTrigger,
  useSidebar,
} from "../../ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { cn } from "../../../lib/utils";
import { LogOut } from "lucide-react";

export interface SidebarNavItem {
  title: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }> | React.ReactNode;
  badge?: React.ReactNode;
  isActive?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  items?: {
    title: string;
    href?: string;
    isActive?: boolean;
    onClick?: () => void;
  }[];
}

export interface SidebarNavGroup {
  label?: string;
  items: SidebarNavItem[];
}

export interface SidebarHeaderConfig {
  logo?: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export interface SidebarUserConfig {
  name: string;
  role?: string;
  avatar?: string;
  fallback?: string;
  onLogout?: () => void;
  logoutTooltip?: string;
  isLoggingOut?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export interface SidebarProps extends React.ComponentProps<typeof BaseSidebar> {
  header?: SidebarHeaderConfig | React.ReactNode;
  groups?: SidebarNavGroup[];
  user?: SidebarUserConfig | React.ReactNode;
  footer?: React.ReactNode;
  renderLink?: (
    item: SidebarNavItem,
    content: React.ReactNode,
  ) => React.ReactNode;
  showRail?: boolean;
  /** Whether to render the circular collapse/expand toggle button on the sidebar edge. Defaults to true. */
  showEdgeTrigger?: boolean;
  /** Optional custom class for the edge toggle button. */
  edgeTriggerClassName?: string;
  /** Content rendered inside SidebarInset, i.e. the actual page/app content next to the sidebar. */
  mainContent?: React.ReactNode;
  /** Optional wrapper class for the SidebarInset element. */
  insetClassName?: string;
  /** Pass-through props for SidebarProvider (e.g. defaultOpen, open, onOpenChange). */
  providerProps?: React.ComponentProps<typeof SidebarProvider>;
}

function renderItemIcon(
  icon?: React.ComponentType<{ className?: string }> | React.ReactNode,
) {
  if (!icon) return null;
  if (React.isValidElement(icon)) {
    return icon;
  }
  if (typeof icon === "function") {
    const IconComp = icon as React.ComponentType<{ className?: string }>;
    return <IconComp className="h-4 w-4 shrink-0" />;
  }
  if (
    typeof icon === "object" &&
    icon !== null &&
    "$$typeof" in (icon as unknown as Record<string, unknown>)
  ) {
    const IconComp = icon as unknown as React.ComponentType<{
      className?: string;
    }>;
    return <IconComp className="h-4 w-4 shrink-0" />;
  }
  return null;
}

function Sidebar({
  header,
  groups,
  user,
  footer,
  renderLink,
  showRail = false,
  showEdgeTrigger = true,
  edgeTriggerClassName,
  children,
  mainContent,
  insetClassName,
  providerProps,
  className,
  collapsible = "icon",
  variant = "sidebar",
  ...props
}: SidebarProps) {
  const isPropDriven = Boolean(header || groups || user || footer);

  return (
    <SidebarProvider {...providerProps}>
      <BaseSidebar
        collapsible={collapsible}
        variant={variant}
        className={className}
        {...props}
      >
        {isPropDriven ? (
          <>
            {/* Edge Collapse Toggle Button */}
            {showEdgeTrigger && (
              <SidebarEdgeTrigger className={edgeTriggerClassName} />
            )}

            {/* Header */}
            {header && (
              <SidebarHeader className="border-b border-sidebar-border px-3 py-3 group-data-[collapsible=icon]:px-1.5">
                {React.isValidElement(header) ? (
                  header
                ) : typeof header === "object" ? (
                  (header as SidebarHeaderConfig).children ? (
                    (header as SidebarHeaderConfig).children
                  ) : (
                    <div
                      className={cn(
                        "flex items-center gap-3 group-data-[collapsible=icon]:justify-center",
                        (header as SidebarHeaderConfig).className,
                      )}
                    >
                      {(header as SidebarHeaderConfig).logo && (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-xs">
                          {(header as SidebarHeaderConfig).logo}
                        </div>
                      )}
                      {((header as SidebarHeaderConfig).title ||
                        (header as SidebarHeaderConfig).subtitle) && (
                        <div className="flex flex-col overflow-hidden transition-all group-data-[collapsible=icon]:hidden">
                          {(header as SidebarHeaderConfig).title && (
                            <span className="truncate text-sm font-bold tracking-tight text-sidebar-foreground">
                              {(header as SidebarHeaderConfig).title}
                            </span>
                          )}
                          {(header as SidebarHeaderConfig).subtitle && (
                            <span className="truncate text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                              {(header as SidebarHeaderConfig).subtitle}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )
                ) : null}
              </SidebarHeader>
            )}

            {/* Navigation Content */}
            <SidebarContent>
              {groups?.map((group, groupIdx) => (
                <SidebarGroup key={group.label || groupIdx}>
                  {group.label && (
                    <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                  )}
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {group.items.map((item) => {
                        const iconElement = renderItemIcon(item.icon);
                        const hasSubItems = Boolean(
                          item.items && item.items.length > 0,
                        );

                        const buttonContent = (
                          <>
                            {iconElement}
                            <span>{item.title}</span>
                          </>
                        );

                        return (
                          <SidebarMenuItem key={item.title}>
                            {renderLink && item.href ? (
                              <SidebarMenuButton
                                asChild
                                isActive={item.isActive}
                                disabled={item.disabled}
                                tooltip={item.title}
                                onClick={item.onClick}
                              >
                                {renderLink(item, buttonContent)}
                              </SidebarMenuButton>
                            ) : item.href ? (
                              <SidebarMenuButton
                                asChild
                                isActive={item.isActive}
                                disabled={item.disabled}
                                tooltip={item.title}
                                onClick={item.onClick}
                              >
                                <a href={item.href}>{buttonContent}</a>
                              </SidebarMenuButton>
                            ) : (
                              <SidebarMenuButton
                                isActive={item.isActive}
                                disabled={item.disabled}
                                tooltip={item.title}
                                onClick={item.onClick}
                              >
                                {buttonContent}
                              </SidebarMenuButton>
                            )}
                            {item.badge && (
                              <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                            )}

                            {/* Sub-items if any */}
                            {hasSubItems && (
                              <SidebarMenuSub>
                                {item.items!.map((subItem) => (
                                  <SidebarMenuSubItem key={subItem.title}>
                                    {renderLink && subItem.href ? (
                                      <SidebarMenuSubButton
                                        asChild
                                        isActive={subItem.isActive}
                                        onClick={subItem.onClick}
                                      >
                                        {renderLink(
                                          {
                                            title: subItem.title,
                                            href: subItem.href,
                                            isActive: subItem.isActive,
                                          },
                                          <span>{subItem.title}</span>,
                                        )}
                                      </SidebarMenuSubButton>
                                    ) : subItem.href ? (
                                      <SidebarMenuSubButton
                                        asChild
                                        isActive={subItem.isActive}
                                        onClick={subItem.onClick}
                                      >
                                        <a href={subItem.href}>
                                          <span>{subItem.title}</span>
                                        </a>
                                      </SidebarMenuSubButton>
                                    ) : (
                                      <SidebarMenuSubButton
                                        isActive={subItem.isActive}
                                        onClick={subItem.onClick}
                                      >
                                        <span>{subItem.title}</span>
                                      </SidebarMenuSubButton>
                                    )}
                                  </SidebarMenuSubItem>
                                ))}
                              </SidebarMenuSub>
                            )}
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              ))}
              {children}
            </SidebarContent>

            {/* User Profile / Footer */}
            {(user || footer) && (
              <SidebarFooter className="border-t border-sidebar-border p-3 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-3">
                {React.isValidElement(user) ? (
                  user
                ) : user && typeof user === "object" ? (
                  (user as SidebarUserConfig).children ? (
                    (user as SidebarUserConfig).children
                  ) : (
                    <div
                      className={cn(
                        "flex items-center justify-between gap-2 overflow-hidden group-data-[collapsible=icon]:justify-center",
                        (user as SidebarUserConfig).className,
                      )}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:justify-center">
                        <Avatar className="h-8 w-8 shrink-0">
                          {(user as SidebarUserConfig).avatar && (
                            <AvatarImage
                              src={(user as SidebarUserConfig).avatar}
                              alt={(user as SidebarUserConfig).name}
                            />
                          )}
                          <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold">
                            {(user as SidebarUserConfig).fallback ||
                              (user as SidebarUserConfig).name
                                .slice(0, 2)
                                .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
                          <span className="truncate text-xs font-semibold text-sidebar-foreground">
                            {(user as SidebarUserConfig).name}
                          </span>
                          {(user as SidebarUserConfig).role && (
                            <span className="truncate text-[10px] text-muted-foreground capitalize">
                              {(user as SidebarUserConfig).role}
                            </span>
                          )}
                        </div>
                      </div>
                      {(user as SidebarUserConfig).onLogout && (
                        <button
                          type="button"
                          onClick={(user as SidebarUserConfig).onLogout}
                          disabled={(user as SidebarUserConfig).isLoggingOut}
                          className="group-data-[collapsible=icon]:hidden rounded-md p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors cursor-pointer"
                          title={
                            (user as SidebarUserConfig).logoutTooltip ||
                            "Log out"
                          }
                        >
                          <LogOut className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )
                ) : null}
                {footer}
              </SidebarFooter>
            )}

            {/* Edge Rail */}
            {showRail && <SidebarRail />}
          </>
        ) : (
          children
        )}
      </BaseSidebar>

      {/* Main content area, composed here instead of being left to the consumer */}
      <SidebarInset className={cn("min-w-0 max-w-full overflow-x-hidden", insetClassName)}>{mainContent}</SidebarInset>
    </SidebarProvider>
  );
}

export { Sidebar, SidebarTrigger, SidebarEdgeTrigger, useSidebar };
