"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { formatLKR, variantLabel } from "@/lib/format";

type Variant = {
  id: string;
  type: "DECANT" | "FULL_BOTTLE";
  sizeMl: number;
  price: number;
  stock: number;
};

export default function AddToCartPanel({
  productId,
  slug,
  name,
  imageUrl,
  variants,
}: {
  productId: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  variants: Variant[];
}) {
  const { addItem } = useCart();
  const router = useRouter();
  const [variantId, setVariantId] = useState(variants[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const selected = useMemo(
    () => variants.find((v) => v.id === variantId) ?? variants[0],
    [variantId, variants]
  );

  if (!selected) {
    return <p className="text-ink-soft">This product is currently unavailable.</p>;
  }

  const outOfStock = selected.stock <= 0;

  function handleAdd() {
    if (!selected || outOfStock) return;
    addItem(
      {
        productId,
        slug,
        name,
        image: imageUrl,
        variantId: selected.id,
        variantLabel: variantLabel(selected.type, selected.sizeMl),
        price: selected.price,
      },
      quantity
    );
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  }

  // Nobody should have to click each size to find out what it costs.
  return (
    <div className="space-y-6">
      <div>
        <p className="label">Select size</p>
        <div
          role="radiogroup"
          aria-label="Select size"
          className="grid gap-2 sm:grid-cols-2"
        >
          {variants.map((v) => {
            const isSelected = v.id === selected.id;
            const soldOut = v.stock <= 0;
            return (
              <button
                key={v.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={soldOut}
                onClick={() => {
                  setVariantId(v.id);
                  setQuantity(1);
                }}
                className={`flex items-center justify-between rounded-md border px-4 py-3 text-left transition ${
                  isSelected
                    ? "border-ink bg-ink text-cream"
                    : "border-line-strong text-ink hover:border-ink"
                } ${soldOut ? "cursor-not-allowed opacity-45" : ""}`}
              >
                <span className="text-sm font-medium">
                  {variantLabel(v.type, v.sizeMl)}
                  {soldOut && (
                    <span className="ml-1 text-xs font-normal">· Sold out</span>
                  )}
                </span>
                <span
                  className={`text-sm font-semibold ${
                    isSelected ? "text-gold-light" : "text-ink"
                  }`}
                >
                  {formatLKR(v.price)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-baseline gap-3 border-y border-line py-4">
        <p className="font-serif text-3xl text-ink">{formatLKR(selected.price)}</p>
        <p className="text-sm text-ink-muted">
          {variantLabel(selected.type, selected.sizeMl)}
        </p>
      </div>

      {!outOfStock && selected.stock <= 5 && (
        <p className="text-sm font-medium text-gold-dark">
          Only {selected.stock} left in stock
        </p>
      )}

      <div className="flex items-stretch gap-3">
        <div className="flex items-center rounded-md border border-line-strong">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
            disabled={quantity <= 1}
            className="h-12 w-11 text-lg leading-none text-ink-soft transition hover:bg-cream-soft hover:text-ink disabled:opacity-40"
          >
            −
          </button>
          <span
            aria-live="polite"
            className="w-9 text-center text-sm font-medium tabular-nums text-ink"
          >
            {quantity}
          </span>
          <button
            type="button"
            // Never let someone add more than we can actually ship.
            onClick={() => setQuantity((q) => Math.min(selected.stock, q + 1))}
            aria-label="Increase quantity"
            disabled={quantity >= selected.stock}
            className="h-12 w-11 text-lg leading-none text-ink-soft transition hover:bg-cream-soft hover:text-ink disabled:opacity-40"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={outOfStock}
          className="btn btn-primary flex-1"
        >
          {outOfStock ? "Sold Out" : justAdded ? "Added to cart ✓" : "Add to Cart"}
        </button>
      </div>

      {justAdded && (
        <button
          type="button"
          onClick={() => router.push("/cart")}
          className="btn btn-outline w-full"
        >
          View Cart &amp; Checkout
        </button>
      )}

      <p className="text-xs leading-relaxed text-ink-muted">
        Cash on delivery available · Islandwide delivery in 2–5 working days
      </p>
    </div>
  );
}
