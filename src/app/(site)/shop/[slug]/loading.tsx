export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="grid gap-10 md:grid-cols-2">
        <div className="aspect-square animate-pulse rounded-2xl bg-cream-soft" />
        <div className="space-y-4">
          <div className="h-3 w-1/3 animate-pulse rounded bg-cream-soft" />
          <div className="h-10 w-3/4 animate-pulse rounded bg-cream-soft" />
          <div className="h-3 w-1/4 animate-pulse rounded bg-cream-soft" />
          <div className="space-y-2 pt-3">
            <div className="h-3 w-full animate-pulse rounded bg-cream-soft" />
            <div className="h-3 w-full animate-pulse rounded bg-cream-soft" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-cream-soft" />
          </div>
          <div className="h-24 animate-pulse rounded-xl bg-cream-soft" />
          <div className="h-12 w-1/3 animate-pulse rounded-full bg-cream-soft" />
          <div className="h-12 animate-pulse rounded-full bg-cream-soft" />
        </div>
      </div>
    </div>
  );
}
