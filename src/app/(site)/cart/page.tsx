"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { formatLKR } from "@/lib/format";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <p className="eyebrow">Your Cart</p>
        <h1 className="mt-3 font-serif text-3xl text-ink sm:text-4xl">
          Nothing here yet
        </h1>
        <p className="mx-auto mt-4 max-w-sm leading-relaxed text-ink-soft">
          Browse the collection and find your signature scent — start with a
          decant if you&apos;re trying something new.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/shop" className="btn btn-primary">
            Shop All Perfumes
          </Link>
          <Link href="/collections/decants" className="btn btn-outline">
            Browse Decants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <p className="eyebrow">Your Cart</p>
      <h1 className="mt-3 font-serif text-3xl text-ink sm:text-4xl">
        {items.length} {items.length === 1 ? "item" : "items"}
      </h1>

      <div className="mt-8 divide-y divide-line rounded-lg border border-line bg-paper">
        {items.map((item) => (
          <div
            key={item.variantId}
            className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4"
          >
            <div className="flex items-start gap-3 sm:flex-1 sm:items-center sm:gap-4">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-cream-soft sm:h-20 sm:w-20">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-serif text-2xl text-gold-light">
                    E
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <Link
                  href={`/shop/${item.slug}`}
                  className="font-medium text-ink hover:text-gold-dark"
                >
                  {item.name}
                </Link>
                <p className="text-sm text-ink-soft">{item.variantLabel}</p>
                <p className="mt-1 text-sm font-semibold text-gold-dark">
                  {formatLKR(item.price)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => removeItem(item.variantId)}
                aria-label={`Remove ${item.name} from cart`}
                className="-mt-1 shrink-0 px-1 text-xl leading-none text-red-500 hover:text-red-700 sm:hidden"
              >
                ×
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 sm:justify-end sm:gap-4">
              {/* 40px targets so these are usable with a thumb. */}
              <div className="flex items-center rounded-md border border-line-strong">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                  aria-label={`Decrease quantity of ${item.name}`}
                  className="h-10 w-10 text-lg leading-none text-ink-soft transition hover:bg-cream-soft hover:text-ink"
                >
                  −
                </button>
                <span
                  aria-live="polite"
                  className="w-9 text-center text-sm font-medium tabular-nums text-ink"
                >
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                  aria-label={`Increase quantity of ${item.name}`}
                  className="h-10 w-10 text-lg leading-none text-ink-soft transition hover:bg-cream-soft hover:text-ink"
                >
                  +
                </button>
              </div>

              <p className="font-medium text-ink sm:w-24 sm:text-right">
                {formatLKR(item.price * item.quantity)}
              </p>

              <button
                type="button"
                onClick={() => removeItem(item.variantId)}
                aria-label={`Remove ${item.name} from cart`}
                className="hidden shrink-0 px-1 text-xl leading-none text-red-500 hover:text-red-700 sm:block"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-5 rounded-lg border border-line bg-cream-soft p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
        <div>
          <p className="text-[0.6875rem] uppercase tracking-[0.16em] text-ink-muted">
            Subtotal
          </p>
          <p className="mt-1 font-serif text-3xl text-ink">{formatLKR(subtotal)}</p>
          <p className="mt-2 text-xs text-ink-soft">
            Delivery calculated at checkout. Cash on delivery available.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:items-end">
          <Link href="/checkout" className="btn btn-primary w-full sm:w-auto">
            Proceed to Checkout
          </Link>
          <Link
            href="/shop"
            className="text-center text-sm text-ink-soft underline-offset-4 hover:text-ink hover:underline"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
