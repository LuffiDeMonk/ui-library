"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import type { ImageZoomLightboxProps } from "./types";

export function ImageZoomLightbox({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
}: ImageZoomLightboxProps) {
  const [currentIndex, setCurrentIndex] = React.useState<number>(initialIndex);
  const [scale, setScale] = React.useState<number>(1);
  const [pan, setPan] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState<boolean>(false);
  const dragStartRef = React.useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = React.useState<boolean>(false);

  // Sync initial index
  React.useEffect(() => {
    setCurrentIndex(initialIndex);
    setScale(1);
    setPan({ x: 0, y: 0 });
  }, [initialIndex, isOpen]);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Lock body scroll while open
  React.useEffect(() => {
    if (isOpen && typeof document !== "undefined") {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const currentImage = images[currentIndex] || images[0];

  const handlePrev = React.useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    setScale(1);
    setPan({ x: 0, y: 0 });
  }, [images.length]);

  const handleNext = React.useCallback(() => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    setScale(1);
    setPan({ x: 0, y: 0 });
  }, [images.length]);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setScale((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  // Keyboard navigation
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "+" || e.key === "=") {
        handleZoomIn();
      } else if (e.key === "-") {
        handleZoomOut();
      } else if (e.key === "0") {
        handleResetZoom();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, handlePrev, handleNext]);

  // Drag pan when zoomed
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - pan.x,
      y: e.clientY - pan.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!isOpen || !isMounted || !currentImage) return null;

  const content = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Full screen image viewer"
      data-testid="image-zoom-lightbox"
      className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 text-white select-none backdrop-blur-md animate-in fade-in-0 duration-200"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Header bar */}
      <div className="flex h-16 w-full items-center justify-between px-6 bg-linear-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-300">
            {currentIndex + 1} / {images.length}
          </span>
          {currentImage.caption && (
            <span className="text-sm text-gray-400 truncate max-w-md hidden sm:inline">
              {currentImage.caption}
            </span>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={scale <= 1}
            title="Zoom out (-)"
            aria-label="Zoom out"
            className="flex h-9 w-9 items-center justify-center rounded-md bg-white/10 hover:bg-white/20 text-white disabled:opacity-40 transition-colors"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="text-xs font-mono w-12 text-center text-gray-300">
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={scale >= 4}
            title="Zoom in (+)"
            aria-label="Zoom in"
            className="flex h-9 w-9 items-center justify-center rounded-md bg-white/10 hover:bg-white/20 text-white disabled:opacity-40 transition-colors"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          {scale > 1 && (
            <button
              type="button"
              onClick={handleResetZoom}
              title="Reset zoom (0)"
              aria-label="Reset zoom"
              className="flex h-9 w-9 items-center justify-center rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
          <div className="h-4 w-px bg-white/20 mx-1" />
          <button
            type="button"
            onClick={onClose}
            title="Close (Esc)"
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-md bg-white/10 hover:bg-red-500/80 text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div
        className={cn(
          "relative flex flex-1 items-center justify-center overflow-hidden p-4",
          scale > 1 ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-default"
        )}
        onMouseDown={handleMouseDown}
      >
        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              title="Previous image"
              aria-label="Previous image"
              className="absolute left-6 top-1/2 z-20 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/90 hover:scale-105 transition-all shadow-lg backdrop-blur-xs"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              title="Next image"
              aria-label="Next image"
              className="absolute right-6 top-1/2 z-20 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/90 hover:scale-105 transition-all shadow-lg backdrop-blur-xs"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Display Image */}
        <div
          style={{
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${scale})`,
            transition: isDragging ? "none" : "transform 200ms ease-out",
          }}
          className="max-h-[75vh] max-w-[85vw] flex items-center justify-center"
        >
          <img
            src={currentImage.zoomSrc || currentImage.src}
            alt={currentImage.alt || "Product image preview"}
            className="max-h-[75vh] max-w-[85vw] object-contain select-none pointer-events-none rounded shadow-2xl"
          />
        </div>
      </div>

      {/* Bottom Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex h-24 w-full items-center justify-center gap-3 px-6 bg-linear-to-t from-black/80 to-transparent overflow-x-auto">
          {images.map((img, idx) => {
            const isSelected = idx === currentIndex;
            return (
              <button
                key={img.id || idx}
                type="button"
                onClick={() => {
                  setCurrentIndex(idx);
                  setScale(1);
                  setPan({ x: 0, y: 0 });
                }}
                className={cn(
                  "relative h-14 w-14 shrink-0 overflow-hidden rounded-md border-2 bg-gray-900 transition-all",
                  isSelected
                    ? "border-amber-500 scale-105 shadow-md shadow-amber-500/20"
                    : "border-transparent opacity-60 hover:opacity-100 hover:border-gray-500"
                )}
              >
                <img
                  src={img.thumbnail || img.src}
                  alt={img.alt || `Thumbnail ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  return typeof document !== "undefined" ? createPortal(content, document.body) : null;
}
