"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Maximize2,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { ImageZoom } from "./image-zoom";
import { ImageZoomLightbox } from "./image-zoom-lightbox";
import type { ImageZoomGalleryProps } from "./types";

export function ImageZoomGallery({
  images,
  selectedIndex,
  defaultIndex = 0,
  onIndexChange,
  thumbnailPosition = "bottom",
  thumbnailTrigger = "hover",
  thumbnailSize = 64,
  thumbnailGap = 10,
  showNavigationArrows = true,
  enableLightbox = true,
  zoomProps,
  thumbnailsClassName,
  thumbnailItemClassName,
  badge,
  className,
  ...props
}: ImageZoomGalleryProps) {
  // Uncontrolled / controlled index handling
  const [internalIndex, setInternalIndex] =
    React.useState<number>(defaultIndex);
  const activeIndex =
    selectedIndex !== undefined ? selectedIndex : internalIndex;

  // Lightbox state
  const [isLightboxOpen, setIsLightboxOpen] = React.useState<boolean>(false);

  // Thumbnail container ref for scrolling
  const thumbnailsContainerRef = React.useRef<HTMLDivElement | null>(null);

  const handleSelectImage = (index: number) => {
    if (selectedIndex === undefined) {
      setInternalIndex(index);
    }
    onIndexChange?.(index);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const nextIdx = activeIndex > 0 ? activeIndex - 1 : images.length - 1;
    handleSelectImage(nextIdx);
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const nextIdx = activeIndex < images.length - 1 ? activeIndex + 1 : 0;
    handleSelectImage(nextIdx);
  };

  // Thumbnail scroll controls
  const scrollThumbnails = (direction: "prev" | "next") => {
    if (!thumbnailsContainerRef.current) return;
    const isVertical =
      thumbnailPosition === "left" || thumbnailPosition === "right";
    const delta = (thumbnailSize + thumbnailGap) * 2;
    if (isVertical) {
      thumbnailsContainerRef.current.scrollBy({
        top: direction === "next" ? delta : -delta,
        behavior: "smooth",
      });
    } else {
      thumbnailsContainerRef.current.scrollBy({
        left: direction === "next" ? delta : -delta,
        behavior: "smooth",
      });
    }
  };

  const currentImage = images[activeIndex] || images[0];
  if (!currentImage) return null;

  const isVertical =
    thumbnailPosition === "left" || thumbnailPosition === "right";

  // Thumbnail list component
  const renderThumbnails = () => {
    if (images.length <= 1) return null;

    return (
      <div
        className={cn(
          "relative flex items-center group/thumbs",
          isVertical ? "flex-col justify-center" : "flex-row justify-center",
          thumbnailPosition === "left" && "order-1",
          thumbnailPosition === "right" && "order-2",
          thumbnailPosition === "bottom" && "order-2 w-full mt-3",
          thumbnailsClassName,
        )}
      >
        {/* Scroll back button */}
        {images.length > 4 && (
          <button
            type="button"
            onClick={() => scrollThumbnails("prev")}
            title="Scroll thumbnails back"
            aria-label="Scroll thumbnails back"
            className={cn(
              "z-10 flex items-center justify-center rounded-full bg-white/90 shadow-md text-gray-700 hover:bg-white hover:text-black dark:bg-gray-800/90 dark:text-gray-200 dark:hover:bg-gray-800 transition-all border border-gray-200 dark:border-gray-700",
              isVertical ? "h-7 w-7 mb-1.5" : "h-7 w-7 mr-1.5 -ml-2",
            )}
          >
            {isVertical ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        )}

        {/* Scrollable list of thumbnails */}
        <div
          ref={thumbnailsContainerRef}
          role="tablist"
          aria-label="Product thumbnails"
          className={cn(
            "flex scroll-smooth no-scrollbar",
            isVertical
              ? "flex-col overflow-y-auto max-h-115 py-1"
              : "flex-row overflow-x-auto max-w-full py-1",
          )}
          style={{ gap: `${thumbnailGap}px` }}
        >
          {images.map((img, index) => {
            const isSelected = index === activeIndex;

            const handleTrigger = () => {
              handleSelectImage(index);
            };

            return (
              <button
                key={img.id || index}
                type="button"
                role="tab"
                aria-selected={isSelected}
                aria-label={img.alt || `Product image ${index + 1}`}
                onClick={handleTrigger}
                onMouseEnter={
                  thumbnailTrigger === "hover" ? handleTrigger : undefined
                }
                className={cn(
                  "relative shrink-0 cursor-pointer overflow-hidden rounded-md border-2 bg-white transition-all dark:bg-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500",
                  isSelected
                    ? "border-amber-500 ring-2 ring-amber-500/20 shadow-sm"
                    : "border-gray-200 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-500 opacity-75 hover:opacity-100",
                  thumbnailItemClassName,
                )}
                style={{
                  width: `${thumbnailSize}px`,
                  height: `${thumbnailSize}px`,
                }}
              >
                <img
                  src={img.thumbnail || img.src}
                  alt={img.alt || `Thumbnail ${index + 1}`}
                  className="h-full w-full object-cover select-none pointer-events-none"
                  loading="lazy"
                />
              </button>
            );
          })}
        </div>

        {/* Scroll forward button */}
        {images.length > 4 && (
          <button
            type="button"
            onClick={() => scrollThumbnails("next")}
            title="Scroll thumbnails forward"
            aria-label="Scroll thumbnails forward"
            className={cn(
              "z-10 flex items-center justify-center rounded-full bg-white/90 shadow-md text-gray-700 hover:bg-white hover:text-black dark:bg-gray-800/90 dark:text-gray-200 dark:hover:bg-gray-800 transition-all border border-gray-200 dark:border-gray-700",
              isVertical ? "h-7 w-7 mt-1.5" : "h-7 w-7 ml-1.5 -mr-2",
            )}
          >
            {isVertical ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    );
  };

  return (
    <div
      className={cn(
        "relative flex select-none",
        isVertical ? "flex-row items-start gap-4" : "flex-col items-center",
        className,
      )}
      {...props}
    >
      {/* Thumbnails (if left-positioned) */}
      {thumbnailPosition === "left" && renderThumbnails()}

      {/* Main Image Viewport with Zoom */}
      <div
        className={cn(
          "relative w-full max-w-full group/main rounded-lg border border-gray-200 bg-white p-2 dark:border-gray-800 dark:bg-gray-950",
          thumbnailPosition === "left" && "order-2 flex-1",
          thumbnailPosition === "right" && "order-1 flex-1",
          thumbnailPosition === "bottom" && "order-1",
        )}
      >
        <ImageZoom
          src={currentImage.src}
          zoomSrc={currentImage.zoomSrc}
          alt={currentImage.alt}
          onImageClick={
            enableLightbox ? () => setIsLightboxOpen(true) : undefined
          }
          overlay={
            <>
              {/* Product Badge (e.g. Sale, Exclusive) */}
              {(badge || currentImage.badge) && (
                <div className="absolute top-3 left-3 z-20 pointer-events-none">
                  {currentImage.badge || badge}
                </div>
              )}

              {/* Lightbox full-screen button */}
              {enableLightbox && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLightboxOpen(true);
                  }}
                  title="View full screen"
                  aria-label="View full screen"
                  className="pointer-events-auto absolute bottom-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-md bg-white/90 text-gray-700 shadow-md backdrop-blur-xs hover:bg-white hover:text-black dark:bg-gray-900/90 dark:text-gray-200 dark:hover:bg-gray-900 transition-transform hover:scale-105"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              )}

              {/* Navigation arrows overlay */}
              {showNavigationArrows && images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrev}
                    title="Previous image"
                    aria-label="Previous image"
                    className="pointer-events-auto absolute left-2 top-1/2 z-20 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-md backdrop-blur-xs hover:bg-white hover:text-black dark:bg-gray-900/90 dark:text-gray-200 dark:hover:bg-gray-900 opacity-0 group-hover/main:opacity-100 transition-opacity"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    title="Next image"
                    aria-label="Next image"
                    className="pointer-events-auto absolute right-2 top-1/2 z-20 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-md backdrop-blur-xs hover:bg-white hover:text-black dark:bg-gray-900/90 dark:text-gray-200 dark:hover:bg-gray-900 opacity-0 group-hover/main:opacity-100 transition-opacity"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </>
          }
          {...zoomProps}
        />
      </div>

      {/* Thumbnails (if right or bottom positioned) */}
      {(thumbnailPosition === "bottom" || thumbnailPosition === "right") &&
        renderThumbnails()}

      {/* Lightbox Modal */}
      {enableLightbox && (
        <ImageZoomLightbox
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          images={images}
          initialIndex={activeIndex}
        />
      )}
    </div>
  );
}
