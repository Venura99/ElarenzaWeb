export default function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-gold-light/40 bg-white"
        >
          <div className="aspect-square animate-pulse bg-cream-soft" />
          <div className="space-y-2 p-4">
            <div className="h-3 w-1/2 animate-pulse rounded bg-cream-soft" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-cream-soft" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-cream-soft" />
          </div>
        </div>
      ))}
    </div>
  );
}
