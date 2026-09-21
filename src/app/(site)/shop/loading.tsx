import ProductGridSkeleton from "@/components/site/ProductGridSkeleton";

export default function ShopLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-serif text-4xl text-ink">Shop All Perfumes</h1>
      <p className="mt-2 text-ink-soft">
        Decants and full bottles, curated for every scent lover.
      </p>
      <div className="mt-8">
        <ProductGridSkeleton />
      </div>
    </div>
  );
}
