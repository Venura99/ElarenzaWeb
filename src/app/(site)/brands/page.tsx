import type { Metadata } from "next";
import Link from "next/link";
import { brandSlug } from "@/lib/collections";
import { getBrands } from "@/lib/catalog";
import Breadcrumbs from "@/components/site/Breadcrumbs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Perfume Brands in Sri Lanka",
  description:
    "Every perfume brand stocked at Elarenza — Lattafa, Afnan, Rasasi, Azzaro and more, available as decants or full bottles with islandwide delivery in Sri Lanka.",
  alternates: { canonical: "/brands" },
};

export default async function BrandsPage() {
  const brands = await getBrands();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Breadcrumbs items={[{ name: "Shop", href: "/shop" }, { name: "Brands" }]} />

      <h1 className="font-serif text-4xl text-ink">Brands We Carry</h1>
      <p className="mt-3 max-w-2xl leading-relaxed text-ink-soft">
        Designer and niche houses, all available as decants to try before you
        commit to a full bottle.
      </p>

      {brands.length === 0 ? (
        <p className="mt-12 rounded-2xl border border-dashed border-gold-light/60 p-10 text-center text-ink-soft">
          No brands listed yet — please check back soon.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {brands.map((brand) => (
            <Link
              key={brand}
              href={`/brands/${brandSlug(brand)}`}
              className="rounded-2xl border border-gold-light/40 bg-white p-6 text-center transition hover:border-gold hover:shadow-lg"
            >
              <span className="font-serif text-lg text-ink">{brand}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
