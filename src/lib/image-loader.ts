/**
 * Custom next/image loader.
 *
 * Next's built-in optimizer (`/_next/image`) is a no-op on Cloudflare Workers
 * without the Images binding — it was returning every source file untouched,
 * so a 2.3MB product PNG was served at 2.3MB no matter what width was asked
 * for. This loader skips that endpoint entirely:
 *
 *   - Cloudinary already hosts the product photos and resizes on the fly, so
 *     the transformation goes straight into the URL and Cloudflare never
 *     touches the bytes.
 *   - The handful of images we ship ourselves are pre-rendered to WebP at
 *     build time by scripts/optimize-images.js, and the request is mapped to
 *     the smallest variant that covers the requested width.
 *
 * Anything else is passed through unchanged.
 */

type ImageLoaderArgs = {
  src: string;
  width: number;
  quality?: number;
};

const CLOUDINARY_UPLOAD = "/image/upload/";

// Keep in step with SOURCES in scripts/optimize-images.js.
const LOCAL_VARIANTS: Record<string, number[]> = {
  "/images/home-image.png": [640, 960, 1280, 1920],
  "/images/logo.png": [64, 128, 256],
};

export default function elarenzaImageLoader({ src, width, quality }: ImageLoaderArgs): string {
  if (src.includes("res.cloudinary.com") && src.includes(CLOUDINARY_UPLOAD)) {
    const [base, rest] = src.split(CLOUDINARY_UPLOAD);
    const transform = [
      "f_auto", // WebP/AVIF when the browser accepts it
      `q_${quality ?? "auto"}`,
      `w_${width}`,
      "c_limit", // never upscale past the original
    ].join(",");
    return `${base}${CLOUDINARY_UPLOAD}${transform}/${rest}`;
  }

  const variants = LOCAL_VARIANTS[src];
  if (variants) {
    const chosen = variants.find((v) => v >= width) ?? variants[variants.length - 1];
    const name = src.slice("/images/".length).replace(/\.[^.]+$/, "");
    return `/images/optimized/${name}-${chosen}.webp`;
  }

  return src;
}
