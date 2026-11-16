import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { formatLKR } from "@/lib/format";
import { buildWhatsAppOrderLink } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ payment?: string }>;
}) {
  const { orderNumber } = await params;
  const { payment } = await searchParams;
  const order = await db.query.orders.findFirst({
    where: eq(schema.orders.orderNumber, orderNumber),
    with: { items: true },
  });

  if (!order) notFound();

  const whatsappLink = buildWhatsAppOrderLink({
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    phone: order.phone,
    address: order.address,
    city: order.city,
    district: order.district,
    notes: order.notes,
    items: order.items,
    deliveryFee: order.deliveryFee,
    paymentFee: order.paymentFee,
    totalAmount: order.totalAmount,
  });

  const paymentFailed =
    order.paymentMethod === "CARD" && order.paymentStatus !== "PAID";

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
      {paymentFailed ? (
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 text-3xl text-yellow-700">
          !
        </div>
      ) : (
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600">
          ✓
        </div>
      )}

      {order.paymentMethod === "CARD" && order.paymentStatus === "PAID" && (
        <p className="mt-6 rounded-lg bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
          Payment received — thank you!
        </p>
      )}
      {paymentFailed && (
        <p className="mt-6 rounded-lg bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          {payment === "failed"
            ? "Your payment did not go through, so this order is not confirmed yet."
            : "We haven't received your payment yet. If you completed it, it may take a moment to show here."}{" "}
          You can contact us on WhatsApp below and we&apos;ll sort it out.
        </p>
      )}

      <h1 className="mt-6 font-serif text-3xl text-ink">
        {paymentFailed ? "Order Not Yet Confirmed" : "Order Placed Successfully!"}
      </h1>
      <p className="mt-2 text-ink-soft">
        Thank you, {order.customerName}. Your order number is{" "}
        <span className="font-semibold text-gold-dark">{order.orderNumber}</span>.
      </p>

      <div className="mt-8 rounded-2xl border border-gold-light/40 bg-white p-6 text-left">
        <h2 className="font-serif text-xl text-ink">Order Summary</h2>
        <div className="mt-4 divide-y divide-gold-light/30 text-sm">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between py-2">
              <span className="text-ink-soft">
                {item.productName} ({item.variantLabel}) × {item.quantity}
              </span>
              <span className="font-medium text-ink">{formatLKR(item.lineTotal)}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 space-y-2 border-t border-gold-light/40 pt-3 text-sm">
          <div className="flex justify-between">
            <span className="text-ink-soft">Subtotal</span>
            <span className="font-medium text-ink">
              {formatLKR(order.totalAmount - order.deliveryFee - order.paymentFee)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-soft">Delivery</span>
            <span className="font-medium text-ink">
              {order.deliveryFee > 0 ? formatLKR(order.deliveryFee) : "Free"}
            </span>
          </div>
          {order.paymentFee > 0 && (
            <div className="flex justify-between">
              <span className="text-ink-soft">Payzy fee</span>
              <span className="font-medium text-ink">{formatLKR(order.paymentFee)}</span>
            </div>
          )}
        </div>
        <div className="mt-3 flex justify-between border-t border-gold-light/40 pt-3 font-serif text-lg text-ink">
          <span>Total</span>
          <span>{formatLKR(order.totalAmount)}</span>
        </div>
      </div>

      <p className="mt-6 text-sm text-ink-soft">
        {order.paymentStatus === "PAID"
          ? "Your payment is complete — we'll start preparing your order. Message us on WhatsApp if you'd like to add delivery instructions."
          : "Tap the button below to send us your order on WhatsApp so we can confirm payment and delivery details."}
      </p>

      <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white hover:opacity-90 sm:w-auto"
        >
          Confirm on WhatsApp
        </a>
        <Link
          href="/shop"
          className="w-full rounded-full border border-gold px-6 py-3 text-sm font-semibold text-gold-dark hover:bg-gold hover:text-white sm:w-auto"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
