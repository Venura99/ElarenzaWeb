import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { COLLECTIONS, getCollection } from "@/lib/collections";
import { getCollectionProducts } from "@/lib/catalog";
import ProductCard from "@/components/site/ProductCard";
import Breadcrumbs from "@/components/site/Breadcrumbs";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollection(slug);

  if (!collection) return { title: "Collection Not Found" };

  return {
    title: collection.metaTitle,
    description: collection.metaDescription,
    alternates: { canonical: `/collections/${collection.slug}` },
    openGraph: {
      type: "website",
      title: `${collection.metaTitle} | Elarenza`,
      description: collection.metaDescription,
    },
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = getCollection(slug);

  if (!collection) notFound();

  const products = await getCollectionProducts(collection);
  const others = COLLECTIONS.filter((item) => item.slug !== collection.slug);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Breadcrumbs
        items={[{ name: "Shop", href: "/shop" }, { name: collection.name }]}
      />

      <h1 className="font-serif text-4xl text-ink">{collection.heading}</h1>
      <p className="mt-3 max-w-2xl leading-relaxed text-ink-soft">{collection.intro}</p>

      {products.length === 0 ? (
        <p className="mt-12 rounded-2xl border border-dashed border-gold-light/60 p-10 text-center text-ink-soft">
          Nothing in this collection just yet — please check back soon.
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

      <div className="mt-16 border-t border-gold-light/40 pt-8">
        <h2 className="font-serif text-xl text-ink">Browse other collections</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {others.map((item) => (
            <Link
              key={item.slug}
              href={`/collections/${item.slug}`}
              className="rounded-full border border-gold-light/60 px-4 py-1.5 text-sm text-ink-soft transition hover:border-gold hover:text-gold-dark"
            >
              {item.name}
            </Link>
          ))}
          <Link
            href="/shop"
            className="rounded-full border border-gold-light/60 px-4 py-1.5 text-sm text-ink-soft transition hover:border-gold hover:text-gold-dark"
          >
            All Perfumes
          </Link>
        </div>
      </div>
    </div>
  );
}
