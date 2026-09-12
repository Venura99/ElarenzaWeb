"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatLKR } from "@/lib/format";
import { SRI_LANKA_DISTRICTS } from "@/lib/constants";
import { placeOrderAction } from "./actions";

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <h1 className="font-serif text-3xl text-ink">Nothing to Checkout</h1>
        <p className="mt-3 text-ink-soft">Your cart is empty.</p>
        <Link
          href="/shop"
          className="mt-6 inline-block rounded-full bg-ink px-6 py-3 text-sm font-semibold uppercase tracking-wide text-cream hover:bg-gold-dark"
        >
          Shop Now
        </Link>
      </div>
    );
  }

  function handleSubmit(formData: FormData) {
    setError(null);
    formData.set(
      "itemsJson",
      JSON.stringify(items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })))
    );

    startTransition(async () => {
      const result = await placeOrderAction(formData);
      if (!result.success) {
        setError(result.error);
        return;
      }
      clearCart();
      router.push(`/order-confirmation/${result.orderNumber}`);
    });
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="font-serif text-3xl text-ink">Checkout</h1>
      <p className="mt-2 text-ink-soft">
        Submit your order details below. We&apos;ll confirm availability and payment via
        WhatsApp or phone call.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <form action={handleSubmit} className="space-y-4 lg:col-span-2">
          {error && (
            <p className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-soft">Full Name *</label>
            <input name="customerName" required className="input" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink-soft">
                Phone Number *
              </label>
              <input
                name="phone"
                type="tel"
                required
                placeholder="07XXXXXXXX"
                className="input"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink-soft">District *</label>
              <select name="district" required className="input" defaultValue="">
                <option value="" disabled>
                  Select district
                </option>
                {SRI_LANKA_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-soft">City / Town *</label>
            <input name="city" required className="input" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-soft">
              Delivery Address *
            </label>
            <textarea name="address" required rows={3} className="input" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-soft">
              Order Notes (optional)
            </label>
            <textarea name="notes" rows={2} className="input" />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-full bg-ink py-3.5 text-sm font-semibold uppercase tracking-wide text-cream transition hover:bg-gold-dark disabled:opacity-60"
          >
            {isPending ? "Placing Order..." : "Place Order"}
          </button>

          <style jsx global>{`
            .input {
              width: 100%;
              border: 1px solid rgba(198, 161, 91, 0.4);
              border-radius: 0.5rem;
              padding: 0.6rem 0.85rem;
              font-size: 0.9rem;
              background: white;
            }
            .input:focus {
              outline: none;
              border-color: var(--color-gold);
            }
          `}</style>
        </form>

        <div className="h-fit rounded-2xl border border-gold-light/40 bg-cream-soft p-6">
          <h2 className="font-serif text-xl text-ink">Order Summary</h2>
          <div className="mt-4 space-y-3 text-sm">
            {items.map((item) => (
              <div key={item.variantId} className="flex justify-between">
                <span className="text-ink-soft">
                  {item.name} ({item.variantLabel}) × {item.quantity}
                </span>
                <span className="font-medium text-ink">
                  {formatLKR(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between border-t border-gold-light/40 pt-4 font-serif text-lg text-ink">
            <span>Total</span>
            <span>{formatLKR(subtotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
