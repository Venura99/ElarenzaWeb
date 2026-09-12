"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { formatLKR } from "@/lib/format";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <h1 className="font-serif text-3xl text-ink">Your Cart is Empty</h1>
        <p className="mt-3 text-ink-soft">Browse our collection and find your signature scent.</p>
        <Link
          href="/shop"
          className="mt-6 inline-block rounded-full bg-ink px-6 py-3 text-sm font-semibold uppercase tracking-wide text-cream hover:bg-gold-dark"
        >
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="font-serif text-3xl text-ink">Your Cart</h1>

      <div className="mt-8 divide-y divide-gold-light/30 rounded-2xl border border-gold-light/40 bg-white">
        {items.map((item) => (
          <div key={item.variantId} className="flex items-center gap-4 p-4">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-cream-soft">
              {item.image ? (
                <Image src={item.image} alt={item.name} width={80} height={80} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-serif text-2xl text-gold-light">
                  E
                </div>
              )}
            </div>

            <div className="flex-1">
              <Link href={`/shop/${item.slug}`} className="font-medium text-ink hover:text-gold-dark">
                {item.name}
              </Link>
              <p className="text-sm text-ink-soft">{item.variantLabel}</p>
              <p className="mt-1 text-sm font-semibold text-gold-dark">{formatLKR(item.price)}</p>
            </div>

            <div className="flex items-center rounded-full border border-gold-light/60">
              <button
                type="button"
                onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                className="h-9 w-9 text-ink-soft"
              >
                −
              </button>
              <span className="w-8 text-center text-sm">{item.quantity}</span>
              <button
                type="button"
                onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                className="h-9 w-9 text-ink-soft"
              >
                +
              </button>
            </div>

            <p className="w-24 text-right font-medium text-ink">
              {formatLKR(item.price * item.quantity)}
            </p>

            <button
              type="button"
              onClick={() => removeItem(item.variantId)}
              aria-label="Remove item"
              className="text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between rounded-2xl border border-gold-light/40 bg-cream-soft p-6">
        <div>
          <p className="text-sm text-ink-soft">Subtotal</p>
          <p className="font-serif text-2xl text-ink">{formatLKR(subtotal)}</p>
        </div>
        <Link
          href="/checkout"
          className="rounded-full bg-ink px-8 py-3 text-sm font-semibold uppercase tracking-wide text-cream hover:bg-gold-dark"
        >
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}
