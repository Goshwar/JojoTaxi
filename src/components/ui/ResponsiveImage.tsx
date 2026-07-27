import React from 'react';
import { OPTIMIZED_IMAGES } from '../../data/optimizedImages';

interface ResponsiveImageProps {
  /**
   * Original source path, e.g. "/Images/Marigot 1.jpg". Call sites keep using
   * the familiar name; the generated manifest resolves it to the variants.
   */
  src: string;
  alt: string;
  /**
   * The `sizes` attribute — how wide this image will actually be laid out.
   * Getting it right is what makes `srcset` work: the browser picks a rung
   * from this value BEFORE layout, so a wrong `sizes` means the wrong file is
   * downloaded no matter how good the ladder is. Defaults to `100vw`, which is
   * correct only for full-bleed images, so pass it for anything narrower.
   */
  sizes?: string;
  className?: string;
  style?: React.CSSProperties;
  /**
   * Set on the one image that is the page's largest contentful paint. It loads
   * eagerly at high priority; everything else is lazy and low priority.
   *
   * Exactly one image per route should carry this. Marking several defeats the
   * purpose — priority hints only help by creating contrast.
   */
  priority?: boolean;
  /** Escape hatch for a decorative image that should not be lazy-loaded. */
  loading?: 'eager' | 'lazy';
}

/**
 * Emits a `<picture>` with an AVIF ladder and a JPEG/PNG fallback ladder, plus
 * the intrinsic `width`/`height` so the browser can reserve the right box
 * before bytes arrive (no layout shift, and Lighthouse's unsized-images audit
 * passes).
 *
 * If `src` is missing from the manifest the component degrades to a plain
 * `<img>` pointing at the original path, so adding a photo without running
 * `npm run images` shows an unoptimized image rather than a broken one.
 */
const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  sizes = '100vw',
  className,
  style,
  priority = false,
  loading,
}) => {
  const variant = OPTIMIZED_IMAGES[src];

  // React drops unknown camelCase DOM props, so fetchpriority has to be spread
  // as the lowercase attribute the browser actually reads.
  const priorityAttrs = priority
    ? { fetchpriority: 'high' }
    : { fetchpriority: 'low' };

  const shared = {
    alt,
    className,
    style,
    loading: loading ?? (priority ? ('eager' as const) : ('lazy' as const)),
    decoding: priority ? ('sync' as const) : ('async' as const),
    ...priorityAttrs,
  };

  if (!variant) {
    return <img src={src} {...shared} />;
  }

  const srcSet = (widths: number[], ext: string) =>
    widths.map((w) => `${variant.base}-${w}${ext} ${w}w`).join(', ');

  return (
    <picture>
      <source type="image/avif" srcSet={srcSet(variant.widths, '.avif')} sizes={sizes} />
      <img
        src={`${variant.base}-${variant.fallbackWidth}${variant.ext}`}
        srcSet={srcSet(variant.fallbackWidths, variant.ext)}
        sizes={sizes}
        width={variant.width}
        height={variant.height}
        {...shared}
      />
    </picture>
  );
};

export default ResponsiveImage;
