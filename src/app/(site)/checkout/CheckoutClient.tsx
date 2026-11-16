"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatLKR } from "@/lib/format";
import { SRI_LANKA_DISTRICTS } from "@/lib/constants";
import Spinner from "@/components/site/Spinner";
import PayzyMark from "@/components/site/PayzyMark";
import { placeOrderAction } from "./actions";

export default function CheckoutClient({
  deliveryFee,
  onlinePaymentAvailable,
  payzyFeePercent,
}: {
  deliveryFee: number;
  onlinePaymentAvailable: boolean;
  payzyFeePercent: number;
}) {
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "CARD">(
    onlinePaymentAvailable ? "CARD" : "COD"
  );
  const { items, subtotal, clearCart } = useCart();
  const payableBeforeFee = subtotal + deliveryFee;
  // Mirrors the server calculation; the server's value is authoritative.
  const payzyFee =
    paymentMethod === "CARD"
      ? Math.round((payableBeforeFee * payzyFeePercent) / 100)
      : 0;
  const grandTotal = payableBeforeFee + payzyFee;
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
      if (result.redirectUrl) {
        // Hand off to the payment gateway's hosted page.
        window.location.href = result.redirectUrl;
        return;
      }
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

          {onlinePaymentAvailable && (
            <div className="rounded-xl border border-gold-light/40 bg-white p-4">
              <span className="mb-2 block text-sm font-medium text-ink-soft">
                Payment Method *
              </span>
              <input type="hidden" name="paymentMethod" value={paymentMethod} />

              <label className="flex cursor-pointer items-start gap-3 rounded-lg p-2 hover:bg-cream-soft">
                <input
                  type="radio"
                  checked={paymentMethod === "CARD"}
                  onChange={() => setPaymentMethod("CARD")}
                  className="mt-1"
                />
                <span className="min-w-0">
                  <span className="flex items-center gap-2">
                    <PayzyMark />
                    {payzyFeePercent > 0 && (
                      <span className="rounded-full bg-cream-soft px-2 py-0.5 text-[11px] text-ink-soft">
                        +{payzyFeePercent}% fee
                      </span>
                    )}
                  </span>
                  <span className="mt-1 block text-xs text-ink-soft">
                    Pay by card or in instalments. You&apos;ll be redirected to
                    Payzy&apos;s secure page.
                  </span>
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-lg p-2 hover:bg-cream-soft">
                <input
                  type="radio"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                  className="mt-1"
                />
                <span>
                  <span className="block text-sm font-medium text-ink">Cash on Delivery</span>
                  <span className="block text-xs text-ink-soft">
                    We&apos;ll confirm your order over WhatsApp.
                  </span>
                </span>
              </label>
            </div>
          )}

          {paymentMethod === "CARD" && (
            <div>
              <label className="mb-1 block text-sm font-medium text-ink-soft">
                Email Address *
              </label>
              <input name="email" type="email" required className="input" />
              <p className="mt-1 text-xs text-ink-soft">
                Required by the payment gateway for your receipt.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="flex w-full items-center justify-center rounded-full bg-ink py-3.5 text-sm font-semibold uppercase tracking-wide text-cream transition hover:bg-gold-dark disabled:opacity-60"
          >
            {isPending ? (
              <Spinner label={paymentMethod === "CARD" ? "Redirecting..." : "Placing Order..."} />
            ) : paymentMethod === "CARD" ? (
              `Pay ${formatLKR(grandTotal)}`
            ) : (
              "Place Order"
            )}
          </button>

          <p className="text-center text-xs leading-relaxed text-ink-soft">
            By placing this order you agree to our{" "}
            <Link href="/terms" className="font-medium text-gold-dark hover:underline">
              Terms &amp; Conditions
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="font-medium text-gold-dark hover:underline">
              Privacy Policy
            </Link>
            .
          </p>

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
          <div className="mt-4 space-y-2 border-t border-gold-light/40 pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-soft">Subtotal</span>
              <span className="font-medium text-ink">{formatLKR(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-soft">Delivery</span>
              <span className="font-medium text-ink">
                {deliveryFee > 0 ? formatLKR(deliveryFee) : "Free"}
              </span>
            </div>
            {payzyFee > 0 && (
              <div className="flex justify-between">
                <span className="text-ink-soft">
                  Payzy fee ({payzyFeePercent}%)
                </span>
                <span className="font-medium text-ink">{formatLKR(payzyFee)}</span>
              </div>
            )}
          </div>
          <div className="mt-3 flex justify-between border-t border-gold-light/40 pt-3 font-serif text-lg text-ink">
            <span>Total</span>
            <span>{formatLKR(grandTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
