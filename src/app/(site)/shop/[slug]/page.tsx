import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import AddToCartPanel from "@/components/site/AddToCartPanel";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: { sizeMl: "asc" } },
    },
  });

  if (!product || !product.isActive) notFound();

  const mainImage = product.images[0]?.url ?? null;
  const genderLabel =
    product.gender === "UNISEX" ? "Unisex" : product.gender === "MALE" ? "For Him" : "For Her";

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <div className="aspect-square overflow-hidden rounded-2xl bg-cream-soft">
            {mainImage ? (
              <Image
                src={mainImage}
                alt={product.name}
                width={600}
                height={600}
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
              variants={product.variants}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
