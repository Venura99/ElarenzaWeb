import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { brandSlug } from "@/lib/collections";
import { getBrandBySlug, getBrandProducts, getBrands } from "@/lib/catalog";
import ProductCard from "@/components/site/ProductCard";
import Breadcrumbs from "@/components/site/Breadcrumbs";

export const dynamic = "force-dynamic";

const resolveBrand = cache(async (slug: string) => getBrandBySlug(slug));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string }>;
}): Promise<Metadata> {
  const { brand: slug } = await params;
  const brand = await resolveBrand(slug);

  if (!brand) return { title: "Brand Not Found" };

  const description = `Buy authentic ${brand} perfumes in Sri Lanka — available as affordable decants or full bottles, delivered islandwide with cash on delivery.`;

  return {
    title: `${brand} Perfumes in Sri Lanka`,
    description,
    alternates: { canonical: `/brands/${slug}` },
    openGraph: {
      type: "website",
      title: `${brand} Perfumes in Sri Lanka | Elarenza`,
      description,
    },
  };
}

export default async function BrandPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand: slug } = await params;
  const brand = await resolveBrand(slug);

  if (!brand) notFound();

  const [products, allBrands] = await Promise.all([getBrandProducts(brand), getBrands()]);
  const others = allBrands.filter((item) => item !== brand);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Breadcrumbs
        items={[
          { name: "Shop", href: "/shop" },
          { name: "Brands", href: "/brands" },
          { name: brand },
        ]}
      />

      <h1 className="font-serif text-4xl text-ink">{brand}</h1>
      <p className="mt-3 max-w-2xl leading-relaxed text-ink-soft">
        Every {brand} fragrance we carry, available as a decant to try or as a
        full bottle. Delivered islandwide across Sri Lanka.
      </p>

      {products.length === 0 ? (
        <p className="mt-12 rounded-2xl border border-dashed border-gold-light/60 p-10 text-center text-ink-soft">
          Nothing from {brand} in stock right now — please check back soon.
        </p>
      ) : (
        <>
          <p className="mt-6 text-sm text-ink-soft">
            {products.length} {products.length === 1 ? "fragrance" : "fragrances"}
          </p>
          <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </>
      )}

      {others.length > 0 && (
        <div className="mt-16 border-t border-gold-light/40 pt-8">
          <h2 className="font-serif text-xl text-ink">Other brands we carry</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {others.map((item) => (
              <Link
                key={item}
                href={`/brands/${brandSlug(item)}`}
                className="rounded-full border border-gold-light/60 px-4 py-1.5 text-sm text-ink-soft transition hover:border-gold hover:text-gold-dark"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
