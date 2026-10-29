"use client";

import * as React from "react";
import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
} from "../../../components/ui/pagination";
import { Button } from "../../../components/shared/button";
import { Select, type SelectOption } from "../select";
import { Skeleton } from "../../../components/ui/skeleton";
import { cn } from "../../../lib/utils";

export interface PaginationProps {
  /**
   * Current page number (1-indexed).
   */
  currentPage: number;
  /**
   * Total number of items across all pages.
   */
  totalItems: number;
  /**
   * Number of items per page.
   */
  itemsPerPage: number;
  /**
   * Callback fired when the page changes.
   */
  onPageChange: (page: number) => void;
  /**
   * Optional label for items (default: "transactions").
   */
  label?: string;
  /**
   * Additional className for the container.
   */
  className?: string;
  /**
   * Custom content to replace the default "Rows per page" text.
   */
  rowsPerPageLabel?: ReactNode;
  /**
   * Available page size options for the selector.
   */
  pageSizeOptions?: number[];
  /**
   * Whether to show the page size selector.
   */
  showPageSizeSelector?: boolean;
  /**
   * Callback fired when page size changes.
   */
  onPageSizeChange?: (pageSize: number) => void;
  /**
   * Whether the pagination is in a loading state.
   */
  isLoading?: boolean;
}

function getPageNumbers(
  currentPage: number,
  totalPages: number,
): (number | "...")[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [1];

  if (currentPage > 3) {
    pages.push("...");
  }

  const start =
    currentPage <= 2
      ? 2
      : currentPage >= totalPages - 1
        ? Math.max(2, totalPages - 2)
        : Math.max(2, currentPage - 1);

  const end =
    currentPage <= 2
      ? Math.min(totalPages - 1, 3)
      : currentPage >= totalPages - 1
        ? totalPages - 1
        : Math.min(totalPages - 1, currentPage + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (currentPage < totalPages - 2) {
    pages.push("...");
  }

  pages.push(totalPages);

  return pages.filter((page, index, arr) => arr.indexOf(page) === index);
}

export function PaginationComponent({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  label = "transactions",
  className,
  rowsPerPageLabel,
  pageSizeOptions = [10, 20, 25, 50, 100],
  showPageSizeSelector = true,
  onPageSizeChange,
  isLoading = false,
}: PaginationProps) {
  if (isLoading) {
    return (
      <div
        data-slot="pagination-skeleton"
        aria-busy="true"
        aria-label="Loading pagination"
        className={cn(
          "flex flex-col items-center justify-between gap-4 p-4 md:flex-row",
          className,
        )}
      >
        <div className="flex w-full items-center gap-3 md:w-auto">
          <Skeleton className="h-4 w-44 rounded" />
        </div>

        <div className="flex w-full flex-wrap items-center justify-between gap-3 sm:justify-end sm:gap-4 md:w-auto">
          {showPageSizeSelector && (
            <div className="flex items-center gap-2">
              <Skeleton className="h-3.5 w-24 rounded" />
              <Skeleton className="h-8 w-20 rounded" />
            </div>
          )}
          <div className="flex items-center gap-1">
            <Skeleton className="h-9 w-9 rounded" />
            <Skeleton className="h-9 min-w-10 rounded" />
            <Skeleton className="h-9 min-w-10 rounded" />
            <Skeleton className="h-9 min-w-10 rounded" />
            <Skeleton className="h-9 w-9 rounded" />
          </div>
        </div>
      </div>
    );
  }
  const totalPages =
    totalItems === 0 ? 1 : Math.ceil(totalItems / itemsPerPage);
  const safePage = Math.max(1, Math.min(currentPage, totalPages));

  const startItem = totalItems === 0 ? 0 : (safePage - 1) * itemsPerPage + 1;
  const endItem =
    totalItems === 0 ? 0 : Math.min(safePage * itemsPerPage, totalItems);

  const handlePrevious = () => {
    if (safePage > 1) {
      onPageChange(safePage - 1);
    }
  };

  const handleNext = () => {
    if (safePage < totalPages) {
      onPageChange(safePage + 1);
    }
  };

  const effectivePageSizeOptions = React.useMemo(() => {
    const set = new Set(pageSizeOptions);
    if (itemsPerPage && Number.isFinite(itemsPerPage) && itemsPerPage > 0) {
      set.add(itemsPerPage);
    }
    return Array.from(set).sort((a, b) => a - b);
  }, [pageSizeOptions, itemsPerPage]);

  const pageSizeSelectOptions: SelectOption[] = React.useMemo(
    () =>
      effectivePageSizeOptions.map((size) => ({
        label: String(size),
        value: String(size),
      })),
    [effectivePageSizeOptions],
  );

  const handlePageSizeChange = (value: string | null) => {
    if (!value) return;
    const newPageSize = Number(value);
    if (onPageSizeChange) {
      onPageSizeChange(newPageSize);
    } else {
      onPageChange(1);
    }
  };

  const pageNumbers = getPageNumbers(safePage, totalPages);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-between gap-4 p-4 md:flex-row",
        className,
      )}
    >
      <div className="flex w-full items-center gap-3 text-xs text-muted-foreground md:w-auto">
        <span className="text-xs">
          Showing {startItem}–{endItem} of {totalItems} {label}
        </span>
      </div>

      <div className="flex w-full flex-wrap items-center justify-between gap-3 sm:justify-end sm:gap-4 md:w-auto">
        {showPageSizeSelector && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {rowsPerPageLabel ?? "Rows per page:"}
            </span>
            <div className="w-20">
              <Select
                options={pageSizeSelectOptions}
                value={String(itemsPerPage)}
                onValueChange={handlePageSizeChange}
                placeholder={String(itemsPerPage)}
                className="h-8 min-h-8 px-2.5 py-1 text-xs"
              />
            </div>
          </div>
        )}
        <Pagination className="mx-0 w-auto justify-end">
          <PaginationContent className="gap-1">
            <PaginationItem>
              <PaginationLink
                isActive={false}
                size="icon"
                onClick={handlePrevious}
                disabled={safePage <= 1}
                aria-label="Previous page"
              >
                <ChevronLeft className="size-5" />
              </PaginationLink>
            </PaginationItem>

            {pageNumbers.map((page, idx) =>
              page === "..." ? (
                <PaginationItem key={`ellipsis-${idx}`}>
                  <PaginationEllipsis>
                    <MoreHorizontal className="size-4" />
                    <span className="sr-only">More pages</span>
                  </PaginationEllipsis>
                </PaginationItem>
              ) : (
                <PaginationItem key={page}>
                  <PaginationLink
                    isActive={page === safePage}
                    size="icon"
                    onClick={() => onPageChange(page)}
                    aria-label={`Go to page ${page}`}
                    aria-current={page === safePage ? "page" : undefined}
                    className={cn(
                      "min-w-10",
                      page === safePage &&
                        "bg-gray-900 text-white hover:bg-gray-900/90",
                    )}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ),
            )}

            <PaginationItem>
              <PaginationLink
                isActive={false}
                size="icon"
                onClick={handleNext}
                disabled={safePage >= totalPages}
                aria-label="Next page"
              >
                <ChevronRight className="size-5" />
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}

export { PaginationComponent as Pagination };
