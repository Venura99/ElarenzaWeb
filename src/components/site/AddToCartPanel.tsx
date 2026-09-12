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

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-sm font-medium text-ink-soft">Select Size</p>
        <div className="flex flex-wrap gap-2">
          {variants.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setVariantId(v.id)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                v.id === selected.id
                  ? "border-gold bg-gold text-white"
                  : "border-gold-light/60 text-ink-soft hover:border-gold"
              } ${v.stock <= 0 ? "opacity-40" : ""}`}
            >
              {variantLabel(v.type, v.sizeMl)}
              {v.stock <= 0 ? " (Sold out)" : ""}
            </button>
          ))}
        </div>
      </div>

      <p className="font-serif text-3xl text-gold-dark">{formatLKR(selected.price)}</p>

      <div className="flex items-center gap-4">
        <div className="flex items-center rounded-full border border-gold-light/60">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="h-10 w-10 text-lg text-ink-soft"
          >
            −
          </button>
          <span className="w-8 text-center text-sm">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="h-10 w-10 text-lg text-ink-soft"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={outOfStock}
          className="flex-1 rounded-full bg-ink py-3 text-sm font-semibold uppercase tracking-wide text-cream transition hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {outOfStock ? "Sold Out" : justAdded ? "Added ✓" : "Add to Cart"}
        </button>
      </div>

      {justAdded && (
        <button
          type="button"
          onClick={() => router.push("/cart")}
          className="w-full rounded-full border border-gold px-4 py-2 text-sm text-gold-dark hover:bg-gold hover:text-white"
        >
          View Cart
        </button>
      )}
    </div>
  );
}
