import Link from "next/link";
import Image from "next/image";
import { formatLKR } from "@/lib/format";

export type ProductCardData = {
  slug: string;
  name: string;
  brand: string;
  gender: "MALE" | "FEMALE" | "UNISEX";
  imageUrl: string | null;
  minPrice: number | null;
};

export default function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group block overflow-hidden rounded-2xl border border-gold-light/40 bg-white transition hover:shadow-lg"
    >
      <div className="aspect-square overflow-hidden bg-cream-soft">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={400}
            height={400}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-serif text-4xl text-gold-light">
            E
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs uppercase tracking-wide text-ink-soft">{product.brand}</p>
        <h3 className="mt-1 font-serif text-lg text-ink">{product.name}</h3>
        <p className="mt-1 text-xs uppercase tracking-wide text-gold-dark">
          {product.gender === "UNISEX" ? "Unisex" : product.gender === "MALE" ? "For Him" : "For Her"}
        </p>
        <p className="mt-2 text-sm font-semibold text-ink">
          {product.minPrice !== null ? `From ${formatLKR(product.minPrice)}` : "Contact for price"}
        </p>
      </div>
    </Link>
  );
}
