import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard, { type ProductCardData } from "@/components/site/ProductCard";
import type { Prisma } from "@prisma/client";

const GENDER_TABS = [
  { value: "", label: "All" },
  { value: "FEMALE", label: "For Her" },
  { value: "MALE", label: "For Him" },
  { value: "UNISEX", label: "Unisex" },
];

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ gender?: string; q?: string }>;
}) {
  const { gender, q } = await searchParams;

  const where: Prisma.ProductWhereInput = { isActive: true };
  if (gender) where.gender = gender as "MALE" | "FEMALE" | "UNISEX";
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { brand: { contains: q } },
    ];
  }

  const products = await prisma.product.findMany({
    where,
    include: { images: { orderBy: { position: "asc" }, take: 1 }, variants: true },
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
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-serif text-4xl text-ink">Shop All Perfumes</h1>
      <p className="mt-2 text-ink-soft">Decants and full bottles, curated for every scent lover.</p>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {GENDER_TABS.map((tab) => {
            const params = new URLSearchParams();
            if (tab.value) params.set("gender", tab.value);
            if (q) params.set("q", q);
            const href = `/shop${params.toString() ? `?${params.toString()}` : ""}`;
            const active = (gender ?? "") === tab.value;
            return (
              <Link
                key={tab.value || "all"}
                href={href}
                className={`rounded-full border px-4 py-1.5 text-sm transition ${
                  active
                    ? "border-gold bg-gold text-white"
                    : "border-gold-light/60 text-ink-soft hover:border-gold"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        <form action="/shop" className="flex gap-2">
          {gender && <input type="hidden" name="gender" value={gender} />}
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search perfumes..."
            className="rounded-full border border-gold-light/60 px-4 py-1.5 text-sm outline-none focus:border-gold"
          />
          <button
            type="submit"
            className="rounded-full bg-ink px-4 py-1.5 text-sm text-cream hover:bg-gold-dark"
          >
            Search
          </button>
        </form>
      </div>

      {cards.length === 0 ? (
        <p className="mt-16 rounded-2xl border border-dashed border-gold-light/60 p-10 text-center text-ink-soft">
          No products found. Please check back soon.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {cards.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
