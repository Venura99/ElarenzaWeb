import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { and, desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { BUSINESS } from "@/lib/constants";
import { FEATURED_TESTIMONIALS } from "@/lib/testimonials";
import ProductCard, { type ProductCardData } from "@/components/site/ProductCard";
import TestimonialGallery from "@/components/site/TestimonialGallery";

// Reads live data from the database on every request, so it must not be
// prerendered at build time.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const FEATURES = [
  { title: "Premium Quality", desc: "Authentic fragrances, sourced with care." },
  { title: "Carefully Decanted", desc: "Hygienic, precise decanting into travel-friendly bottles." },
  { title: "Made For You", desc: "Pick your size — try before committing to a full bottle." },
  { title: "Islandwide Delivery", desc: "Delivered to your doorstep, anywhere in Sri Lanka." },
];

export default async function HomePage() {
  const products = await db.query.products.findMany({
    where: and(eq(schema.products.isActive, true), eq(schema.products.featured, true)),
    with: {
      images: { orderBy: (img, { asc }) => [asc(img.position)], limit: 1 },
      variants: true,
    },
    limit: 8,
    orderBy: [desc(schema.products.createdAt)],
  });

  const cards: ProductCardData[] = products.map((p) => ({
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    gender: p.gender as ProductCardData["gender"],
    imageUrl: p.images[0]?.url ?? null,
    minPrice: p.variants.length ? Math.min(...p.variants.map((v) => v.price)) : null,
  }));

  // Tells search engines this is a real Sri Lankan shop with a phone number
  // and an address, which is what surfaces a business panel for brand
  // searches. The /shop?q= form lets Google offer a search box for the site.
  const siteJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Store",
        "@id": `${BUSINESS.siteUrl}/#store`,
        name: BUSINESS.name,
        description:
          "Premium perfume decants and full bottles, carefully decanted and delivered islandwide across Sri Lanka.",
        url: BUSINESS.siteUrl,
        image: `${BUSINESS.siteUrl}/icon.png`,
        telephone: `+${BUSINESS.phoneWhatsApp}`,
        priceRange: "Rs. 500 - Rs. 50,000",
        currenciesAccepted: "LKR",
        address: {
          "@type": "PostalAddress",
          streetAddress: BUSINESS.addressLines[0],
          addressLocality: "Wattala",
          postalCode: "11300",
          addressCountry: "LK",
        },
        areaServed: { "@type": "Country", name: "Sri Lanka" },
      },
      {
        "@type": "WebSite",
        "@id": `${BUSINESS.siteUrl}/#website`,
        url: BUSINESS.siteUrl,
        name: BUSINESS.name,
        publisher: { "@id": `${BUSINESS.siteUrl}/#store` },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${BUSINESS.siteUrl}/shop?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
      />
      <section className="relative overflow-hidden bg-ink">
        <Image
          src="/images/home-image.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[72%_center] md:object-right"
        />
        {/* Darker and deeper on phones, where the copy sits over the middle of
            the photograph rather than beside it. */}
        <div className="absolute inset-0 bg-ink/75 md:bg-gradient-to-r md:from-ink md:via-ink/88 md:to-ink/15" />

        <div className="relative mx-auto flex min-h-[30rem] max-w-6xl items-center px-4 py-20 sm:px-6 md:min-h-[34rem] md:py-28">
          <div className="max-w-xl">
            <p className="eyebrow-light">Premium Decants &amp; Full Bottles</p>
            <h1 className="mt-5 font-serif text-[2.5rem] text-cream sm:text-6xl">
              Find Your{" "}
              <span className="italic text-gold-light">Signature</span> Scent
            </h1>
            <p className="mt-6 max-w-md leading-relaxed text-cream/75">
              A curated collection of designer and niche fragrances, available
              as affordable decants or full bottles. Try before you commit —
              delivered islandwide across Sri Lanka.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Link href="/shop" className="btn btn-gold">
                Shop the Collection
              </Link>
              <Link
                href="/collections/decants"
                className="btn border border-cream/25 text-cream transition hover:border-cream/60"
              >
                What is a Decant?
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-cream-soft">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-8 px-4 py-12 sm:px-6 md:grid-cols-4 md:gap-8">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className={`px-1 md:px-6 ${
                i > 0 ? "md:border-l md:border-line" : ""
              }`}
            >
              <p className="font-serif text-[1.0625rem] text-ink">{f.title}</p>
              <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-soft">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="section mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Featured</p>
            <h2 className="mt-3 font-serif text-3xl text-ink sm:text-4xl">
              Our Signature Picks
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-sm font-medium text-gold-dark underline-offset-4 hover:underline"
          >
            View all perfumes →
          </Link>
        </div>

        {cards.length === 0 ? (
          <p className="mt-10 rounded-2xl border border-dashed border-gold-light/60 p-10 text-center text-ink-soft">
            Featured products will appear here once added from the admin panel.
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {cards.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        )}
      </section>

      {FEATURED_TESTIMONIALS.length > 0 && (
        <section className="border-t border-line bg-ink">
          <div className="section mx-auto max-w-6xl px-4 sm:px-6">
            <div className="max-w-2xl">
              <p className="eyebrow-light">Customer Experiences</p>
              <h2 className="mt-3 font-serif text-3xl text-cream sm:text-4xl">
                Real Experiences. Real Fragrances.
              </h2>
              <p className="mt-4 leading-relaxed text-cream/70">
                Don&apos;t just take our word for it. These are messages our
                customers sent us on WhatsApp after their orders arrived —
                shown exactly as they were written, with every personal detail
                removed.
              </p>
            </div>

            <div className="mt-10">
              <TestimonialGallery items={FEATURED_TESTIMONIALS} />
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/feedback"
                className="btn border border-gold/60 text-gold-light transition hover:bg-gold hover:text-white"
              >
                View All Customer Experiences
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
