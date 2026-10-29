import { ImageZoom as BaseImageZoom } from "./image-zoom";
import { ImageZoomGallery } from "./image-zoom-gallery";
import { ImageZoomLightbox } from "./image-zoom-lightbox";

// Attach compound subcomponents
export const ImageZoom = Object.assign(BaseImageZoom, {
  Gallery: ImageZoomGallery,
  Lightbox: ImageZoomLightbox,
});

export { ImageZoomGallery, ImageZoomLightbox };
export * from "./types";
