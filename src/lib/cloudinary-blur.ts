const CLOUDINARY_UPLOAD = "/image/upload/";

/**
 * A tiny, heavily blurred version of a Cloudinary image, for next/image's
 * `placeholder="blur"`.
 *
 * Product cards previously sat as empty cream rectangles until the photo
 * arrived, which on a slow connection is most of the time the customer spends
 * looking at the grid. This gives each card the shape and colour of its
 * fragrance immediately, for roughly a kilobyte.
 *
 * Returns undefined for anything not on Cloudinary, so callers can fall back
 * to no placeholder rather than passing a broken URL.
 */
export function cloudinaryBlurUrl(src: string | null | undefined): string | undefined {
  if (!src || !src.includes("res.cloudinary.com") || !src.includes(CLOUDINARY_UPLOAD)) {
    return undefined;
  }

  const [base, rest] = src.split(CLOUDINARY_UPLOAD);
  return `${base}${CLOUDINARY_UPLOAD}w_24,e_blur:800,q_40,f_auto/${rest}`;
}
