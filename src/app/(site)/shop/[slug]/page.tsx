import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { and, eq, ne, or } from "drizzle-orm";
import { db, schema } from "@/db";
import { BUSINESS } from "@/lib/constants";
import { cloudinaryBlurUrl } from "@/lib/cloudinary-blur";
import { brandSlug, toProductCards } from "@/lib/collections";
import { TESTIMONIALS } from "@/lib/testimonials";
import AddToCartPanel from "@/components/site/AddToCartPanel";
import ProductCard from "@/components/site/ProductCard";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import TestimonialGallery from "@/components/site/TestimonialGallery";

// generateMetadata and the page body both need the product. cache() keeps that
// to a single query per request.
const getProduct = cache(async (slug: string) =>
  db.query.products.findFirst({
    where: eq(schema.products.slug, slug),
    with: {
      images: { orderBy: (img, { asc }) => [asc(img.position)] },
      variants: { orderBy: (v, { asc }) => [asc(v.sizeMl)] },
    },
  })
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product || !product.isActive) {
    return { title: "Product Not Found" };
  }

  const prices = product.variants.map((v) => v.price);
  const from = prices.length ? `From Rs. ${Math.min(...prices).toLocaleString("en-LK")}. ` : "";

  // Falls back to a built sentence rather than repeating the site-wide
  // description, which would make every product page look duplicate.
  const description = product.description?.trim()
    ? `${from}${product.description.trim()}`.slice(0, 300)
    : `${from}${product.brand} ${product.name} ${product.concentration}, available as a decant or a full bottle from Elarenza. Islandwide delivery across Sri Lanka.`;

  const image = product.images[0]?.url;

  return {
    title: `${product.name} by ${product.brand}`,
    description,
    alternates: { canonical: `/shop/${product.slug}` },
    openGraph: {
      type: "website",
      title: `${product.name} by ${product.brand} | Elarenza`,
      description,
      url: `${BUSINESS.siteUrl}/shop/${product.slug}`,
      ...(image ? { images: [{ url: image, alt: product.name }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} by ${product.brand}`,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product || !product.isActive) notFound();

  const mainImage = product.images[0]?.url ?? null;
  const genderLabel =
    product.gender === "UNISEX" ? "Unisex" : product.gender === "MALE" ? "For Him" : "For Her";

  // Same house first, then anything else aimed at the same person. Gives every
  // product page outbound links into the catalogue instead of being a dead end.
  const relatedPool = await db.query.products.findMany({
    where: and(
      eq(schema.products.isActive, true),
      ne(schema.products.id, product.id),
      or(
        eq(schema.products.brand, product.brand),
        eq(schema.products.gender, product.gender)
      )
    ),
    with: {
      images: { orderBy: (img, { asc }) => [asc(img.position)], limit: 1 },
      variants: true,
    },
    limit: 12,
  });

  const related = toProductCards(
    [...relatedPool].sort((a, b) => {
      const aSameBrand = a.brand === product.brand ? 0 : 1;
      const bSameBrand = b.brand === product.brand ? 0 : 1;
      return aSameBrand - bSameBrand;
    })
  ).slice(0, 4);

  const mainBlur = cloudinaryBlurUrl(mainImage);

  // Four WhatsApp messages rather than the written reviews, which are about
  // the shop rather than this fragrance. Offset by the slug so neighbouring
  // product pages do not all show the same four.
  const offset =
    [...product.slug].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % TESTIMONIALS.length;
  const productTestimonials = [
    ...TESTIMONIALS.slice(offset),
    ...TESTIMONIALS.slice(0, offset),
  ].slice(0, 4);
  const prices = product.variants.map((v) => v.price);
  const inStock = product.variants.some((v) => v.stock > 0);

  // Deliberately carries no aggregateRating: the reviews this site collects
  // are about Elarenza as a shop, not about any one fragrance, and attaching
  // them to a product would be a misrepresentation to search engines.
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.id,
    category: "Perfume",
    brand: { "@type": "Brand", name: product.brand },
    ...(product.images.length ? { image: product.images.map((img) => img.url) } : {}),
    ...(prices.length
      ? {
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: "LKR",
            lowPrice: Math.min(...prices),
            highPrice: Math.max(...prices),
            offerCount: prices.length,
            availability: inStock
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            url: `${BUSINESS.siteUrl}/shop/${product.slug}`,
            seller: { "@type": "Organization", name: BUSINESS.name },
          },
        }
      : {}),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        // Values come from our own database, and JSON.stringify escapes them.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      <Breadcrumbs
        items={[
          { name: "Shop", href: "/shop" },
          { name: product.brand, href: `/brands/${brandSlug(product.brand)}` },
          { name: product.name },
        ]}
      />
      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <div className="aspect-square overflow-hidden rounded-2xl bg-cream-soft">
            {mainImage ? (
              <Image
                src={mainImage}
                alt={product.name}
                width={600}
                height={600}
                sizes="(min-width: 768px) 50vw, 100vw"
                {...(mainBlur
                  ? { placeholder: "blur" as const, blurDataURL: mainBlur }
                  : {})}
                className="h-full w-full object-cover"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-serif text-6xl text-gold-light">
                E
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-3">
              {product.images.slice(1).map((img) => (
                <div key={img.id} className="h-20 w-20 overflow-hidden rounded-lg bg-cream-soft">
                  <Image src={img.url} alt="" width={80} height={80} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-gold-dark">
            {product.brand} · {genderLabel}
          </p>
          <h1 className="mt-2 font-serif text-4xl text-ink">{product.name}</h1>
          <p className="mt-1 text-sm text-ink-soft">{product.concentration}</p>

          <p className="mt-5 leading-relaxed text-ink-soft">{product.description}</p>

          {(product.topNotes || product.middleNotes || product.baseNotes) && (
            <div className="mt-6 grid grid-cols-3 gap-4 rounded-xl border border-gold-light/40 bg-cream-soft p-4 text-sm">
              {product.topNotes && (
                <div>
                  <p className="font-semibold text-ink">Top</p>
                  <p className="text-ink-soft">{product.topNotes}</p>
                </div>
              )}
              {product.middleNotes && (
                <div>
                  <p className="font-semibold text-ink">Middle</p>
                  <p className="text-ink-soft">{product.middleNotes}</p>
                </div>
              )}
              {product.baseNotes && (
                <div>
                  <p className="font-semibold text-ink">Base</p>
                  <p className="text-ink-soft">{product.baseNotes}</p>
                </div>
              )}
            </div>
          )}

          <div className="mt-8">
            <AddToCartPanel
              productId={product.id}
              slug={product.slug}
              name={product.name}
              imageUrl={mainImage}
              variants={product.variants.map((v) => ({
                ...v,
                type: v.type as "DECANT" | "FULL_BOTTLE",
              }))}
            />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16 border-t border-gold-light/40 pt-10">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="font-serif text-2xl text-ink">You may also like</h2>
            <Link
              href={`/brands/${brandSlug(product.brand)}`}
              className="text-sm font-medium text-gold-dark hover:underline"
            >
              More from {product.brand}
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.slug} product={item} />
            ))}
          </div>
        </section>
      )}

      {productTestimonials.length > 0 && (
        <section className="mt-16 border-t border-line pt-12">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <p className="eyebrow">Customer Experiences</p>
              <h2 className="mt-3 font-serif text-2xl text-ink sm:text-3xl">
                What customers say
              </h2>
            </div>
            <Link
              href="/feedback"
              className="text-sm font-medium text-gold-dark underline-offset-4 hover:underline"
            >
              See all messages →
            </Link>
          </div>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">
            Messages customers sent us on WhatsApp after their orders arrived.
            Tap any one to read it in full.
          </p>

          <div className="mt-8">
            <TestimonialGallery items={productTestimonials} columns={4} />
          </div>
        </section>
      )}
    </div>
  );
}
