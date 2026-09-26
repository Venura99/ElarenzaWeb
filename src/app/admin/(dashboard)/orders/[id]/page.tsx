import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { formatLKR } from "@/lib/format";
import { updateOrderStatusAction } from "../actions";
import { toWhatsAppNumber } from "@/lib/phone";
import SubmitButton from "@/components/admin/SubmitButton";

const STATUS_OPTIONS = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "COMPLETED",
  "CANCELLED",
];

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await db.query.orders.findFirst({
    where: eq(schema.orders.id, id),
    with: { items: true },
  });

  if (!order) notFound();

  const boundAction = updateOrderStatusAction.bind(null, order.id);

  return (
    <div>
      <h1 className="font-serif text-3xl text-ink">Order {order.orderNumber}</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-gold-light/50 bg-white p-6">
          <h2 className="font-serif text-xl text-ink">Items</h2>
          <div className="mt-4 divide-y divide-gold-light/30">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium text-ink">{item.productName}</p>
                  <p className="text-ink-soft">
                    {item.variantLabel} × {item.quantity}
                  </p>
                </div>
                <p className="font-medium text-ink">{formatLKR(item.lineTotal)}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between border-t border-gold-light/40 pt-4 font-serif text-lg text-ink">
            <span>Total</span>
            <span>{formatLKR(order.totalAmount)}</span>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-gold-light/50 bg-white p-6">
            <h2 className="font-serif text-xl text-ink">Customer</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div>
                <dt className="text-ink-soft">Name</dt>
                <dd className="font-medium text-ink">{order.customerName}</dd>
              </div>
              <div>
                <dt className="text-ink-soft">Phone</dt>
                <dd className="font-medium text-ink">{order.phone}</dd>
              </div>
              <div>
                <dt className="text-ink-soft">Address</dt>
                <dd className="font-medium text-ink">
                  {order.address}, {order.city}, {order.district}
                </dd>
              </div>
              {order.notes && (
                <div>
                  <dt className="text-ink-soft">Notes</dt>
                  <dd className="font-medium text-ink">{order.notes}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="rounded-2xl border border-gold-light/50 bg-white p-6">
            <h2 className="font-serif text-xl text-ink">Status</h2>
            <form action={boundAction} className="mt-3 flex gap-2">
              <select
                name="status"
                defaultValue={order.status}
                className="flex-1 rounded-lg border border-gold-light/60 px-3 py-2 text-sm"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <SubmitButton
                pendingLabel="Saving"
                className="flex items-center justify-center rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-cream hover:bg-gold-dark disabled:opacity-60"
              >
                Update
              </SubmitButton>
            </form>
          </div>

          <a
            href={`https://wa.me/${toWhatsAppNumber(order.phone)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-2xl border border-gold-light/50 bg-white p-4 text-center text-sm font-medium text-gold-dark hover:bg-cream-soft"
          >
            Message Customer on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
