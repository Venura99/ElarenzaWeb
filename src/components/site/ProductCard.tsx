import Link from "next/link";
import Image from "next/image";
import { formatLKR } from "@/lib/format";
import { cloudinaryBlurUrl } from "@/lib/cloudinary-blur";

export type ProductCardData = {
  slug: string;
  name: string;
  brand: string;
  gender: "MALE" | "FEMALE" | "UNISEX";
  imageUrl: string | null;
  minPrice: number | null;
};

const GENDER_LABEL: Record<ProductCardData["gender"], string> = {
  UNISEX: "Unisex",
  MALE: "For Him",
  FEMALE: "For Her",
};

export default function ProductCard({ product }: { product: ProductCardData }) {
  const blurUrl = cloudinaryBlurUrl(product.imageUrl);

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-line bg-paper transition-shadow duration-300 hover:shadow-[var(--shadow-lift)]"
    >
      {/* Fixed ratio so a row of cards aligns whatever the source photo is,
          and so nothing shifts as images arrive. */}
      <div className="relative aspect-[4/5] overflow-hidden bg-cream-soft">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={`${product.brand} ${product.name} perfume`}
            fill
            // The grid is 2 columns on phones and 4 from lg up; without this a
            // phone downloads the same width as a desktop.
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            // Shows the fragrance's shape and colour straight away instead of
            // an empty rectangle while the photo arrives.
            {...(blurUrl ? { placeholder: "blur" as const, blurDataURL: blurUrl } : {})}
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-serif text-4xl text-gold-light">
            E
          </div>
        )}

        <span className="pointer-events-none absolute left-3 top-3 rounded-sm bg-cream/90 px-2 py-1 text-[0.625rem] font-medium uppercase tracking-[0.12em] text-ink-soft backdrop-blur-sm">
          {GENDER_LABEL[product.gender]}
        </span>
      </div>

      {/* mt-auto on the price keeps it on one baseline across the row even
          when a product name wraps to two lines. */}
      <div className="flex flex-1 flex-col p-4">
        <p className="text-[0.6875rem] uppercase tracking-[0.16em] text-ink-muted">
          {product.brand}
        </p>
        <h3 className="mt-1.5 font-serif text-[1.0625rem] leading-snug text-ink">
          {product.name}
        </h3>

        <div className="mt-auto pt-3">
          {product.minPrice !== null ? (
            <p className="text-sm text-ink">
              <span className="text-[0.6875rem] uppercase tracking-[0.12em] text-ink-muted">
                From
              </span>{" "}
              <span className="font-semibold">{formatLKR(product.minPrice)}</span>
            </p>
          ) : (
            <p className="text-sm text-ink-muted">Contact for price</p>
          )}
        </div>
      </div>
    </Link>
  );
}
