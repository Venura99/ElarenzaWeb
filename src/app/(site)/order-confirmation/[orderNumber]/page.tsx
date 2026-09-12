import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatLKR } from "@/lib/format";
import { buildWhatsAppOrderLink } from "@/lib/whatsapp";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });

  if (!order) notFound();

  const whatsappLink = buildWhatsAppOrderLink({
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    items: order.items,
    totalAmount: order.totalAmount,
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600">
        ✓
      </div>
      <h1 className="mt-6 font-serif text-3xl text-ink">Order Placed Successfully!</h1>
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
        <div className="mt-3 flex justify-between border-t border-gold-light/40 pt-3 font-serif text-lg text-ink">
          <span>Total</span>
          <span>{formatLKR(order.totalAmount)}</span>
        </div>
      </div>

      <p className="mt-6 text-sm text-ink-soft">
        Tap the button below to send us your order on WhatsApp so we can confirm payment
        and delivery details.
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
