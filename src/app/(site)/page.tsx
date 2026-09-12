import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard, { type ProductCardData } from "@/components/site/ProductCard";

const FEATURES = [
  { title: "Premium Quality", desc: "Authentic fragrances, sourced with care." },
  { title: "Carefully Decanted", desc: "Hygienic, precise decanting into travel-friendly bottles." },
  { title: "Made For You", desc: "Pick your size — try before committing to a full bottle." },
  { title: "Islandwide Delivery", desc: "Delivered to your doorstep, anywhere in Sri Lanka." },
];

export default async function HomePage() {
  const products = await prisma.product.findMany({
    where: { isActive: true, featured: true },
    include: { images: { orderBy: { position: "asc" }, take: 1 }, variants: true },
    take: 8,
    orderBy: { createdAt: "desc" },
  });

  const cards: ProductCardData[] = products.map((p) => ({
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    gender: p.gender,
    imageUrl: p.images[0]?.url ?? null,
    minPrice: p.variants.length ? Math.min(...p.variants.map((v) => v.price)) : null,
  }));

  return (
    <div>
      <section className="relative overflow-hidden bg-ink">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 md:grid-cols-2 md:py-28">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gold">
              Premium Perfume Decants &amp; Full Bottles
            </p>
            <h1 className="mt-4 font-serif text-4xl leading-tight text-cream sm:text-5xl">
              Find Your <span className="text-gold-light">Signature</span> Scent
            </h1>
            <p className="mt-5 max-w-md text-cream/70">
              Explore a curated collection of luxury fragrances, available as
              affordable decants or full bottles — delivered islandwide across
              Sri Lanka.
            </p>
            <div className="mt-8 flex gap-4">
              <Link
                href="/shop"
                className="rounded-full bg-gold px-6 py-3 text-sm font-semibold uppercase tracking-wide text-ink transition hover:bg-gold-light"
              >
                Shop Now
              </Link>
              <Link
                href="/about"
                className="rounded-full border border-cream/30 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-cream transition hover:bg-white/10"
              >
                Learn More
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="mx-auto flex h-72 w-72 items-center justify-center rounded-full border border-gold/40">
              <div className="flex h-56 w-56 items-center justify-center rounded-full border border-gold/60 font-serif text-6xl text-gold-light">
                E
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-gold-light/40 bg-cream-soft">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="text-center">
              <p className="font-serif text-lg text-ink">{f.title}</p>
              <p className="mt-1 text-xs text-ink-soft">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-gold-dark">
              Featured
            </p>
            <h2 className="mt-1 font-serif text-3xl text-ink">Our Signature Picks</h2>
          </div>
          <Link href="/shop" className="text-sm font-medium text-gold-dark hover:underline">
            View All →
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
    </div>
  );
}
