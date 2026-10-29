import * as React from "react";

export type ZoomType = "side" | "inner" | "lens";
export type ZoomPlacement = "right" | "left" | "top" | "bottom";
export type ThumbnailPosition = "bottom" | "left" | "right";
export type ThumbnailTrigger = "hover" | "click";

export interface ImageZoomProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Source URL of the display image */
  src: string;
  /** Optional high-resolution image URL for zoom. Defaults to `src`. */
  zoomSrc?: string;
  /** Image alternative text */
  alt?: string;
  /**
   * Type of zoom magnification:
   * - `side`: Flyout preview window beside the main image (Daraz & Amazon desktop default)
   * - `inner`: Magnifies the image directly inside the container (Amazon & mobile style)
   * - `lens`: Circular or rectangular magnifying loupe following cursor
   * @default "side"
   */
  zoomType?: ZoomType;
  /** Magnification multiplier (e.g. 2, 2.5, 3). @default 2.5 */
  zoomScale?: number;
  /**
   * Placement of the flyout preview window relative to main image container.
   * @default "right"
   */
  zoomPlacement?: ZoomPlacement;
  /** Distance in pixels between main image and flyout zoom window. @default 16 */
  zoomGap?: number;
  /** Width of the zoom window in pixels. @default 500 */
  zoomWindowWidth?: number;
  /** Height of the zoom window in pixels. @default 500 */
  zoomWindowHeight?: number;
  /** Custom width for the lens overlay (px). If omitted, automatically derived from zoomWindowWidth and zoomScale. */
  lensWidth?: number;
  /** Custom height for the lens overlay (px). If omitted, automatically derived from zoomWindowHeight and zoomScale. */
  lensHeight?: number;
  /** Whether to display the translucent lens highlight box on the main image. @default true */
  showLens?: boolean;
  /** Custom class for the lens overlay */
  lensClassName?: string;
  /** Custom class for the flyout zoom window */
  zoomWindowClassName?: string;
  /** Custom class for the main image element */
  imageClassName?: string;
  /** Custom class for the high-res zoom image inside the zoom window */
  zoomImageClassName?: string;
  /** Custom class for the main image container */
  containerClassName?: string;
  /**
   * Whether to render the zoom flyout via React Portal into document.body
   * to escape overflow:hidden or stacking contexts. @default false
   */
  portal?: boolean;
  /** Custom portal container element if portal is enabled */
  portalContainer?: HTMLElement | null;
  /**
   * Automatically fall back to "inner" zoom on mobile / small screens
   * (<768px) where side flyout would exceed screen width. @default true
   */
  autoResponsive?: boolean;
  /** Aspect ratio of the main image container (e.g. "1/1", "4/3", "16/9", "auto"). @default "1/1" */
  aspectRatio?: string;
  /** Preload the zoom image immediately on mount instead of on first hover. @default false */
  preloadZoom?: boolean;
  /** Callback fired when zoom becomes active */
  onZoomStart?: () => void;
  /** Callback fired when zoom becomes inactive */
  onZoomEnd?: () => void;
  /** Callback fired when the main image container is clicked */
  onImageClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  /** Custom placeholder/spinner rendered while high-res zoom image is loading */
  loadingPlaceholder?: React.ReactNode;
  /** Whether zoom interactions are disabled */
  disabled?: boolean;
  /** Mobile tap-to-toggle zoom behavior. @default true */
  tapToZoom?: boolean;
  /** Overlay content on top of image (e.g. badges, discount pill, watermark) */
  overlay?: React.ReactNode;
}

export interface GalleryImage {
  /** Unique identifier for image */
  id?: string | number;
  /** Display image source */
  src: string;
  /** Optional high-resolution image URL for zoom */
  zoomSrc?: string;
  /** Image alternative text */
  alt?: string;
  /** Optional separate thumbnail image URL (defaults to `src`) */
  thumbnail?: string;
  /** Caption or title for this image */
  caption?: string;
  /** Custom badge text/element for this specific image */
  badge?: React.ReactNode;
}

export interface ImageZoomGalleryProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** List of images to display in the product gallery */
  images: GalleryImage[];
  /** Controlled active image index */
  selectedIndex?: number;
  /** Initial selected image index. @default 0 */
  defaultIndex?: number;
  /** Callback fired when active image index changes */
  onIndexChange?: (index: number) => void;
  /**
   * Position of thumbnails relative to the main image:
   * - `bottom`: classic Daraz / Flipkart layout
   * - `left`: Amazon / Shopify layout
   * - `right`: alternative layout
   * @default "bottom"
   */
  thumbnailPosition?: ThumbnailPosition;
  /** Interaction that changes active thumbnail: "hover" (Daraz style) or "click". @default "hover" */
  thumbnailTrigger?: ThumbnailTrigger;
  /** Size of each thumbnail square in pixels. @default 64 */
  thumbnailSize?: number;
  /** Gap between thumbnails in pixels. @default 8 */
  thumbnailGap?: number;
  /** Whether to show next/prev arrows on main image. @default true */
  showNavigationArrows?: boolean;
  /** Whether to enable full-screen lightbox when clicking main image. @default true */
  enableLightbox?: boolean;
  /** Props forwarded to the underlying ImageZoom component */
  zoomProps?: Partial<ImageZoomProps>;
  /** Custom class for the thumbnail list container */
  thumbnailsClassName?: string;
  /** Custom class for each thumbnail item */
  thumbnailItemClassName?: string;
  /** Badge / discount overlay on top of main image */
  badge?: React.ReactNode;
}

export interface ImageZoomLightboxProps {
  /** Whether the lightbox dialog is currently open */
  isOpen: boolean;
  /** Callback to close the lightbox */
  onClose: () => void;
  /** Images to display in the lightbox */
  images: GalleryImage[];
  /** Currently active image index */
  initialIndex?: number;
}
